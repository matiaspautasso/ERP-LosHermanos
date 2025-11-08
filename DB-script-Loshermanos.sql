-- ============================================================
-- ERP "Los Hermanos"  PostgreSQL DDL (MVP) - Para Supabase
-- Ejecutar en la BD existente "postgres" de Supabase
-- ============================================================

-- Zona horaria
SET TIME ZONE 'UTC';

-- =========================
-- LOGIN / USUARIOS
-- =========================
DROP TABLE IF EXISTS recuperos_credenciales CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id               BIGSERIAL PRIMARY KEY,
  correo           VARCHAR(100)  NOT NULL,
  usuario          VARCHAR(60)   NOT NULL,
  contrasena_hash  VARCHAR(255)  NOT NULL,
  activo           BOOLEAN       NOT NULL DEFAULT TRUE,
  fecha_alta       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  ultimo_acceso    TIMESTAMPTZ,
  recordar_token   VARCHAR(200),
  CONSTRAINT uq_usuarios_correo  UNIQUE (correo),
  CONSTRAINT uq_usuarios_usuario UNIQUE (usuario),
  CONSTRAINT ck_usuarios_activo  CHECK (activo IN (TRUE, FALSE))
);

CREATE INDEX ix_usuarios_ultimo_acceso ON usuarios(ultimo_acceso);

CREATE TABLE recuperos_credenciales (
  id             BIGSERIAL PRIMARY KEY,
  usuario_id     BIGINT       NOT NULL REFERENCES usuarios(id),
  token          VARCHAR(64)  NOT NULL,
  solicitado_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  utilizado_en   TIMESTAMPTZ,
  vigente        BOOLEAN      NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_recupero_token UNIQUE (token),
  CONSTRAINT ck_recupero_vigente CHECK (vigente IN (TRUE, FALSE))
);

CREATE INDEX ix_recupero_usuario ON recuperos_credenciales(usuario_id);

-- =========================
-- CLIENTES / CUENTA CORRIENTE
-- =========================
DROP TABLE IF EXISTS pagos_cliente CASCADE;
DROP TABLE IF EXISTS movimientos_cc CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

CREATE TABLE clientes (
  id          BIGSERIAL PRIMARY KEY,
  nombre      VARCHAR(80)  NOT NULL,
  apellido    VARCHAR(80)  NOT NULL,
  telefono    VARCHAR(30),
  correo      VARCHAR(120),
  tipo        VARCHAR(10)  NOT NULL,
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_alta  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT ck_clientes_tipo   CHECK (tipo IN ('Minorista','Mayorista')),
  CONSTRAINT ck_clientes_activo CHECK (activo IN (TRUE,FALSE))
);

CREATE INDEX ix_clientes_nombre   ON clientes(nombre);
CREATE INDEX ix_clientes_apellido ON clientes(apellido);
CREATE INDEX ix_clientes_correo   ON clientes(correo);
CREATE INDEX ix_clientes_tipo     ON clientes(tipo);

CREATE TABLE movimientos_cc (
  id                BIGSERIAL PRIMARY KEY,
  cliente_id        BIGINT       NOT NULL REFERENCES clientes(id),
  fecha             TIMESTAMPTZ  NOT NULL DEFAULT now(),
  tipo              VARCHAR(12)  NOT NULL,
  nro_comprobante   VARCHAR(30),
  monto             NUMERIC(12,2) NOT NULL,
  saldo_resultante  NUMERIC(12,2) NOT NULL,
  observacion       VARCHAR(200),
  CONSTRAINT ck_movcc_tipo CHECK (tipo IN ('Venta','Pago'))
);

CREATE INDEX ix_movcc_cliente ON movimientos_cc(cliente_id);
CREATE INDEX ix_movcc_fecha   ON movimientos_cc(fecha);
CREATE INDEX ix_movcc_tipo    ON movimientos_cc(tipo);

CREATE TABLE pagos_cliente (
  id          BIGSERIAL PRIMARY KEY,
  cliente_id  BIGINT        NOT NULL REFERENCES clientes(id),
  fecha       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  monto       NUMERIC(12,2) NOT NULL,
  forma_pago  VARCHAR(15)   NOT NULL,
  observacion VARCHAR(200),
  usuario_id  BIGINT        NOT NULL REFERENCES usuarios(id),
  CONSTRAINT ck_pagos_forma CHECK (forma_pago IN ('Efectivo','Transferencia','Tarjeta'))
);

CREATE INDEX ix_pagos_cliente   ON pagos_cliente(cliente_id);
CREATE INDEX ix_pagos_fecha     ON pagos_cliente(fecha);
CREATE INDEX ix_pagos_forma     ON pagos_cliente(forma_pago);
CREATE INDEX ix_pagos_usuario   ON pagos_cliente(usuario_id);

-- =========================
-- STOCK
-- =========================
DROP TABLE IF EXISTS movimientos_stock CASCADE;
DROP TABLE IF EXISTS precios CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS unidades CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

CREATE TABLE categorias (
  id      BIGSERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL,
  activo  BOOLEAN     NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_categorias_nombre UNIQUE (nombre),
  CONSTRAINT ck_categorias_activo CHECK (activo IN (TRUE,FALSE))
);
CREATE INDEX ix_categorias_nombre ON categorias(nombre);

CREATE TABLE unidades (
  id      BIGSERIAL PRIMARY KEY,
  nombre  VARCHAR(20) NOT NULL,
  CONSTRAINT uq_unidades_nombre UNIQUE (nombre)
);
CREATE INDEX ix_unidades_nombre ON unidades(nombre);

CREATE TABLE productos (
  id               BIGSERIAL PRIMARY KEY,
  nombre           VARCHAR(120)   NOT NULL,
  categoria_id     BIGINT         NOT NULL REFERENCES categorias(id),
  unidad_id        BIGINT         NOT NULL REFERENCES unidades(id),
  costo            NUMERIC(12,4)  NOT NULL,
  precio_lista     NUMERIC(12,2)  NOT NULL,
  iva_porcentaje   NUMERIC(4,1)   NOT NULL,
  stock_actual     NUMERIC(12,3)  NOT NULL DEFAULT 0,
  stock_minimo     NUMERIC(12,3)  NOT NULL DEFAULT 0,
  activo           BOOLEAN        NOT NULL DEFAULT TRUE,
  descripcion      VARCHAR(200),
  ultima_modif     TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT ck_prod_costo     CHECK (costo >= 0),
  CONSTRAINT ck_prod_precio    CHECK (precio_lista >= 0),
  CONSTRAINT ck_prod_iva       CHECK (iva_porcentaje IN (0,10.5,21)),
  CONSTRAINT ck_prod_stockA    CHECK (stock_actual >= 0),
  CONSTRAINT ck_prod_stockM    CHECK (stock_minimo >= 0),
  CONSTRAINT ck_prod_activo    CHECK (activo IN (TRUE,FALSE))
);

CREATE INDEX ix_productos_nombre    ON productos(nombre);
CREATE INDEX ix_productos_categoria ON productos(categoria_id);
CREATE INDEX ix_productos_unidad    ON productos(unidad_id);
CREATE INDEX ix_productos_activo    ON productos(activo);

CREATE TABLE precios (
  id                   BIGSERIAL PRIMARY KEY,
  producto_id          BIGINT         NOT NULL REFERENCES productos(id),
  precio_minorista     NUMERIC(12,2)  NOT NULL,
  precio_mayorista     NUMERIC(12,2)  NOT NULL,
  ultima_modificacion  TIMESTAMPTZ    NOT NULL DEFAULT now(),
  usuario_id           BIGINT         NOT NULL REFERENCES usuarios(id),
  CONSTRAINT ck_precio_min CHECK (precio_minorista >= 0),
  CONSTRAINT ck_precio_may CHECK (precio_mayorista >= 0)
);

CREATE INDEX ix_precios_producto ON precios(producto_id);
CREATE INDEX ix_precios_ult      ON precios(ultima_modificacion);

CREATE TABLE movimientos_stock (
  id               BIGSERIAL PRIMARY KEY,
  producto_id      BIGINT         NOT NULL REFERENCES productos(id),
  fecha_hora       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  tipo_operacion   VARCHAR(8)     NOT NULL,
  motivo           VARCHAR(15)    NOT NULL,
  cantidad         NUMERIC(12,3)  NOT NULL,
  observaciones    VARCHAR(250),
  doc_adjunto_ruta VARCHAR(260),
  usuario_id       BIGINT         NOT NULL REFERENCES usuarios(id),
  CONSTRAINT ck_mstock_tipo   CHECK (tipo_operacion IN ('Ingreso','Egreso')),
  CONSTRAINT ck_mstock_motivo CHECK (motivo IN ('Compra','Devolucion','Otros')),
  CONSTRAINT ck_mstock_cant   CHECK (cantidad > 0)
);

CREATE INDEX ix_mstock_producto ON movimientos_stock(producto_id);
CREATE INDEX ix_mstock_fecha    ON movimientos_stock(fecha_hora);
CREATE INDEX ix_mstock_tipo     ON movimientos_stock(tipo_operacion);
CREATE INDEX ix_mstock_usuario  ON movimientos_stock(usuario_id);

-- =========================
-- VENTAS
-- =========================
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;

CREATE TABLE ventas (
  id          BIGSERIAL PRIMARY KEY,
  fecha       TIMESTAMPTZ    NOT NULL DEFAULT now(),
  cliente_id  BIGINT         NOT NULL REFERENCES clientes(id),
  tipo_venta  VARCHAR(10)    NOT NULL,
  descuento   NUMERIC(12,2)  NOT NULL DEFAULT 0,
  total       NUMERIC(12,2)  NOT NULL,
  forma_pago  VARCHAR(12)    NOT NULL,
  usuario_id  BIGINT         NOT NULL REFERENCES usuarios(id),
  CONSTRAINT ck_ventas_tipo   CHECK (tipo_venta IN ('Minorista','Mayorista')),
  CONSTRAINT ck_ventas_desc   CHECK (descuento >= 0),
  CONSTRAINT ck_ventas_total  CHECK (total >= 0),
  CONSTRAINT ck_ventas_pago   CHECK (forma_pago IN ('Efectivo','Tarjeta'))
);

CREATE INDEX ix_ventas_fecha    ON ventas(fecha);
CREATE INDEX ix_ventas_cliente  ON ventas(cliente_id);
CREATE INDEX ix_ventas_tipo     ON ventas(tipo_venta);
CREATE INDEX ix_ventas_pago     ON ventas(forma_pago);
CREATE INDEX ix_ventas_total    ON ventas(total);

CREATE TABLE detalle_venta (
  id               BIGSERIAL PRIMARY KEY,
  venta_id         BIGINT         NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id      BIGINT         NOT NULL REFERENCES productos(id),
  cantidad         NUMERIC(12,3)  NOT NULL,
  precio_unitario  NUMERIC(12,2)  NOT NULL,
  iva_porcentaje   NUMERIC(4,1)   NOT NULL,
  subtotal         NUMERIC(12,2)  NOT NULL,
  CONSTRAINT ck_dv_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_dv_precio   CHECK (precio_unitario >= 0),
  CONSTRAINT ck_dv_iva      CHECK (iva_porcentaje IN (0,10.5,21)),
  CONSTRAINT ck_dv_subtotal CHECK (subtotal >= 0)
);

CREATE INDEX ix_dv_venta    ON detalle_venta(venta_id);
CREATE INDEX ix_dv_producto ON detalle_venta(producto_id);

-- =========================
-- COMPRAS / PROVEEDORES
-- =========================
DROP TABLE IF EXISTS detalle_recepcion CASCADE;
DROP TABLE IF EXISTS recepciones CASCADE;
DROP TABLE IF EXISTS detalle_oc CASCADE;
DROP TABLE IF EXISTS ordenes_compra CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;

CREATE TABLE proveedores (
  id          BIGSERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  telefono    VARCHAR(30),
  correo      VARCHAR(120),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  fecha_alta  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT ck_prov_activo CHECK (activo IN (TRUE,FALSE))
);
CREATE INDEX ix_prov_nombre ON proveedores(nombre);

CREATE TABLE ordenes_compra (
  id            BIGSERIAL PRIMARY KEY,
  proveedor_id  BIGINT         NOT NULL REFERENCES proveedores(id),
  fecha         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  nro_orden     VARCHAR(20)    NOT NULL,
  observaciones VARCHAR(200),
  total         NUMERIC(12,2)  NOT NULL DEFAULT 0,
  estado        VARCHAR(12)    NOT NULL DEFAULT 'Pendiente',
  usuario_id    BIGINT         NOT NULL REFERENCES usuarios(id),
  CONSTRAINT uq_oc_nro UNIQUE (nro_orden),
  CONSTRAINT ck_oc_total  CHECK (total >= 0),
  CONSTRAINT ck_oc_estado CHECK (estado IN ('Pendiente','Confirmada','Recibida','Rechazada'))
);

CREATE INDEX ix_oc_proveedor ON ordenes_compra(proveedor_id);
CREATE INDEX ix_oc_fecha     ON ordenes_compra(fecha);
CREATE INDEX ix_oc_estado    ON ordenes_compra(estado);

CREATE TABLE detalle_oc (
  id             BIGSERIAL PRIMARY KEY,
  orden_id       BIGINT         NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
  producto_id    BIGINT         NOT NULL REFERENCES productos(id),
  cantidad       NUMERIC(12,3)  NOT NULL,
  precio_compra  NUMERIC(12,2)  NOT NULL,
  subtotal       NUMERIC(12,2)  NOT NULL,
  CONSTRAINT ck_doc_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_doc_precio   CHECK (precio_compra >= 0),
  CONSTRAINT ck_doc_subtotal CHECK (subtotal >= 0)
);

CREATE INDEX ix_doc_orden    ON detalle_oc(orden_id);
CREATE INDEX ix_doc_producto ON detalle_oc(producto_id);

CREATE TABLE recepciones (
  id            BIGSERIAL PRIMARY KEY,
  orden_id      BIGINT        NOT NULL REFERENCES ordenes_compra(id),
  fecha         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  estado        VARCHAR(12)   NOT NULL,
  observaciones VARCHAR(200),
  usuario_id    BIGINT        NOT NULL REFERENCES usuarios(id),
  CONSTRAINT ck_rec_estado CHECK (estado IN ('Recibida','Pendiente','Rechazada'))
);

CREATE INDEX ix_rec_orden  ON recepciones(orden_id);
CREATE INDEX ix_rec_fecha  ON recepciones(fecha);
CREATE INDEX ix_rec_estado ON recepciones(estado);

CREATE TABLE detalle_recepcion (
  id             BIGSERIAL PRIMARY KEY,
  recepcion_id   BIGINT         NOT NULL REFERENCES recepciones(id) ON DELETE CASCADE,
  producto_id    BIGINT         NOT NULL REFERENCES productos(id),
  cant_pedida    NUMERIC(12,3)  NOT NULL,
  cant_recibida  NUMERIC(12,3)  NOT NULL,
  precio         NUMERIC(12,2)  NOT NULL,
  subtotal       NUMERIC(12,2)  NOT NULL,
  CONSTRAINT ck_drec_pedida    CHECK (cant_pedida   >= 0),
  CONSTRAINT ck_drec_recibida  CHECK (cant_recibida >= 0),
  CONSTRAINT ck_drec_precio    CHECK (precio >= 0),
  CONSTRAINT ck_drec_subtotal  CHECK (subtotal >= 0)
);

CREATE INDEX ix_drec_recepcion ON detalle_recepcion(recepcion_id);
CREATE INDEX ix_drec_producto  ON detalle_recepcion(producto_id);
