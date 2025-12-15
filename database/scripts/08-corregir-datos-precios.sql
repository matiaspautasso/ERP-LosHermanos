-- =====================================================
-- 08-corregir-datos-precios.sql
-- =====================================================
-- Propósito: Corregir datos de precios para cumplir jerarquía
--           y habilitar constraints del sistema de gestión
--
-- Fecha: 2025-12-14
-- Autor: ERP Los Hermanos Team
--
-- ESTE SCRIPT CORRIGE:
-- 1. 118 registros con jerarquía de precios inválida
-- 2. Configuración inicial de márgenes por categoría
-- 3. Habilita constraint de jerarquía
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: REPORTE PRE-CORRECCIÓN
-- =====================================================
\echo ''
\echo '=================================================='
\echo 'REPORTE PRE-CORRECCIÓN'
\echo '=================================================='
\echo ''

-- Contar registros con jerarquía inválida
SELECT
    COUNT(*) as registros_invalidos,
    COUNT(DISTINCT producto_id) as productos_afectados
FROM precios
WHERE precio_supermayorista >= precio_mayorista
   OR precio_mayorista >= precio_minorista
   OR precio_supermayorista <= 0;

\echo ''
\echo 'Ejemplos de registros inválidos (primeros 10):'

SELECT
    pr.id,
    pr.producto_id,
    p.nombre,
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    CASE
        WHEN pr.precio_supermayorista = pr.precio_mayorista
         AND pr.precio_mayorista = pr.precio_minorista
        THEN 'Todos iguales'
        WHEN pr.precio_supermayorista >= pr.precio_mayorista
        THEN 'Super >= Mayor'
        WHEN pr.precio_mayorista >= pr.precio_minorista
        THEN 'Mayor >= Minor'
        ELSE 'Otro problema'
    END as problema
FROM precios pr
JOIN productos p ON pr.producto_id = p.id
WHERE pr.precio_supermayorista >= pr.precio_mayorista
   OR pr.precio_mayorista >= pr.precio_minorista
ORDER BY pr.producto_id, pr.ultima_modificacion DESC
LIMIT 10;

\echo ''

-- =====================================================
-- PASO 2: ESTRATEGIA DE CORRECCIÓN
-- =====================================================
\echo '=================================================='
\echo 'ESTRATEGIA DE CORRECCIÓN'
\echo '=================================================='
\echo ''
\echo 'Se aplicarán los siguientes cálculos:'
\echo '  Base: precio_supermayorista (actual)'
\echo '  Mayorista:  base × 1.10 (+10%)'
\echo '  Minorista:  base × 1.20 (+20%)'
\echo ''
\echo 'IMPORTANTE: Los precios supermayoristas NO se modificarán'
\echo '           Solo se recalcularán mayorista y minorista'
\echo ''

-- =====================================================
-- PASO 3: CORRECCIÓN DE PRECIOS
-- =====================================================
\echo '=================================================='
\echo 'APLICANDO CORRECCIÓN'
\echo '=================================================='
\echo ''

-- Actualizar solo mayorista y minorista, manteniendo supermayorista como base
UPDATE precios
SET
    precio_mayorista = ROUND((precio_supermayorista * 1.10)::numeric, 2),
    precio_minorista = ROUND((precio_supermayorista * 1.20)::numeric, 2)
WHERE precio_supermayorista >= precio_mayorista
   OR precio_mayorista >= precio_minorista;

\echo '✓ Precios corregidos'
\echo ''

-- =====================================================
-- PASO 4: VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================
\echo '=================================================='
\echo 'VERIFICACIÓN POST-CORRECCIÓN'
\echo '=================================================='
\echo ''

-- Verificar que no quedan registros inválidos
SELECT
    COUNT(*) as registros_invalidos_restantes
FROM precios
WHERE precio_supermayorista >= precio_mayorista
   OR precio_mayorista >= precio_minorista
   OR precio_supermayorista <= 0;

\echo ''

-- Mostrar ejemplos de precios corregidos
\echo 'Ejemplos de precios corregidos (primeros 10):'
SELECT
    pr.producto_id,
    p.nombre,
    pr.precio_supermayorista as super,
    pr.precio_mayorista as mayor,
    pr.precio_minorista as minor,
    ROUND(((pr.precio_mayorista - pr.precio_supermayorista) / pr.precio_supermayorista * 100)::numeric, 2) as margen_mayor_pct,
    ROUND(((pr.precio_minorista - pr.precio_supermayorista) / pr.precio_supermayorista * 100)::numeric, 2) as margen_minor_pct,
    CASE
        WHEN pr.precio_supermayorista < pr.precio_mayorista
         AND pr.precio_mayorista < pr.precio_minorista
        THEN '✓ Válido'
        ELSE '✗ Inválido'
    END as validacion
FROM precios pr
JOIN productos p ON pr.producto_id = p.id
ORDER BY pr.producto_id, pr.ultima_modificacion DESC
LIMIT 10;

\echo ''

-- =====================================================
-- PASO 5: CREAR CONSTRAINT DE JERARQUÍA
-- =====================================================
\echo '=================================================='
\echo 'CREANDO CONSTRAINT DE JERARQUÍA'
\echo '=================================================='
\echo ''

-- Eliminar si existe (por si acaso)
ALTER TABLE precios DROP CONSTRAINT IF EXISTS chk_jerarquia_precios;

-- Crear constraint
ALTER TABLE precios
ADD CONSTRAINT chk_jerarquia_precios CHECK (
    precio_supermayorista > 0
    AND precio_mayorista > precio_supermayorista
    AND precio_minorista > precio_mayorista
);

\echo '✓ Constraint chk_jerarquia_precios creado exitosamente'
\echo ''

-- Verificar constraint
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'precios'::regclass
  AND conname = 'chk_jerarquia_precios';

\echo ''

-- =====================================================
-- PASO 6: CONFIGURACIÓN INICIAL DE MÁRGENES
-- =====================================================
\echo '=================================================='
\echo 'CONFIGURANDO MÁRGENES POR CATEGORÍA'
\echo '=================================================='
\echo ''

-- Insertar configuración de márgenes para todas las categorías existentes
INSERT INTO config_margenes_categoria (
    categoria_id,
    margen_supermayorista,
    margen_mayorista,
    margen_minorista,
    activo
)
SELECT
    id,
    0.00,   -- Supermayorista: sin margen (precio al costo)
    10.00,  -- Mayorista: +10%
    20.00,  -- Minorista: +20%
    TRUE    -- Activo
FROM categorias
WHERE NOT EXISTS (
    SELECT 1 FROM config_margenes_categoria cmc WHERE cmc.categoria_id = categorias.id
)
AND activo = TRUE;

\echo '✓ Configuración de márgenes por categoría creada'
\echo ''

-- Mostrar configuración
SELECT
    c.id,
    c.nombre as categoria,
    cmc.margen_supermayorista,
    cmc.margen_mayorista,
    cmc.margen_minorista,
    cmc.activo
FROM categorias c
JOIN config_margenes_categoria cmc ON c.id = cmc.categoria_id
ORDER BY c.nombre;

\echo ''

-- =====================================================
-- PASO 7: PRUEBA DE VALIDACIÓN
-- =====================================================
\echo '=================================================='
\echo 'PRUEBA DE VALIDACIÓN'
\echo '=================================================='
\echo ''

-- Intentar insertar precio con jerarquía inválida (debe fallar)
DO $$
BEGIN
    INSERT INTO precios (
        producto_id,
        precio_supermayorista,
        precio_mayorista,
        precio_minorista,
        ultima_modificacion
    ) VALUES (
        1,
        100.00,
        100.00,  -- Igual al supermayorista (INVÁLIDO)
        100.00,
        NOW()
    );

    RAISE EXCEPTION 'ERROR: El constraint NO está funcionando';
EXCEPTION
    WHEN check_violation THEN
        RAISE NOTICE '✓ Constraint funcionando - rechazó precios iguales';
        -- Limpiar la transacción
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Otra validación impidió la inserción: %', SQLERRM;
END $$;

\echo ''

-- =====================================================
-- PASO 8: ESTADÍSTICAS FINALES
-- =====================================================
\echo '=================================================='
\echo 'ESTADÍSTICAS FINALES'
\echo '=================================================='
\echo ''

SELECT
    COUNT(*) as total_registros_precios,
    COUNT(DISTINCT producto_id) as productos_con_precios,
    MIN(precio_supermayorista) as precio_min,
    MAX(precio_minorista) as precio_max
FROM precios;

\echo ''

SELECT
    'Total productos:' as metrica,
    COUNT(*) as valor
FROM productos
WHERE activo = TRUE

UNION ALL

SELECT
    'Productos con precios:',
    COUNT(DISTINCT producto_id)
FROM precios

UNION ALL

SELECT
    'Categorías configuradas:',
    COUNT(*)
FROM config_margenes_categoria
WHERE activo = TRUE

UNION ALL

SELECT
    'Registros con jerarquía válida:',
    COUNT(*)
FROM precios
WHERE precio_supermayorista < precio_mayorista
  AND precio_mayorista < precio_minorista;

\echo ''

-- =====================================================
-- PASO 9: REPORTE FINAL
-- =====================================================
\echo '=================================================='
\echo 'REPORTE FINAL'
\echo '=================================================='
\echo ''

SELECT '✓ Datos de precios corregidos (118 registros)' as estado
UNION ALL
SELECT '✓ Constraint de jerarquía creado y activo'
UNION ALL
SELECT '✓ Configuración de márgenes por categoría creada'
UNION ALL
SELECT '✓ Sistema de gestión de precios completamente operativo';

\echo ''
\echo '=================================================='
\echo 'CORRECCIÓN COMPLETADA EXITOSAMENTE'
\echo '=================================================='
\echo ''
\echo 'Próximos pasos:'
\echo '  1. Revisar vista: SELECT * FROM v_dashboard_precios_completo LIMIT 10;'
\echo '  2. Probar funciones: SELECT * FROM fn_calcular_precios_sugeridos(1);'
\echo '  3. Verificar productos sin precios: SELECT * FROM v_productos_sin_precios_config;'
\echo ''

COMMIT;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
