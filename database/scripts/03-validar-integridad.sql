-- database/scripts/03-validar-integridad.sql
-- Script para validar integridad después de limpiar duplicados
-- Fecha: 2025-12-10

-- 1. Verificar que no hay duplicados
SELECT
    'Verificación de duplicados' as test,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASSED - No hay duplicados'
        ELSE '✗ FAILED - Aún hay duplicados'
    END as resultado,
    COUNT(*) as productos_duplicados
FROM (
    SELECT nombre, COUNT(*) as cnt
    FROM productos
    GROUP BY nombre
    HAVING COUNT(*) > 1
) duplicados;

-- 2. Verificar integridad referencial en detalle_venta
SELECT
    'Integridad detalle_venta' as test,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASSED - Todas las ventas tienen productos válidos'
        ELSE '✗ FAILED - Hay ventas con productos inexistentes'
    END as resultado,
    COUNT(*) as ventas_huerfanas
FROM detalle_venta dv
LEFT JOIN productos p ON dv.producto_id = p.id
WHERE p.id IS NULL;

-- 3. Verificar integridad referencial en precios
SELECT
    'Integridad precios' as test,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASSED - Todos los precios tienen productos válidos'
        ELSE '✗ FAILED - Hay precios con productos inexistentes'
    END as resultado,
    COUNT(*) as precios_huerfanos
FROM precios pr
LEFT JOIN productos p ON pr.producto_id = p.id
WHERE p.id IS NULL;

-- 4. Verificar jerarquía de precios (supermayorista <= mayorista <= minorista)
SELECT
    'Jerarquía de precios' as test,
    CASE
        WHEN COUNT(*) = 0 THEN '✓ PASSED - Todos los precios están correctos'
        ELSE '✗ FAILED - Hay precios con jerarquía incorrecta'
    END as resultado,
    COUNT(*) as precios_incorrectos
FROM (
    SELECT DISTINCT ON (producto_id)
        producto_id,
        precio_supermayorista,
        precio_mayorista,
        precio_minorista
    FROM precios
    ORDER BY producto_id, ultima_modificacion DESC
) precios_actuales
WHERE precio_supermayorista > precio_mayorista
   OR precio_mayorista > precio_minorista;

-- 5. Listar productos con precios incorrectos (si los hay)
SELECT
    p.id,
    p.nombre,
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    CASE
        WHEN pr.precio_supermayorista > pr.precio_mayorista THEN 'Supermayorista > Mayorista'
        WHEN pr.precio_mayorista > pr.precio_minorista THEN 'Mayorista > Minorista'
    END as problema
FROM productos p
JOIN LATERAL (
    SELECT precio_minorista, precio_mayorista, precio_supermayorista
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON true
WHERE pr.precio_supermayorista > pr.precio_mayorista
   OR pr.precio_mayorista > pr.precio_minorista;

-- 6. Resumen final
SELECT
    COUNT(DISTINCT p.id) as total_productos,
    COUNT(DISTINCT p.nombre) as nombres_unicos,
    COUNT(DISTINCT pr.producto_id) as productos_con_precios,
    COUNT(DISTINCT dv.producto_id) as productos_vendidos
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id
LEFT JOIN detalle_venta dv ON p.id = dv.producto_id;
