-- ================================================================
-- Script: Validación Completa de Precios
-- Propósito: Verificar que todos los productos tengan precios configurados
--            y que la jerarquía sea correcta
-- Fecha: 2025-12-13
-- ================================================================

\echo '=================================================='
\echo 'VALIDACIÓN COMPLETA DE PRECIOS'
\echo '=================================================='
\echo ''

-- 1. Resumen general
\echo '1. RESUMEN GENERAL'
\echo '--------------------------------------------------'
SELECT
    'Total productos activos:' as metrica,
    COUNT(*) as valor
FROM productos
WHERE activo = true

UNION ALL

SELECT
    'Productos con precios:' as metrica,
    COUNT(DISTINCT producto_id) as valor
FROM precios

UNION ALL

SELECT
    'Productos SIN precios:' as metrica,
    COUNT(*) as valor
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id
WHERE p.activo = true AND pr.id IS NULL;

\echo ''

-- 2. Productos sin precios configurados
\echo '2. PRODUCTOS SIN PRECIOS CONFIGURADOS'
\echo '--------------------------------------------------'
SELECT
    p.id,
    p.nombre,
    p.precio_lista,
    c.nombre as categoria
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = true
  AND pr.id IS NULL
ORDER BY p.nombre;

\echo ''

-- 3. Validar jerarquía de precios (Supermayorista ≤ Mayorista ≤ Minorista)
\echo '3. VALIDACIÓN DE JERARQUÍA DE PRECIOS'
\echo '--------------------------------------------------'
WITH precios_actuales AS (
    SELECT DISTINCT ON (producto_id)
        pr.producto_id,
        p.nombre,
        pr.precio_minorista,
        pr.precio_mayorista,
        pr.precio_supermayorista,
        pr.ultima_modificacion
    FROM precios pr
    JOIN productos p ON pr.producto_id = p.id
    WHERE p.activo = true
    ORDER BY pr.producto_id, pr.ultima_modificacion DESC
)
SELECT
    producto_id,
    nombre,
    precio_supermayorista,
    precio_mayorista,
    precio_minorista,
    CASE
        WHEN precio_supermayorista > precio_mayorista THEN '❌ Supermayorista > Mayorista'
        WHEN precio_mayorista > precio_minorista THEN '❌ Mayorista > Minorista'
        ELSE '✅ Correcto'
    END as validacion
FROM precios_actuales
WHERE precio_supermayorista > precio_mayorista
   OR precio_mayorista > precio_minorista
ORDER BY nombre;

\echo ''

-- 4. Detectar duplicados problemáticos (mismo producto, misma fecha exacta)
\echo '4. DUPLICADOS PROBLEMÁTICOS'
\echo '--------------------------------------------------'
SELECT
    pr.producto_id,
    p.nombre,
    pr.ultima_modificacion,
    COUNT(*) as registros_duplicados
FROM precios pr
JOIN productos p ON pr.producto_id = p.id
GROUP BY pr.producto_id, p.nombre, pr.ultima_modificacion
HAVING COUNT(*) > 1
ORDER BY registros_duplicados DESC, p.nombre;

\echo ''

-- 5. Historial de cambios por producto
\echo '5. PRODUCTOS CON MÚLTIPLES REGISTROS (HISTORIAL)'
\echo '--------------------------------------------------'
SELECT
    p.id as producto_id,
    p.nombre,
    COUNT(pr.id) as total_registros,
    MIN(pr.ultima_modificacion)::date as primer_cambio,
    MAX(pr.ultima_modificacion)::date as ultimo_cambio
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id
WHERE p.activo = true
GROUP BY p.id, p.nombre
HAVING COUNT(pr.id) > 1
ORDER BY total_registros DESC, p.nombre
LIMIT 20;

\echo ''

-- 6. Verificar índice optimizado
\echo '6. VERIFICACIÓN DE ÍNDICE OPTIMIZADO'
\echo '--------------------------------------------------'
SELECT
    indexname,
    indexdef,
    CASE
        WHEN indexname = 'ix_precios_producto_fecha' THEN '✅ Presente'
        ELSE '❌ No encontrado'
    END as estado
FROM pg_indexes
WHERE tablename = 'precios'
  AND indexname = 'ix_precios_producto_fecha';

\echo ''

-- 7. Estadísticas finales
\echo '7. ESTADÍSTICAS FINALES'
\echo '--------------------------------------------------'
SELECT
    COUNT(DISTINCT producto_id) as productos_con_precio,
    COUNT(*) as total_registros_precios,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT producto_id), 2) as promedio_registros_por_producto,
    MIN(ultima_modificacion)::date as fecha_mas_antigua,
    MAX(ultima_modificacion)::date as fecha_mas_reciente
FROM precios;

\echo ''
\echo '=================================================='
\echo 'VALIDACIÓN COMPLETADA'
\echo '=================================================='
