-- ============================================================================
-- RELEVAMIENTO COMPLETO DE DEPENDENCIAS DE productos.precio_lista
-- ============================================================================
-- Fecha: 2025-12-15
-- Objetivo: Identificar todas las dependencias antes de deprecar precio_lista
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔍 FASE 0: RELEVAMIENTO DE DEPENDENCIAS DE precio_lista'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo ''
\echo '1️⃣  CONSTRAINTS QUE REFERENCIAN precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    pg_get_constraintdef(pgc.oid) as definition
FROM information_schema.table_constraints tc
JOIN pg_catalog.pg_constraint pgc
    ON pgc.conname = tc.constraint_name
WHERE tc.table_name = 'productos'
    AND pg_get_constraintdef(pgc.oid) LIKE '%precio_lista%'
ORDER BY tc.constraint_type, tc.constraint_name;

\echo ''
\echo '2️⃣  TRIGGERS QUE USAN precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    t.tgname AS trigger_name,
    t.tgenabled AS enabled,
    c.relname AS table_name,
    p.proname AS function_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'productos'
   OR pg_get_triggerdef(t.oid) LIKE '%precio_lista%'
ORDER BY c.relname, t.tgname;

\echo ''
\echo '3️⃣  FUNCIONES QUE REFERENCIAN precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS arguments,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) LIKE '%precio_lista%'
   OR pg_get_function_arguments(p.oid) LIKE '%precio_lista%'
ORDER BY n.nspname, p.proname;

\echo ''
\echo '4️⃣  VISTAS QUE USAN precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE definition LIKE '%precio_lista%'
   OR viewname LIKE '%precio%'
ORDER BY schemaname, viewname;

\echo ''
\echo '5️⃣  ÍNDICES EN precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    i.relname AS index_name,
    t.relname AS table_name,
    a.attname AS column_name,
    pg_get_indexdef(i.oid) AS index_definition
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'productos'
    AND a.attname = 'precio_lista'
ORDER BY i.relname;

\echo ''
\echo '6️⃣  ESTADÍSTICAS DE DATOS'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    COUNT(*) as total_productos,
    COUNT(precio_lista) as con_precio_lista,
    COUNT(*) - COUNT(precio_lista) as sin_precio_lista,
    MIN(precio_lista) as precio_min,
    MAX(precio_lista) as precio_max,
    AVG(precio_lista) as precio_promedio,
    COUNT(CASE WHEN precio_lista = 0 THEN 1 END) as con_precio_cero
FROM productos;

\echo ''
\echo '7️⃣  COMPARACIÓN precio_lista vs precios más recientes'
\echo '─────────────────────────────────────────────────────────────────────────'

WITH precios_actuales AS (
    SELECT DISTINCT ON (producto_id)
        producto_id,
        precio_minorista,
        precio_mayorista,
        precio_supermayorista,
        ultima_modificacion
    FROM precios
    ORDER BY producto_id, ultima_modificacion DESC
)
SELECT
    p.id,
    p.nombre,
    p.precio_lista,
    pa.precio_minorista,
    pa.precio_mayorista,
    pa.precio_supermayorista,
    CASE
        WHEN p.precio_lista != pa.precio_minorista THEN 'DIFERENTE'
        ELSE 'IGUAL'
    END as comparacion_minorista
FROM productos p
LEFT JOIN precios_actuales pa ON p.id = pa.producto_id
WHERE p.activo = true
ORDER BY p.id
LIMIT 20;

\echo ''
\echo '8️⃣  PRODUCTOS SIN REGISTRO EN TABLA precios'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    p.id,
    p.nombre,
    p.precio_lista,
    p.costo,
    p.activo
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id
WHERE pr.producto_id IS NULL
ORDER BY p.id;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ RELEVAMIENTO COMPLETADO'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
