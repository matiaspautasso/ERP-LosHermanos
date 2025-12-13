-- database/scripts/02-limpiar-duplicados.sql
-- Script para eliminar productos duplicados y consolidar referencias
-- Fecha: 2025-12-10
-- IMPORTANTE: Este script modifica datos. Asegúrate de tener backup.

BEGIN;

-- Paso 1: Crear tabla temporal con mapeo de duplicados
-- Mantiene el ID menor de cada grupo de duplicados
CREATE TEMP TABLE producto_mapping AS
WITH duplicados AS (
    SELECT
        nombre,
        MIN(id) as id_mantener,
        ARRAY_AGG(id ORDER BY id) as todos_los_ids
    FROM productos
    GROUP BY nombre
    HAVING COUNT(*) > 1
),
mapping_expandido AS (
    SELECT
        nombre,
        id_mantener,
        UNNEST(todos_los_ids) as id_duplicado
    FROM duplicados
)
SELECT
    id_duplicado as id_viejo,
    id_mantener as id_nuevo
FROM mapping_expandido
WHERE id_duplicado != id_mantener;

-- Mostrar mapeo de IDs que se consolidarán
SELECT
    p_viejo.nombre,
    pm.id_viejo,
    pm.id_nuevo
FROM producto_mapping pm
JOIN productos p_viejo ON p_viejo.id = pm.id_viejo
ORDER BY p_viejo.nombre, pm.id_viejo;

-- Paso 2: Actualizar referencias en detalle_venta
UPDATE detalle_venta dv
SET producto_id = pm.id_nuevo
FROM producto_mapping pm
WHERE dv.producto_id = pm.id_viejo;

-- Verificar actualización
SELECT
    'detalle_venta actualizados' as tabla,
    COUNT(*) as registros_actualizados
FROM detalle_venta dv
JOIN producto_mapping pm ON dv.producto_id = pm.id_nuevo;

-- Paso 3: Actualizar referencias en detalle_oc (órdenes de compra)
UPDATE detalle_oc doc
SET producto_id = pm.id_nuevo
FROM producto_mapping pm
WHERE doc.producto_id = pm.id_viejo;

-- Paso 4: Actualizar referencias en detalle_recepcion
UPDATE detalle_recepcion dr
SET producto_id = pm.id_nuevo
FROM producto_mapping pm
WHERE dr.producto_id = pm.id_viejo;

-- Paso 5: Actualizar referencias en movimientos_stock
UPDATE movimientos_stock ms
SET producto_id = pm.id_nuevo
FROM producto_mapping pm
WHERE ms.producto_id = pm.id_viejo;

-- Paso 6: Consolidar registros de precios
-- Primero, eliminar precios duplicados de productos que serán eliminados
DELETE FROM precios
WHERE producto_id IN (SELECT id_viejo FROM producto_mapping);

-- Paso 7: Eliminar productos duplicados
DELETE FROM productos
WHERE id IN (SELECT id_viejo FROM producto_mapping);

-- Verificar resultados
SELECT
    'Productos después de limpieza' as descripcion,
    COUNT(*) as total,
    COUNT(DISTINCT nombre) as nombres_unicos
FROM productos;

-- Mostrar productos restantes con duplicados (debería ser 0)
SELECT
    nombre,
    COUNT(*) as cantidad
FROM productos
GROUP BY nombre
HAVING COUNT(*) > 1;

COMMIT;

-- Mensaje final
SELECT 'Limpieza de duplicados completada exitosamente' as resultado;
