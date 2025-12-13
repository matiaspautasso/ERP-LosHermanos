-- ============================================================================
-- VERIFICACIÓN DE ESTRUCTURA Y DATOS DE LA TABLA PRECIOS
-- ============================================================================
-- Ejecutar en Supabase SQL Editor o con psql
-- ============================================================================

-- 1. ESTRUCTURA DE LA TABLA PRECIOS
-- ----------------------------------------------------------------------------
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'precios'
ORDER BY ordinal_position;


-- 2. VERIFICAR SI TODOS LOS PRODUCTOS TIENEN PRECIOS
-- ----------------------------------------------------------------------------
SELECT 
    'Total Productos Activos' as metrica,
    COUNT(*) as cantidad
FROM productos
WHERE activo = true

UNION ALL

SELECT 
    'Productos con Precios' as metrica,
    COUNT(DISTINCT producto_id) as cantidad
FROM precios

UNION ALL

SELECT 
    'Productos SIN Precios' as metrica,
    COUNT(*) as cantidad
FROM productos p
WHERE p.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM precios pr WHERE pr.producto_id = p.id
  );


-- 3. VERIFICAR QUE LOS 3 TIPOS DE PRECIO ESTÉN CONFIGURADOS
-- ----------------------------------------------------------------------------
SELECT 
    p.id as producto_id,
    p.nombre as producto,
    p.precio_lista,
    c.nombre as categoria,
    pr.precio_minorista,
    pr.precio_mayorista,
    pr.precio_supermayorista,
    pr.ultima_modificacion,
    CASE 
        WHEN pr.precio_minorista IS NULL THEN '❌ Falta Minorista'
        WHEN pr.precio_mayorista IS NULL THEN '❌ Falta Mayorista'
        WHEN pr.precio_supermayorista IS NULL THEN '❌ Falta Supermayorista'
        ELSE '✅ Completo'
    END as estado_precios,
    CASE 
        WHEN pr.precio_supermayorista <= pr.precio_mayorista 
         AND pr.precio_mayorista <= pr.precio_minorista THEN '✅ OK'
        ELSE '❌ Jerarquía Incorrecta'
    END as jerarquia
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista,
        ultima_modificacion
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
ORDER BY p.nombre
LIMIT 50;


-- 4. RESUMEN DE PRECIOS FALTANTES
-- ----------------------------------------------------------------------------
SELECT 
    CASE 
        WHEN precio_minorista IS NULL THEN 'Sin Precio Minorista'
        WHEN precio_mayorista IS NULL THEN 'Sin Precio Mayorista'
        WHEN precio_supermayorista IS NULL THEN 'Sin Precio Supermayorista'
        ELSE 'Todos los Precios OK'
    END as tipo_problema,
    COUNT(*) as cantidad_productos
FROM productos p
LEFT JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
GROUP BY 
    CASE 
        WHEN precio_minorista IS NULL THEN 'Sin Precio Minorista'
        WHEN precio_mayorista IS NULL THEN 'Sin Precio Mayorista'
        WHEN precio_supermayorista IS NULL THEN 'Sin Precio Supermayorista'
        ELSE 'Todos los Precios OK'
    END
ORDER BY cantidad_productos DESC;


-- 5. VERIFICAR DUPLICADOS EN LA TABLA PRECIOS
-- ----------------------------------------------------------------------------
-- Productos con múltiples registros de precio en la misma fecha
SELECT 
    producto_id,
    COUNT(*) as registros_totales,
    COUNT(DISTINCT DATE(ultima_modificacion)) as fechas_distintas,
    MIN(ultima_modificacion) as primer_registro,
    MAX(ultima_modificacion) as ultimo_registro
FROM precios
GROUP BY producto_id
HAVING COUNT(*) > 1
ORDER BY registros_totales DESC
LIMIT 20;


-- 6. VERIFICAR JERARQUÍA DE PRECIOS INCORRECTA
-- ----------------------------------------------------------------------------
SELECT 
    p.id,
    p.nombre,
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    CASE 
        WHEN pr.precio_supermayorista > pr.precio_mayorista THEN '❌ Supermay > May'
        WHEN pr.precio_mayorista > pr.precio_minorista THEN '❌ May > Min'
        ELSE '✅ OK'
    END as problema
FROM productos p
INNER JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
  AND (pr.precio_supermayorista > pr.precio_mayorista 
       OR pr.precio_mayorista > pr.precio_minorista)
LIMIT 20;


-- 7. ESTADÍSTICAS GENERALES DE PRECIOS
-- ----------------------------------------------------------------------------
SELECT 
    'Precio Minorista' as tipo_precio,
    COUNT(*) as con_precio,
    ROUND(AVG(precio_minorista::numeric), 2) as promedio,
    MIN(precio_minorista) as minimo,
    MAX(precio_minorista) as maximo
FROM precios
WHERE precio_minorista IS NOT NULL

UNION ALL

SELECT 
    'Precio Mayorista' as tipo_precio,
    COUNT(*) as con_precio,
    ROUND(AVG(precio_mayorista::numeric), 2) as promedio,
    MIN(precio_mayorista) as minimo,
    MAX(precio_mayorista) as maximo
FROM precios
WHERE precio_mayorista IS NOT NULL

UNION ALL

SELECT 
    'Precio Supermayorista' as tipo_precio,
    COUNT(*) as con_precio,
    ROUND(AVG(precio_supermayorista::numeric), 2) as promedio,
    MIN(precio_supermayorista) as minimo,
    MAX(precio_supermayorista) as maximo
FROM precios
WHERE precio_supermayorista IS NOT NULL;


-- 8. VERIFICAR ÍNDICE OPTIMIZADO
-- ----------------------------------------------------------------------------
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'precios'
ORDER BY indexname;


-- 9. MUESTRA DE PRODUCTOS CON PRECIOS (PRIMEROS 10)
-- ----------------------------------------------------------------------------
SELECT 
    p.nombre as producto,
    c.nombre as categoria,
    p.precio_lista as costo_base,
    pr.precio_minorista,
    pr.precio_mayorista,
    pr.precio_supermayorista,
    ROUND(((pr.precio_minorista - p.precio_lista) / p.precio_lista * 100)::numeric, 1) as margen_min_pct,
    ROUND(((pr.precio_mayorista - p.precio_lista) / p.precio_lista * 100)::numeric, 1) as margen_may_pct,
    ROUND(((pr.precio_supermayorista - p.precio_lista) / p.precio_lista * 100)::numeric, 1) as margen_supermay_pct,
    pr.ultima_modificacion
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista,
        ultima_modificacion
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
  AND pr.precio_minorista IS NOT NULL
ORDER BY p.nombre
LIMIT 10;


-- ============================================================================
-- RESUMEN EJECUTIVO
-- ============================================================================
SELECT 
    '=== RESUMEN EJECUTIVO ===' as titulo;

SELECT 
    'Productos Activos' as metrica,
    COUNT(*) as valor
FROM productos
WHERE activo = true

UNION ALL

SELECT 
    'Productos con Precios Completos (3 tipos)',
    COUNT(*)
FROM productos p
INNER JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
  AND pr.precio_minorista IS NOT NULL
  AND pr.precio_mayorista IS NOT NULL
  AND pr.precio_supermayorista IS NOT NULL

UNION ALL

SELECT 
    'Productos con Jerarquía Correcta',
    COUNT(*)
FROM productos p
INNER JOIN LATERAL (
    SELECT 
        precio_minorista,
        precio_mayorista,
        precio_supermayorista
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE p.activo = true
  AND pr.precio_supermayorista <= pr.precio_mayorista
  AND pr.precio_mayorista <= pr.precio_minorista

UNION ALL

SELECT 
    'Total Registros en Tabla Precios',
    COUNT(*)::bigint
FROM precios;
