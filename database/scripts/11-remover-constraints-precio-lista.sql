-- ============================================================================
-- REMOVER CONSTRAINTS DE precio_lista
-- ============================================================================
-- Fecha: 2025-12-15
-- Objetivo: Eliminar constraints que dependen de productos.precio_lista
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🗑️  REMOVER CONSTRAINTS DE precio_lista'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo ''
\echo '1️⃣  Verificar constraints existentes'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    tc.constraint_name,
    tc.constraint_type,
    pg_get_constraintdef(pgc.oid) as definition
FROM information_schema.table_constraints tc
JOIN pg_catalog.pg_constraint pgc
    ON pgc.conname = tc.constraint_name
WHERE tc.table_name = 'productos'
    AND (tc.constraint_name = 'chk_costo_menor_precio_lista'
         OR tc.constraint_name = 'ck_prod_precio');

\echo ''
\echo '2️⃣  Remover constraint: chk_costo_menor_precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

DO $$
BEGIN
    -- Verificar si el constraint existe antes de eliminarlo
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_costo_menor_precio_lista'
    ) THEN
        ALTER TABLE productos
        DROP CONSTRAINT chk_costo_menor_precio_lista;

        RAISE NOTICE '✅ Constraint chk_costo_menor_precio_lista eliminado exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Constraint chk_costo_menor_precio_lista no existe';
    END IF;
END $$;

\echo ''
\echo '3️⃣  Remover constraint: ck_prod_precio'
\echo '─────────────────────────────────────────────────────────────────────────'

DO $$
BEGIN
    -- Verificar si el constraint existe antes de eliminarlo
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ck_prod_precio'
    ) THEN
        ALTER TABLE productos
        DROP CONSTRAINT ck_prod_precio;

        RAISE NOTICE '✅ Constraint ck_prod_precio eliminado exitosamente';
    ELSE
        RAISE NOTICE '⚠️  Constraint ck_prod_precio no existe';
    END IF;
END $$;

\echo ''
\echo '4️⃣  Verificar que los constraints fueron eliminados'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    COUNT(*) as constraints_restantes,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ TODOS LOS CONSTRAINTS ELIMINADOS'
        ELSE '⚠️  TODAVÍA EXISTEN CONSTRAINTS'
    END as estado
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'productos'
    AND (tc.constraint_name = 'chk_costo_menor_precio_lista'
         OR tc.constraint_name = 'ck_prod_precio');

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ CONSTRAINTS ELIMINADOS CORRECTAMENTE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
