-- =====================================================
-- SISTEMA COMPLETO DE GESTIÓN DE PRECIOS - ERP LOS HERMANOS
-- =====================================================
-- Autor: ERP Los Hermanos Team
-- Fecha: 2025-12-14
-- Versión: 1.0
--
-- ARQUITECTURA DE 3 CAPAS:
-- 1. CAPA DE DATOS BASE: Tablas de productos y precios
-- 2. CAPA DE CONFIGURACIÓN: Reglas de negocio y márgenes
-- 3. CAPA DE LÓGICA: Funciones, triggers y vistas
--
-- CARACTERÍSTICAS:
-- ✓ Validación automática de jerarquía (super < mayor < minor)
-- ✓ Modo manual y automático (flag usa_calculo_automatico)
-- ✓ Cálculo de precios sugeridos desde costo o base
-- ✓ Prevención de precios negativos o menores al costo
-- ✓ Vista consolidada de precios y márgenes
-- ✓ Auditoría completa con triggers
-- =====================================================

-- =====================================================
-- SECCIÓN 1: CAPA DE DATOS BASE
-- =====================================================

-- 1.1 Tabla de configuración de márgenes por categoría
CREATE TABLE IF NOT EXISTS config_margenes_categoria (
    id                      BIGSERIAL PRIMARY KEY,
    categoria_id            BIGINT NOT NULL REFERENCES categorias(id),
    margen_supermayorista   NUMERIC(5,2) NOT NULL DEFAULT 0.00,  -- Porcentaje sobre costo
    margen_mayorista        NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- Porcentaje sobre costo
    margen_minorista        NUMERIC(5,2) NOT NULL DEFAULT 20.00, -- Porcentaje sobre costo
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usuario_id              BIGINT REFERENCES usuarios(id),

    CONSTRAINT uq_config_margenes_categoria UNIQUE (categoria_id),
    CONSTRAINT chk_margenes_positivos CHECK (
        margen_supermayorista >= 0 AND
        margen_mayorista >= margen_supermayorista AND
        margen_minorista >= margen_mayorista
    )
);

COMMENT ON TABLE config_margenes_categoria IS
'Configuración de márgenes de ganancia por categoría de productos';

COMMENT ON COLUMN config_margenes_categoria.margen_supermayorista IS
'Porcentaje de margen para precio supermayorista sobre el costo base';

COMMENT ON COLUMN config_margenes_categoria.margen_mayorista IS
'Porcentaje de margen para precio mayorista sobre el costo base';

COMMENT ON COLUMN config_margenes_categoria.margen_minorista IS
'Porcentaje de margen para precio minorista sobre el costo base';

-- Índice para búsqueda rápida por categoría
CREATE INDEX IF NOT EXISTS ix_config_margenes_categoria
ON config_margenes_categoria(categoria_id) WHERE activo = TRUE;


-- 1.2 Tabla de configuración de productos (modo manual vs automático)
CREATE TABLE IF NOT EXISTS config_precio_producto (
    id                      BIGSERIAL PRIMARY KEY,
    producto_id             BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    usa_calculo_automatico  BOOLEAN NOT NULL DEFAULT TRUE,
    costo_base_manual       NUMERIC(12,2),  -- Costo base manual (si difiere de productos.costo)
    margen_supermayorista   NUMERIC(5,2),   -- Override de margen para este producto
    margen_mayorista        NUMERIC(5,2),
    margen_minorista        NUMERIC(5,2),
    activo                  BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_modificacion      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    usuario_id              BIGINT REFERENCES usuarios(id),

    CONSTRAINT uq_config_precio_producto UNIQUE (producto_id),
    CONSTRAINT chk_costo_base_positivo CHECK (
        costo_base_manual IS NULL OR costo_base_manual > 0
    ),
    CONSTRAINT chk_margenes_producto CHECK (
        (margen_supermayorista IS NULL AND margen_mayorista IS NULL AND margen_minorista IS NULL) OR
        (margen_supermayorista >= 0 AND margen_mayorista >= margen_supermayorista AND margen_minorista >= margen_mayorista)
    )
);

COMMENT ON TABLE config_precio_producto IS
'Configuración individual de precios por producto (modo manual/automático y márgenes personalizados)';

COMMENT ON COLUMN config_precio_producto.usa_calculo_automatico IS
'TRUE: calcula precios automáticamente desde costo + márgenes. FALSE: precios manuales';

COMMENT ON COLUMN config_precio_producto.costo_base_manual IS
'Costo base manual para cálculos (si NULL, usa productos.costo)';

CREATE INDEX IF NOT EXISTS ix_config_precio_producto
ON config_precio_producto(producto_id) WHERE activo = TRUE;


-- 1.3 Extender tabla precios con flag de cálculo automático
-- (asumiendo que la tabla precios ya existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'precios' AND column_name = 'calculado_automaticamente'
    ) THEN
        ALTER TABLE precios ADD COLUMN calculado_automaticamente BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

COMMENT ON COLUMN precios.calculado_automaticamente IS
'Indica si el precio fue calculado automáticamente o ingresado manualmente';


-- 1.4 Tabla de auditoría de cambios de precios (si no existe)
CREATE TABLE IF NOT EXISTS auditoria_precios (
    id                              BIGSERIAL PRIMARY KEY,
    producto_id                     BIGINT NOT NULL,
    precio_anterior_supermayorista  NUMERIC(12,2),
    precio_anterior_mayorista       NUMERIC(12,2),
    precio_anterior_minorista       NUMERIC(12,2),
    precio_nuevo_supermayorista     NUMERIC(12,2),
    precio_nuevo_mayorista          NUMERIC(12,2),
    precio_nuevo_minorista          NUMERIC(12,2),
    fue_calculo_automatico          BOOLEAN DEFAULT FALSE,
    usuario_id                      BIGINT,
    fecha_cambio                    TIMESTAMPTZ DEFAULT NOW(),
    motivo                          VARCHAR(200)
);

COMMENT ON TABLE auditoria_precios IS
'Historial completo de todos los cambios de precios (manuales y automáticos)';

CREATE INDEX IF NOT EXISTS ix_auditoria_precios_producto_fecha
ON auditoria_precios(producto_id, fecha_cambio DESC);

CREATE INDEX IF NOT EXISTS ix_auditoria_precios_fecha
ON auditoria_precios(fecha_cambio DESC);


-- =====================================================
-- SECCIÓN 2: CAPA DE CONFIGURACIÓN - REGLAS DE NEGOCIO
-- =====================================================

-- 2.1 Constraint: Jerarquía estricta de precios
ALTER TABLE precios DROP CONSTRAINT IF EXISTS chk_jerarquia_precios;
ALTER TABLE precios ADD CONSTRAINT chk_jerarquia_precios CHECK (
    precio_supermayorista > 0
    AND precio_mayorista > precio_supermayorista
    AND precio_minorista > precio_mayorista
);

COMMENT ON CONSTRAINT chk_jerarquia_precios ON precios IS
'Garantiza jerarquía estricta: Supermayorista < Mayorista < Minorista';


-- 2.2 Constraint: Precios deben ser mayores al costo
-- (esto se validará en el trigger, ya que el costo está en otra tabla)


-- =====================================================
-- SECCIÓN 3: CAPA DE LÓGICA - FUNCIONES DE NEGOCIO
-- =====================================================

-- 3.1 Función: Obtener márgenes configurados para un producto
CREATE OR REPLACE FUNCTION fn_obtener_margenes_producto(p_producto_id BIGINT)
RETURNS TABLE (
    margen_supermayorista NUMERIC,
    margen_mayorista NUMERIC,
    margen_minorista NUMERIC,
    origen VARCHAR
) AS $$
DECLARE
    v_categoria_id BIGINT;
BEGIN
    -- Primero intentar obtener márgenes específicos del producto
    RETURN QUERY
    SELECT
        cpp.margen_supermayorista,
        cpp.margen_mayorista,
        cpp.margen_minorista,
        'producto'::VARCHAR as origen
    FROM config_precio_producto cpp
    WHERE cpp.producto_id = p_producto_id
      AND cpp.margen_supermayorista IS NOT NULL
      AND cpp.activo = TRUE;

    -- Si no hay configuración específica, usar configuración de categoría
    IF NOT FOUND THEN
        SELECT p.categoria_id INTO v_categoria_id
        FROM productos p
        WHERE p.id = p_producto_id;

        RETURN QUERY
        SELECT
            cmc.margen_supermayorista,
            cmc.margen_mayorista,
            cmc.margen_minorista,
            'categoria'::VARCHAR as origen
        FROM config_margenes_categoria cmc
        WHERE cmc.categoria_id = v_categoria_id
          AND cmc.activo = TRUE;
    END IF;

    -- Si no hay configuración, usar valores por defecto
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            0.00::NUMERIC as margen_supermayorista,
            10.00::NUMERIC as margen_mayorista,
            20.00::NUMERIC as margen_minorista,
            'default'::VARCHAR as origen;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_obtener_margenes_producto IS
'Obtiene los márgenes configurados para un producto (prioridad: producto > categoría > default)';


-- 3.2 Función: Calcular precios sugeridos desde costo
CREATE OR REPLACE FUNCTION fn_calcular_precios_sugeridos(p_producto_id BIGINT)
RETURNS TABLE (
    costo_base NUMERIC,
    precio_supermayorista_sugerido NUMERIC,
    precio_mayorista_sugerido NUMERIC,
    precio_minorista_sugerido NUMERIC,
    margen_super NUMERIC,
    margen_mayor NUMERIC,
    margen_minor NUMERIC,
    origen_margenes VARCHAR
) AS $$
DECLARE
    v_costo NUMERIC;
    v_margenes RECORD;
BEGIN
    -- Obtener costo base (manual o desde productos.costo)
    SELECT
        COALESCE(cpp.costo_base_manual, p.costo) INTO v_costo
    FROM productos p
    LEFT JOIN config_precio_producto cpp ON cpp.producto_id = p.id AND cpp.activo = TRUE
    WHERE p.id = p_producto_id;

    IF v_costo IS NULL OR v_costo <= 0 THEN
        RAISE EXCEPTION 'Producto % no tiene costo válido configurado', p_producto_id;
    END IF;

    -- Obtener márgenes configurados
    SELECT * INTO v_margenes FROM fn_obtener_margenes_producto(p_producto_id) LIMIT 1;

    -- Calcular precios con márgenes
    RETURN QUERY
    SELECT
        v_costo as costo_base,
        ROUND((v_costo * (1 + v_margenes.margen_supermayorista / 100))::NUMERIC, 2) as precio_supermayorista_sugerido,
        ROUND((v_costo * (1 + v_margenes.margen_mayorista / 100))::NUMERIC, 2) as precio_mayorista_sugerido,
        ROUND((v_costo * (1 + v_margenes.margen_minorista / 100))::NUMERIC, 2) as precio_minorista_sugerido,
        v_margenes.margen_supermayorista as margen_super,
        v_margenes.margen_mayorista as margen_mayor,
        v_margenes.margen_minorista as margen_minor,
        v_margenes.origen as origen_margenes;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_calcular_precios_sugeridos IS
'Calcula precios sugeridos para un producto aplicando márgenes sobre el costo base';


-- 3.3 Función: Validar que precios sean mayores al costo
CREATE OR REPLACE FUNCTION fn_validar_precios_mayores_costo(
    p_producto_id BIGINT,
    p_precio_supermayorista NUMERIC,
    p_precio_mayorista NUMERIC,
    p_precio_minorista NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
    v_costo NUMERIC;
BEGIN
    SELECT COALESCE(cpp.costo_base_manual, p.costo) INTO v_costo
    FROM productos p
    LEFT JOIN config_precio_producto cpp ON cpp.producto_id = p.id AND cpp.activo = TRUE
    WHERE p.id = p_producto_id;

    -- Todos los precios deben ser mayores al costo
    RETURN (
        p_precio_supermayorista >= v_costo AND
        p_precio_mayorista >= v_costo AND
        p_precio_minorista >= v_costo
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_validar_precios_mayores_costo IS
'Valida que todos los precios sean mayores o iguales al costo del producto';


-- 3.4 Función: Aplicar precios calculados automáticamente
CREATE OR REPLACE FUNCTION fn_aplicar_precios_automaticos(
    p_producto_id BIGINT,
    p_usuario_id BIGINT DEFAULT NULL
) RETURNS TABLE (
    precio_supermayorista NUMERIC,
    precio_mayorista NUMERIC,
    precio_minorista NUMERIC,
    aplicado BOOLEAN
) AS $$
DECLARE
    v_usa_auto BOOLEAN;
    v_precios RECORD;
BEGIN
    -- Verificar si el producto usa cálculo automático
    SELECT usa_calculo_automatico INTO v_usa_auto
    FROM config_precio_producto
    WHERE producto_id = p_producto_id AND activo = TRUE;

    -- Si no hay configuración, asumir automático
    v_usa_auto := COALESCE(v_usa_auto, TRUE);

    IF NOT v_usa_auto THEN
        -- Modo manual, no aplicar precios automáticos
        RETURN QUERY SELECT NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, FALSE;
        RETURN;
    END IF;

    -- Calcular precios sugeridos
    SELECT * INTO v_precios FROM fn_calcular_precios_sugeridos(p_producto_id) LIMIT 1;

    -- Insertar nuevo registro de precio
    INSERT INTO precios (
        producto_id,
        precio_supermayorista,
        precio_mayorista,
        precio_minorista,
        calculado_automaticamente,
        usuario_id,
        ultima_modificacion
    ) VALUES (
        p_producto_id,
        v_precios.precio_supermayorista_sugerido,
        v_precios.precio_mayorista_sugerido,
        v_precios.precio_minorista_sugerido,
        TRUE,
        p_usuario_id,
        NOW()
    );

    RETURN QUERY SELECT
        v_precios.precio_supermayorista_sugerido,
        v_precios.precio_mayorista_sugerido,
        v_precios.precio_minorista_sugerido,
        TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_aplicar_precios_automaticos IS
'Aplica precios calculados automáticamente si el producto tiene usa_calculo_automatico = TRUE';


-- =====================================================
-- SECCIÓN 4: TRIGGERS PARA VALIDACIÓN Y AUDITORÍA
-- =====================================================

-- 4.1 Trigger: Validar precios mayores al costo antes de INSERT/UPDATE
CREATE OR REPLACE FUNCTION trg_fn_validar_precios_costo()
RETURNS TRIGGER AS $$
DECLARE
    v_costo NUMERIC;
BEGIN
    -- Obtener costo del producto
    SELECT COALESCE(cpp.costo_base_manual, p.costo) INTO v_costo
    FROM productos p
    LEFT JOIN config_precio_producto cpp ON cpp.producto_id = p.id AND cpp.activo = TRUE
    WHERE p.id = NEW.producto_id;

    -- Validar que todos los precios sean >= costo
    IF NEW.precio_supermayorista < v_costo THEN
        RAISE EXCEPTION 'Precio supermayorista (%) no puede ser menor al costo (%)',
            NEW.precio_supermayorista, v_costo;
    END IF;

    IF NEW.precio_mayorista < v_costo THEN
        RAISE EXCEPTION 'Precio mayorista (%) no puede ser menor al costo (%)',
            NEW.precio_mayorista, v_costo;
    END IF;

    IF NEW.precio_minorista < v_costo THEN
        RAISE EXCEPTION 'Precio minorista (%) no puede ser menor al costo (%)',
            NEW.precio_minorista, v_costo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_precios_costo ON precios;
CREATE TRIGGER trg_validar_precios_costo
BEFORE INSERT OR UPDATE ON precios
FOR EACH ROW
EXECUTE FUNCTION trg_fn_validar_precios_costo();

COMMENT ON TRIGGER trg_validar_precios_costo ON precios IS
'Valida que los precios sean mayores o iguales al costo del producto';


-- 4.2 Trigger: Auditoría de cambios de precios
CREATE OR REPLACE FUNCTION trg_fn_auditar_cambio_precios()
RETURNS TRIGGER AS $$
DECLARE
    v_fue_auto BOOLEAN;
BEGIN
    -- Determinar si fue cálculo automático
    v_fue_auto := COALESCE(NEW.calculado_automaticamente, FALSE);

    -- Registrar cambio en auditoría
    INSERT INTO auditoria_precios (
        producto_id,
        precio_anterior_supermayorista,
        precio_anterior_mayorista,
        precio_anterior_minorista,
        precio_nuevo_supermayorista,
        precio_nuevo_mayorista,
        precio_nuevo_minorista,
        fue_calculo_automatico,
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
        v_fue_auto,
        NEW.usuario_id,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auditar_cambio_precios ON precios;
CREATE TRIGGER trg_auditar_cambio_precios
AFTER UPDATE ON precios
FOR EACH ROW
WHEN (
    OLD.precio_supermayorista != NEW.precio_supermayorista OR
    OLD.precio_mayorista != NEW.precio_mayorista OR
    OLD.precio_minorista != NEW.precio_minorista
)
EXECUTE FUNCTION trg_fn_auditar_cambio_precios();

COMMENT ON TRIGGER trg_auditar_cambio_precios ON precios IS
'Registra todos los cambios de precios en la tabla de auditoría';


-- 4.3 Trigger: Actualizar precios automáticamente cuando cambia el costo
CREATE OR REPLACE FUNCTION trg_fn_actualizar_precios_auto_al_cambiar_costo()
RETURNS TRIGGER AS $$
DECLARE
    v_usa_auto BOOLEAN;
    v_precio_actual_id BIGINT;
    v_precios RECORD;
BEGIN
    -- Solo si el costo cambió
    IF OLD.costo = NEW.costo THEN
        RETURN NEW;
    END IF;

    -- Verificar si el producto usa cálculo automático
    SELECT usa_calculo_automatico INTO v_usa_auto
    FROM config_precio_producto
    WHERE producto_id = NEW.id AND activo = TRUE;

    v_usa_auto := COALESCE(v_usa_auto, TRUE);

    IF v_usa_auto THEN
        -- Calcular nuevos precios
        SELECT * INTO v_precios FROM fn_calcular_precios_sugeridos(NEW.id) LIMIT 1;

        -- Obtener ID del precio actual
        SELECT id INTO v_precio_actual_id
        FROM precios
        WHERE producto_id = NEW.id
        ORDER BY ultima_modificacion DESC
        LIMIT 1;

        -- Actualizar precio actual o crear uno nuevo
        IF v_precio_actual_id IS NOT NULL THEN
            UPDATE precios SET
                precio_supermayorista = v_precios.precio_supermayorista_sugerido,
                precio_mayorista = v_precios.precio_mayorista_sugerido,
                precio_minorista = v_precios.precio_minorista_sugerido,
                calculado_automaticamente = TRUE,
                ultima_modificacion = NOW()
            WHERE id = v_precio_actual_id;
        ELSE
            -- Crear primer precio para el producto
            INSERT INTO precios (
                producto_id,
                precio_supermayorista,
                precio_mayorista,
                precio_minorista,
                calculado_automaticamente,
                ultima_modificacion
            ) VALUES (
                NEW.id,
                v_precios.precio_supermayorista_sugerido,
                v_precios.precio_mayorista_sugerido,
                v_precios.precio_minorista_sugerido,
                TRUE,
                NOW()
            );
        END IF;

        RAISE NOTICE 'Precios actualizados automáticamente para producto %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_precios_auto_costo ON productos;
CREATE TRIGGER trg_actualizar_precios_auto_costo
AFTER UPDATE ON productos
FOR EACH ROW
WHEN (OLD.costo IS DISTINCT FROM NEW.costo)
EXECUTE FUNCTION trg_fn_actualizar_precios_auto_al_cambiar_costo();

COMMENT ON TRIGGER trg_actualizar_precios_auto_costo ON productos IS
'Actualiza precios automáticamente cuando cambia el costo del producto (si usa_calculo_automatico = TRUE)';


-- =====================================================
-- SECCIÓN 5: VISTAS CONSOLIDADAS
-- =====================================================

-- 5.1 Vista principal: Dashboard de precios y márgenes
CREATE OR REPLACE VIEW v_dashboard_precios_completo AS
SELECT
    p.id as producto_id,
    p.nombre as producto,
    c.nombre as categoria,
    p.costo,
    COALESCE(cpp.costo_base_manual, p.costo) as costo_base_real,

    -- Configuración del producto
    COALESCE(cpp.usa_calculo_automatico, TRUE) as usa_calculo_automatico,

    -- Precios actuales
    pr.precio_supermayorista,
    pr.precio_mayorista,
    pr.precio_minorista,
    pr.calculado_automaticamente,
    pr.ultima_modificacion as fecha_ultimo_precio,

    -- Márgenes reales (calculados desde precios actuales)
    ROUND(((pr.precio_supermayorista - COALESCE(cpp.costo_base_manual, p.costo)) / COALESCE(cpp.costo_base_manual, p.costo) * 100)::NUMERIC, 2) as margen_real_supermayorista_pct,
    ROUND(((pr.precio_mayorista - COALESCE(cpp.costo_base_manual, p.costo)) / COALESCE(cpp.costo_base_manual, p.costo) * 100)::NUMERIC, 2) as margen_real_mayorista_pct,
    ROUND(((pr.precio_minorista - COALESCE(cpp.costo_base_manual, p.costo)) / COALESCE(cpp.costo_base_manual, p.costo) * 100)::NUMERIC, 2) as margen_real_minorista_pct,

    -- Márgenes configurados
    margenes.margen_supermayorista as margen_config_supermayorista,
    margenes.margen_mayorista as margen_config_mayorista,
    margenes.margen_minorista as margen_config_minorista,
    margenes.origen as origen_config_margenes,

    -- Precios sugeridos (si aplica cálculo automático)
    CASE
        WHEN COALESCE(cpp.usa_calculo_automatico, TRUE) THEN
            ROUND((COALESCE(cpp.costo_base_manual, p.costo) * (1 + margenes.margen_supermayorista / 100))::NUMERIC, 2)
        ELSE NULL
    END as precio_sugerido_supermayorista,
    CASE
        WHEN COALESCE(cpp.usa_calculo_automatico, TRUE) THEN
            ROUND((COALESCE(cpp.costo_base_manual, p.costo) * (1 + margenes.margen_mayorista / 100))::NUMERIC, 2)
        ELSE NULL
    END as precio_sugerido_mayorista,
    CASE
        WHEN COALESCE(cpp.usa_calculo_automatico, TRUE) THEN
            ROUND((COALESCE(cpp.costo_base_manual, p.costo) * (1 + margenes.margen_minorista / 100))::NUMERIC, 2)
        ELSE NULL
    END as precio_sugerido_minorista,

    -- Estado
    p.stock_actual,
    p.activo
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN config_precio_producto cpp ON cpp.producto_id = p.id AND cpp.activo = TRUE
LEFT JOIN LATERAL (
    SELECT
        precio_supermayorista,
        precio_mayorista,
        precio_minorista,
        calculado_automaticamente,
        ultima_modificacion
    FROM precios
    WHERE producto_id = p.id
    ORDER BY ultima_modificacion DESC
    LIMIT 1
) pr ON TRUE
LEFT JOIN LATERAL (
    SELECT * FROM fn_obtener_margenes_producto(p.id) LIMIT 1
) margenes ON TRUE
WHERE p.activo = TRUE
ORDER BY p.nombre;

COMMENT ON VIEW v_dashboard_precios_completo IS
'Vista consolidada con precios actuales, márgenes reales, márgenes configurados y precios sugeridos';


-- 5.2 Vista: Productos con precios desactualizados (precios actuales != sugeridos)
CREATE OR REPLACE VIEW v_precios_desactualizados AS
SELECT
    producto_id,
    producto,
    categoria,
    costo_base_real,
    precio_supermayorista as precio_actual_supermayorista,
    precio_sugerido_supermayorista,
    precio_mayorista as precio_actual_mayorista,
    precio_sugerido_mayorista,
    precio_minorista as precio_actual_minorista,
    precio_sugerido_minorista,
    fecha_ultimo_precio,
    (precio_supermayorista - precio_sugerido_supermayorista) as diferencia_supermayorista,
    (precio_mayorista - precio_sugerido_mayorista) as diferencia_mayorista,
    (precio_minorista - precio_sugerido_minorista) as diferencia_minorista
FROM v_dashboard_precios_completo
WHERE usa_calculo_automatico = TRUE
  AND (
      precio_supermayorista != precio_sugerido_supermayorista OR
      precio_mayorista != precio_sugerido_mayorista OR
      precio_minorista != precio_sugerido_minorista
  )
ORDER BY fecha_ultimo_precio ASC;

COMMENT ON VIEW v_precios_desactualizados IS
'Productos en modo automático cuyos precios actuales difieren de los precios sugeridos';


-- 5.3 Vista: Productos sin precios configurados
CREATE OR REPLACE VIEW v_productos_sin_precios_config AS
SELECT
    p.id as producto_id,
    p.nombre as producto,
    c.nombre as categoria,
    p.costo,
    p.precio_lista,
    p.stock_actual,
    p.activo
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN precios pr ON pr.producto_id = p.id
WHERE p.activo = TRUE
  AND pr.id IS NULL
ORDER BY p.nombre;

COMMENT ON VIEW v_productos_sin_precios_config IS
'Productos activos que no tienen ningún precio configurado en la tabla precios';


-- =====================================================
-- SECCIÓN 6: DATOS INICIALES - CONFIGURACIÓN DEFAULT
-- =====================================================

-- Insertar configuración de márgenes por defecto para todas las categorías existentes
INSERT INTO config_margenes_categoria (categoria_id, margen_supermayorista, margen_mayorista, margen_minorista, activo)
SELECT
    id,
    0.00,   -- Supermayorista: sin margen (precio al costo)
    10.00,  -- Mayorista: +10%
    20.00   -- Minorista: +20%
FROM categorias
WHERE NOT EXISTS (
    SELECT 1 FROM config_margenes_categoria cmc WHERE cmc.categoria_id = categorias.id
)
AND activo = TRUE;


-- =====================================================
-- SECCIÓN 7: FUNCIONES AUXILIARES DE GESTIÓN
-- =====================================================

-- 7.1 Función: Sincronizar precios de todos los productos en modo automático
CREATE OR REPLACE FUNCTION fn_sincronizar_precios_automaticos()
RETURNS TABLE (
    producto_id BIGINT,
    producto_nombre VARCHAR,
    precios_actualizados BOOLEAN
) AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT p.id, p.nombre
        FROM productos p
        LEFT JOIN config_precio_producto cpp ON cpp.producto_id = p.id AND cpp.activo = TRUE
        WHERE p.activo = TRUE
          AND COALESCE(cpp.usa_calculo_automatico, TRUE) = TRUE
    LOOP
        PERFORM fn_aplicar_precios_automaticos(r.id, NULL);

        producto_id := r.id;
        producto_nombre := r.nombre;
        precios_actualizados := TRUE;

        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_sincronizar_precios_automaticos IS
'Sincroniza precios de todos los productos configurados en modo automático';


-- 7.2 Función: Cambiar modo de cálculo de un producto
CREATE OR REPLACE FUNCTION fn_cambiar_modo_calculo_producto(
    p_producto_id BIGINT,
    p_usa_automatico BOOLEAN,
    p_usuario_id BIGINT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insertar o actualizar configuración
    INSERT INTO config_precio_producto (
        producto_id,
        usa_calculo_automatico,
        usuario_id,
        fecha_modificacion
    ) VALUES (
        p_producto_id,
        p_usa_automatico,
        p_usuario_id,
        NOW()
    )
    ON CONFLICT (producto_id) DO UPDATE SET
        usa_calculo_automatico = EXCLUDED.usa_calculo_automatico,
        usuario_id = EXCLUDED.usuario_id,
        fecha_modificacion = NOW();

    -- Si cambia a automático, aplicar precios sugeridos
    IF p_usa_automatico THEN
        PERFORM fn_aplicar_precios_automaticos(p_producto_id, p_usuario_id);
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_cambiar_modo_calculo_producto IS
'Cambia el modo de cálculo de precios de un producto (manual/automático)';


-- =====================================================
-- SECCIÓN 8: ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS ix_precios_producto_fecha
ON precios(producto_id, ultima_modificacion DESC);

CREATE INDEX IF NOT EXISTS ix_precios_calculado_auto
ON precios(calculado_automaticamente)
WHERE calculado_automaticamente = TRUE;


-- =====================================================
-- SECCIÓN 9: REPORTE DE INSTALACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================================';
    RAISE NOTICE 'SISTEMA DE GESTIÓN DE PRECIOS INSTALADO EXITOSAMENTE';
    RAISE NOTICE '========================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Componentes instalados:';
    RAISE NOTICE '  ✓ Tablas: config_margenes_categoria, config_precio_producto, auditoria_precios';
    RAISE NOTICE '  ✓ Funciones: 7 funciones de negocio';
    RAISE NOTICE '  ✓ Triggers: 3 triggers de validación y auditoría';
    RAISE NOTICE '  ✓ Vistas: 3 vistas consolidadas';
    RAISE NOTICE '  ✓ Constraints: Jerarquía de precios, validación de costos';
    RAISE NOTICE '';
    RAISE NOTICE 'Características activas:';
    RAISE NOTICE '  ✓ Modo manual/automático por producto';
    RAISE NOTICE '  ✓ Cálculo automático desde costo + márgenes';
    RAISE NOTICE '  ✓ Validación de jerarquía: Super < Mayor < Minor';
    RAISE NOTICE '  ✓ Prevención de precios menores al costo';
    RAISE NOTICE '  ✓ Auditoría completa de cambios';
    RAISE NOTICE '';
    RAISE NOTICE 'Vistas disponibles:';
    RAISE NOTICE '  - v_dashboard_precios_completo';
    RAISE NOTICE '  - v_precios_desactualizados';
    RAISE NOTICE '  - v_productos_sin_precios_config';
    RAISE NOTICE '';
    RAISE NOTICE 'Funciones útiles:';
    RAISE NOTICE '  - fn_calcular_precios_sugeridos(producto_id)';
    RAISE NOTICE '  - fn_aplicar_precios_automaticos(producto_id, usuario_id)';
    RAISE NOTICE '  - fn_sincronizar_precios_automaticos()';
    RAISE NOTICE '  - fn_cambiar_modo_calculo_producto(producto_id, usa_auto, usuario_id)';
    RAISE NOTICE '';
    RAISE NOTICE '========================================================';
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
