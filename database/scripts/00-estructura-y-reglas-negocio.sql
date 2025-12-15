-- =====================================================
-- 00-estructura-y-reglas-negocio.sql
-- =====================================================
-- Propósito: Mantener y validar la estructura de la base de datos
--           con reglas de negocio escalables
-- 
-- Fecha Creación: 2025-12-14
-- Última Modificación: 2025-12-14
-- Autor: ERP Los Hermanos Team
--
-- Este script establece:
-- 1. Constraints para integridad de datos
-- 2. Triggers para validaciones automáticas
-- 3. Funciones para lógica de negocio
-- 4. Índices para optimización
-- 5. Vistas para reportes y consultas
-- =====================================================

-- =====================================================
-- SECCIÓN 1: REGLAS DE NEGOCIO - PRECIOS
-- =====================================================

-- REGLA 1: Jerarquía de precios (Supermayorista < Mayorista < Minorista)
-- Esta constraint valida que los precios mantengan la jerarquía correcta
DO $$ 
BEGIN
    -- Verificar si el constraint ya existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_jerarquia_precios'
    ) THEN
        ALTER TABLE precios
        ADD CONSTRAINT chk_jerarquia_precios CHECK (
            precio_supermayorista > 0 
            AND precio_mayorista > precio_supermayorista 
            AND precio_minorista > precio_mayorista
        );
        RAISE NOTICE 'Constraint chk_jerarquia_precios creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_jerarquia_precios ya existe';
    END IF;
END $$;

-- REGLA 2: Solo debe existir un precio vigente por producto (el más reciente)
-- Índice único parcial para garantizar un solo precio "actual" por producto
DROP INDEX IF EXISTS idx_un_precio_vigente_por_producto;
CREATE UNIQUE INDEX idx_un_precio_vigente_por_producto 
ON precios (producto_id) 
WHERE ultima_modificacion = (
    SELECT MAX(ultima_modificacion) 
    FROM precios p2 
    WHERE p2.producto_id = precios.producto_id
);

COMMENT ON INDEX idx_un_precio_vigente_por_producto IS 
'Garantiza que solo exista un precio vigente (más reciente) por producto';

-- =====================================================
-- SECCIÓN 2: REGLAS DE NEGOCIO - PRODUCTOS
-- =====================================================

-- REGLA 3: Productos activos deben tener precios configurados
-- Vista para monitorear productos sin precios
CREATE OR REPLACE VIEW v_productos_sin_precios AS
SELECT 
    p.id,
    p.nombre,
    c.nombre as categoria,
    p.stock_actual,
    p.activo,
    p.ultima_modif
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN precios pr ON p.id = pr.producto_id
WHERE p.activo = true 
  AND pr.id IS NULL
ORDER BY p.nombre;

COMMENT ON VIEW v_productos_sin_precios IS 
'Productos activos que no tienen precios configurados - Requiere atención';

-- REGLA 4: El stock no puede ser negativo
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_stock_no_negativo'
    ) THEN
        ALTER TABLE productos
        ADD CONSTRAINT chk_stock_no_negativo CHECK (stock_actual >= 0);
        RAISE NOTICE 'Constraint chk_stock_no_negativo creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_stock_no_negativo ya existe';
    END IF;
END $$;

-- REGLA 5: El costo debe ser menor al precio de lista
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_costo_menor_precio_lista'
    ) THEN
        ALTER TABLE productos
        ADD CONSTRAINT chk_costo_menor_precio_lista CHECK (costo < precio_lista);
        RAISE NOTICE 'Constraint chk_costo_menor_precio_lista creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_costo_menor_precio_lista ya existe';
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 3: REGLAS DE NEGOCIO - VENTAS
-- =====================================================

-- REGLA 6: Tipos de venta válidos (solo estos 3 interactúan en módulo ventas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_tipo_venta_valido'
    ) THEN
        ALTER TABLE ventas
        ADD CONSTRAINT chk_tipo_venta_valido CHECK (
            tipo_venta IN ('Supermayorista', 'Mayorista', 'Minorista')
        );
        RAISE NOTICE 'Constraint chk_tipo_venta_valido creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_tipo_venta_valido ya existe';
    END IF;
END $$;

-- REGLA 7: El total de la venta debe ser positivo
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_venta_total_positivo'
    ) THEN
        ALTER TABLE ventas
        ADD CONSTRAINT chk_venta_total_positivo CHECK (total > 0);
        RAISE NOTICE 'Constraint chk_venta_total_positivo creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_venta_total_positivo ya existe';
    END IF;
END $$;

-- REGLA 8: El descuento no puede ser mayor al 100%
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_descuento_maximo'
    ) THEN
        ALTER TABLE ventas
        ADD CONSTRAINT chk_descuento_maximo CHECK (descuento >= 0 AND descuento <= 100);
        RAISE NOTICE 'Constraint chk_descuento_maximo creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_descuento_maximo ya existe';
    END IF;
END $$;

-- REGLA 9: Validar que las cantidades en detalle_venta sean positivas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_cantidad_positiva'
    ) THEN
        ALTER TABLE detalle_venta
        ADD CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0);
        RAISE NOTICE 'Constraint chk_cantidad_positiva creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_cantidad_positiva ya existe';
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 4: REGLAS DE NEGOCIO - CLIENTES
-- =====================================================

-- REGLA 10: Tipos de cliente válidos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_tipo_cliente_valido'
    ) THEN
        ALTER TABLE clientes
        ADD CONSTRAINT chk_tipo_cliente_valido CHECK (
            tipo IN ('Supermayorista', 'Mayorista', 'Minorista', 'Mostrador')
        );
        RAISE NOTICE 'Constraint chk_tipo_cliente_valido creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_tipo_cliente_valido ya existe';
    END IF;
END $$;

-- REGLA 11: El correo debe tener formato válido (básico)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_correo_formato_valido'
    ) THEN
        ALTER TABLE clientes
        ADD CONSTRAINT chk_correo_formato_valido CHECK (
            correo IS NULL OR correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        );
        RAISE NOTICE 'Constraint chk_correo_formato_valido creado exitosamente';
    ELSE
        RAISE NOTICE 'Constraint chk_correo_formato_valido ya existe';
    END IF;
END $$;

-- =====================================================
-- SECCIÓN 5: FUNCIONES DE UTILIDAD
-- =====================================================

-- FUNCIÓN 1: Obtener precio correcto según tipo de venta
CREATE OR REPLACE FUNCTION fn_obtener_precio_por_tipo(
    p_producto_id BIGINT,
    p_tipo_venta VARCHAR
) RETURNS DECIMAL(12,2) AS $$
DECLARE
    v_precio DECIMAL(12,2);
BEGIN
    -- Obtener el precio más reciente del producto según tipo de venta
    SELECT 
        CASE p_tipo_venta
            WHEN 'Supermayorista' THEN precio_supermayorista
            WHEN 'Mayorista' THEN precio_mayorista
            WHEN 'Minorista' THEN precio_minorista
            ELSE NULL
        END INTO v_precio
    FROM precios
    WHERE producto_id = p_producto_id
    ORDER BY ultima_modificacion DESC
    LIMIT 1;
    
    RETURN v_precio;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_obtener_precio_por_tipo IS 
'Obtiene el precio correcto de un producto según el tipo de venta (Supermayorista/Mayorista/Minorista)';

-- FUNCIÓN 2: Validar disponibilidad de stock
CREATE OR REPLACE FUNCTION fn_validar_stock_disponible(
    p_producto_id BIGINT,
    p_cantidad_solicitada DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
    v_stock_actual DECIMAL;
BEGIN
    SELECT stock_actual INTO v_stock_actual
    FROM productos
    WHERE id = p_producto_id;
    
    RETURN v_stock_actual >= p_cantidad_solicitada;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_validar_stock_disponible IS 
'Valida si hay suficiente stock disponible para un producto';

-- FUNCIÓN 3: Obtener margen de ganancia por tipo de precio
CREATE OR REPLACE FUNCTION fn_calcular_margen_ganancia(
    p_producto_id BIGINT
) RETURNS TABLE(
    tipo_precio VARCHAR,
    precio DECIMAL,
    costo DECIMAL,
    margen_pesos DECIMAL,
    margen_porcentaje DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tipo::VARCHAR,
        precio_valor::DECIMAL,
        prod.costo::DECIMAL,
        (precio_valor - prod.costo)::DECIMAL as margen_pesos,
        ROUND(((precio_valor - prod.costo) / prod.costo * 100), 2)::DECIMAL as margen_porcentaje
    FROM productos prod
    CROSS JOIN LATERAL (
        SELECT 'Supermayorista' as tipo, pr.precio_supermayorista as precio_valor
        FROM precios pr 
        WHERE pr.producto_id = prod.id 
        ORDER BY pr.ultima_modificacion DESC 
        LIMIT 1
        
        UNION ALL
        
        SELECT 'Mayorista', pr.precio_mayorista
        FROM precios pr 
        WHERE pr.producto_id = prod.id 
        ORDER BY pr.ultima_modificacion DESC 
        LIMIT 1
        
        UNION ALL
        
        SELECT 'Minorista', pr.precio_minorista
        FROM precios pr 
        WHERE pr.producto_id = prod.id 
        ORDER BY pr.ultima_modificacion DESC 
        LIMIT 1
    ) precios_tabla
    WHERE prod.id = p_producto_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_calcular_margen_ganancia IS 
'Calcula el margen de ganancia (en pesos y porcentaje) para cada tipo de precio de un producto';

-- =====================================================
-- SECCIÓN 6: TRIGGERS PARA AUDITORÍA Y VALIDACIÓN
-- =====================================================

-- TRIGGER 1: Auditar cambios de precios
CREATE TABLE IF NOT EXISTS auditoria_precios (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    precio_anterior_supermayorista DECIMAL(12,2),
    precio_anterior_mayorista DECIMAL(12,2),
    precio_anterior_minorista DECIMAL(12,2),
    precio_nuevo_supermayorista DECIMAL(12,2),
    precio_nuevo_mayorista DECIMAL(12,2),
    precio_nuevo_minorista DECIMAL(12,2),
    usuario_id BIGINT,
    fecha_cambio TIMESTAMPTZ DEFAULT NOW(),
    motivo VARCHAR(200)
);

COMMENT ON TABLE auditoria_precios IS 
'Registro histórico de todos los cambios de precios realizados';

CREATE OR REPLACE FUNCTION fn_auditar_cambio_precios()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO auditoria_precios (
        producto_id,
        precio_anterior_supermayorista,
        precio_anterior_mayorista,
        precio_anterior_minorista,
        precio_nuevo_supermayorista,
        precio_nuevo_mayorista,
        precio_nuevo_minorista,
        usuario_id,
        fecha_cambio
    ) VALUES (
        NEW.producto_id,
        OLD.precio_supermayorista,
        OLD.precio_mayorista,
        OLD.precio_minorista,
        NEW.precio_supermayorista,
        NEW.precio_mayorista,
        NEW.precio_minorista,
        NEW.usuario_id,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditar_precios ON precios;
CREATE TRIGGER trg_auditar_precios
AFTER UPDATE ON precios
FOR EACH ROW
WHEN (
    OLD.precio_supermayorista != NEW.precio_supermayorista OR
    OLD.precio_mayorista != NEW.precio_mayorista OR
    OLD.precio_minorista != NEW.precio_minorista
)
EXECUTE FUNCTION fn_auditar_cambio_precios();

COMMENT ON TRIGGER trg_auditar_precios ON precios IS 
'Registra automáticamente todos los cambios de precios en la tabla de auditoría';

-- =====================================================
-- SECCIÓN 7: VISTAS PARA REPORTES Y ANÁLISIS
-- =====================================================

-- VISTA 1: Dashboard de precios y márgenes
CREATE OR REPLACE VIEW v_dashboard_precios_margenes AS
SELECT 
    p.id,
    p.nombre as producto,
    c.nombre as categoria,
    p.costo,
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    -- Márgenes Supermayorista
    ROUND(((pr.precio_supermayorista - p.costo) / p.costo * 100), 2) as margen_supermayorista_pct,
    -- Márgenes Mayorista
    ROUND(((pr.precio_mayorista - p.costo) / p.costo * 100), 2) as margen_mayorista_pct,
    -- Márgenes Minorista
    ROUND(((pr.precio_minorista - p.costo) / p.costo * 100), 2) as margen_minorista_pct,
    pr.ultima_modificacion as fecha_actualizacion,
    p.stock_actual,
    p.activo
FROM productos p
LEFT JOIN precios pr ON p.id = pr.producto_id 
    AND pr.ultima_modificacion = (
        SELECT MAX(ultima_modificacion) 
        FROM precios 
        WHERE producto_id = p.id
    )
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = true
ORDER BY p.nombre;

COMMENT ON VIEW v_dashboard_precios_margenes IS 
'Vista principal para análisis de precios y márgenes de ganancia por producto';

-- VISTA 2: Productos con precios que violan jerarquía
CREATE OR REPLACE VIEW v_precios_jerarquia_invalida AS
SELECT 
    p.id as producto_id,
    p.nombre as producto,
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    CASE 
        WHEN pr.precio_supermayorista >= pr.precio_mayorista 
            THEN 'Supermayorista >= Mayorista'
        WHEN pr.precio_mayorista >= pr.precio_minorista 
            THEN 'Mayorista >= Minorista'
        WHEN pr.precio_supermayorista <= 0 
            THEN 'Supermayorista inválido (≤0)'
    END as problema,
    pr.ultima_modificacion
FROM productos p
INNER JOIN precios pr ON p.id = pr.producto_id
WHERE 
    pr.precio_supermayorista >= pr.precio_mayorista
    OR pr.precio_mayorista >= pr.precio_minorista
    OR pr.precio_supermayorista <= 0
ORDER BY pr.ultima_modificacion DESC;

COMMENT ON VIEW v_precios_jerarquia_invalida IS 
'Alertas de productos con precios que no cumplen la jerarquía de negocio';

-- VISTA 3: Resumen de ventas por tipo
CREATE OR REPLACE VIEW v_resumen_ventas_por_tipo AS
SELECT 
    v.tipo_venta,
    COUNT(v.id) as cantidad_ventas,
    SUM(v.total) as total_vendido,
    AVG(v.total) as ticket_promedio,
    SUM(v.descuento) as descuento_total_aplicado,
    COUNT(DISTINCT v.cliente_id) as clientes_unicos,
    MIN(v.fecha) as primera_venta,
    MAX(v.fecha) as ultima_venta
FROM ventas v
GROUP BY v.tipo_venta
ORDER BY total_vendido DESC;

COMMENT ON VIEW v_resumen_ventas_por_tipo IS 
'Análisis agregado de ventas por tipo (Supermayorista/Mayorista/Minorista)';

-- VISTA 4: Productos más vendidos por tipo de venta
CREATE OR REPLACE VIEW v_productos_mas_vendidos_por_tipo AS
SELECT 
    v.tipo_venta,
    p.nombre as producto,
    c.nombre as categoria,
    COUNT(dv.id) as veces_vendido,
    SUM(dv.cantidad) as cantidad_total_vendida,
    SUM(dv.subtotal) as total_facturado,
    AVG(dv.precio_unitario) as precio_promedio
FROM ventas v
INNER JOIN detalle_venta dv ON v.id = dv.venta_id
INNER JOIN productos p ON dv.producto_id = p.id
LEFT JOIN categorias c ON p.categoria_id = c.id
GROUP BY v.tipo_venta, p.nombre, c.nombre
ORDER BY v.tipo_venta, cantidad_total_vendida DESC;

COMMENT ON VIEW v_productos_mas_vendidos_por_tipo IS 
'Ranking de productos más vendidos segmentado por tipo de venta';

-- =====================================================
-- SECCIÓN 8: ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para consultas frecuentes de ventas
CREATE INDEX IF NOT EXISTS ix_ventas_tipo_fecha 
ON ventas(tipo_venta, fecha DESC);

-- Índice para búsqueda rápida de productos activos con stock
CREATE INDEX IF NOT EXISTS ix_productos_activo_stock 
ON productos(activo, stock_actual) 
WHERE activo = true;

-- Índice para auditoría de precios por producto y fecha
CREATE INDEX IF NOT EXISTS ix_auditoria_precios_producto_fecha 
ON auditoria_precios(producto_id, fecha_cambio DESC);

-- =====================================================
-- SECCIÓN 9: VALIDACIÓN Y REPORTE FINAL
-- =====================================================

-- Reporte de validación de todas las reglas
DO $$
DECLARE
    v_productos_sin_precios INTEGER;
    v_precios_jerarquia_invalida INTEGER;
    v_stock_negativo INTEGER;
    v_ventas_tipo_invalido INTEGER;
BEGIN
    -- Contar productos activos sin precios
    SELECT COUNT(*) INTO v_productos_sin_precios 
    FROM v_productos_sin_precios;
    
    -- Contar precios con jerarquía inválida
    SELECT COUNT(*) INTO v_precios_jerarquia_invalida 
    FROM v_precios_jerarquia_invalida;
    
    -- Contar productos con stock negativo
    SELECT COUNT(*) INTO v_stock_negativo 
    FROM productos 
    WHERE stock_actual < 0;
    
    -- Contar ventas con tipo inválido
    SELECT COUNT(*) INTO v_ventas_tipo_invalido 
    FROM ventas 
    WHERE tipo_venta NOT IN ('Supermayorista', 'Mayorista', 'Minorista');
    
    -- Reporte
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REPORTE DE VALIDACIÓN DE REGLAS DE NEGOCIO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Productos activos sin precios: %', v_productos_sin_precios;
    RAISE NOTICE 'Precios con jerarquía inválida: %', v_precios_jerarquia_invalida;
    RAISE NOTICE 'Productos con stock negativo: %', v_stock_negativo;
    RAISE NOTICE 'Ventas con tipo inválido: %', v_ventas_tipo_invalido;
    RAISE NOTICE '========================================';
    
    IF v_productos_sin_precios = 0 AND 
       v_precios_jerarquia_invalida = 0 AND 
       v_stock_negativo = 0 AND 
       v_ventas_tipo_invalido = 0 THEN
        RAISE NOTICE '✓ TODAS LAS VALIDACIONES PASARON EXITOSAMENTE';
    ELSE
        RAISE WARNING '⚠ SE ENCONTRARON PROBLEMAS - REVISAR VISTAS DE DIAGNÓSTICO';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Consultas útiles para verificar estado:
-- 
-- 1. Ver productos sin precios:
--    SELECT * FROM v_productos_sin_precios;
--
-- 2. Ver dashboard de precios:
--    SELECT * FROM v_dashboard_precios_margenes;
--
-- 3. Ver precios con jerarquía inválida:
--    SELECT * FROM v_precios_jerarquia_invalida;
--
-- 4. Ver resumen de ventas:
--    SELECT * FROM v_resumen_ventas_por_tipo;
--
-- 5. Calcular margen de un producto específico:
--    SELECT * FROM fn_calcular_margen_ganancia(1);
--
-- 6. Ver historial de cambios de precios:
--    SELECT * FROM auditoria_precios 
--    WHERE producto_id = 1 
--    ORDER BY fecha_cambio DESC;
-- =====================================================
