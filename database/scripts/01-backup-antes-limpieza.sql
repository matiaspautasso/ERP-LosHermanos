-- database/scripts/01-backup-antes-limpieza.sql
-- Script de Backup antes de limpiar duplicados
-- Fecha: 2025-12-10

-- Crear tabla temporal con respaldo de productos
CREATE TEMP TABLE backup_productos AS
SELECT * FROM productos;

-- Crear tabla temporal con respaldo de precios
CREATE TEMP TABLE backup_precios AS
SELECT * FROM precios;

-- Crear tabla temporal con respaldo de detalle_venta
CREATE TEMP TABLE backup_detalle_venta AS
SELECT * FROM detalle_venta;

-- Verificar cantidad de registros respaldados
SELECT
    (SELECT COUNT(*) FROM backup_productos) as productos_backup,
    (SELECT COUNT(*) FROM backup_precios) as precios_backup,
    (SELECT COUNT(*) FROM backup_detalle_venta) as ventas_backup;

-- Listar todos los duplicados antes de eliminar
SELECT
    nombre,
    COUNT(*) as cantidad,
    STRING_AGG(id::TEXT, ', ' ORDER BY id) as ids_duplicados
FROM productos
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY nombre;
