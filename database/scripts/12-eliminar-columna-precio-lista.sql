-- ============================================================================
-- ELIMINAR COLUMNA precio_lista DE TABLA productos
-- ============================================================================
-- Fecha: 2025-12-15
-- Objetivo: Eliminar columna precio_lista después de migrar a tabla precios
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🗑️  FASE 2: ELIMINAR COLUMNA precio_lista'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo ''
\echo '1️⃣  BACKUP: Crear tabla de respaldo'
\echo '─────────────────────────────────────────────────────────────────────────'

-- Crear backup con timestamp
DO $$
DECLARE
    backup_table_name TEXT;
BEGIN
    backup_table_name := 'productos_backup_' || to_char(now(), 'YYYYMMDD_HH24MISS');

    EXECUTE format('CREATE TABLE %I AS SELECT * FROM productos', backup_table_name);

    RAISE NOTICE '✅ Backup creado: %', backup_table_name;
    RAISE NOTICE 'ℹ️  Puede restaurar con: INSERT INTO productos SELECT * FROM %;', backup_table_name;
END $$;

\echo ''
\echo '2️⃣  Verificar estado actual de la columna'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'productos'
    AND column_name = 'precio_lista';

\echo ''
\echo '3️⃣  Estadísticas finales antes de eliminar'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    COUNT(*) as total_productos,
    MIN(precio_lista) as precio_lista_min,
    MAX(precio_lista) as precio_lista_max,
    AVG(precio_lista) as precio_lista_promedio
FROM productos;

\echo ''
\echo '4️⃣  ELIMINAR columna precio_lista'
\echo '─────────────────────────────────────────────────────────────────────────'

DO $$
BEGIN
    -- Verificar que la columna existe antes de eliminarla
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'productos'
            AND column_name = 'precio_lista'
    ) THEN
        ALTER TABLE productos DROP COLUMN precio_lista CASCADE;

        RAISE NOTICE '✅ Columna precio_lista eliminada exitosamente (CASCADE)';
    ELSE
        RAISE NOTICE '⚠️  La columna precio_lista no existe';
    END IF;
END $$;

\echo ''
\echo '5️⃣  Verificar que la columna fue eliminada'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    COUNT(*) as columnas_precio_lista_restantes,
    CASE
        WHEN COUNT(*) = 0 THEN '✅ COLUMNA ELIMINADA CORRECTAMENTE'
        ELSE '⚠️  LA COLUMNA TODAVÍA EXISTE'
    END as estado
FROM information_schema.columns
WHERE table_name = 'productos'
    AND column_name = 'precio_lista';

\echo ''
\echo '6️⃣  Estructura actualizada de la tabla productos'
\echo '─────────────────────────────────────────────────────────────────────────'

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'productos'
ORDER BY ordinal_position;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ COLUMNA precio_lista ELIMINADA'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''
\echo 'ℹ️  PRÓXIMOS PASOS:'
\echo '   1. cd backend'
\echo '   2. npx prisma db pull       # Sincronizar schema desde BD'
\echo '   3. npx prisma generate      # Regenerar Prisma Client'
\echo '   4. Reiniciar servidor dev'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
