# 📘 GUÍA DEL SISTEMA DE GESTIÓN DE PRECIOS

> **Sistema Completo de Gestión Automática y Manual de Precios**
> ERP Los Hermanos - Versión 1.0

---

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Arquitectura](#arquitectura)
3. [Características Principales](#características-principales)
4. [Casos de Uso](#casos-de-uso)
5. [Funciones Disponibles](#funciones-disponibles)
6. [Vistas y Reportes](#vistas-y-reportes)
7. [Triggers y Validaciones](#triggers-y-validaciones)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [FAQ](#faq)

---

## 🚀 Instalación

### Paso 1: Ejecutar el script

```bash
"/c/Program Files/PostgreSQL/18/bin/psql.exe" \
  "postgresql://USER:PASS@HOST:PORT/DB" \
  -f C:\ProyectosMatias\ERP-LosHermanos\database\scripts\07-sistema-gestion-precios-completo.sql
```

### Paso 2: Verificar instalación

```sql
-- Verificar que las tablas fueron creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('config_margenes_categoria', 'config_precio_producto', 'auditoria_precios');

-- Verificar funciones
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'fn_%precio%';

-- Verificar vistas
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%precio%';
```

---

## 🏗️ Arquitectura

### Capa 1: Datos Base

| Tabla | Propósito |
|-------|-----------|
| `config_margenes_categoria` | Márgenes de ganancia por categoría |
| `config_precio_producto` | Configuración individual por producto |
| `precios` | Historial de precios (extendida con flag `calculado_automaticamente`) |
| `auditoria_precios` | Registro completo de cambios |

### Capa 2: Configuración y Reglas

- **Constraint:** `chk_jerarquia_precios` - Supermayorista < Mayorista < Minorista
- **Constraint:** Validación de márgenes positivos y jerarquía
- **Constraint:** Costos base positivos

### Capa 3: Lógica de Negocio

- **7 Funciones** para cálculo, validación y gestión
- **3 Triggers** para validación automática y auditoría
- **3 Vistas** para reportes consolidados

---

## ✨ Características Principales

### 1. ✅ Modo Manual vs Automático

Cada producto puede configurarse en dos modos:

**MODO AUTOMÁTICO** (`usa_calculo_automatico = TRUE`)
- Los precios se calculan automáticamente desde el costo + márgenes
- Cuando el costo cambia, los precios se actualizan automáticamente
- Ideal para productos con márgenes fijos

**MODO MANUAL** (`usa_calculo_automatico = FALSE`)
- Los precios se ingresan manualmente
- No se actualizan automáticamente
- Ideal para productos con precios especiales o negociados

### 2. ✅ Jerarquía Estricta de Precios

El sistema garantiza automáticamente:
```
Precio Supermayorista < Precio Mayorista < Precio Minorista
```

**Cualquier intento de violar esta regla será RECHAZADO** por el constraint de base de datos.

### 3. ✅ Validación de Precios vs Costo

Todos los precios deben ser **mayores o iguales al costo**. El trigger valida esto automáticamente.

### 4. ✅ Configuración de Márgenes

Los márgenes se pueden configurar a 2 niveles:

**Nivel 1: Por Categoría** (tabla `config_margenes_categoria`)
- Márgenes por defecto para todos los productos de una categoría
- Ejemplo: Lácteos → Super 0%, Mayor 10%, Minor 20%

**Nivel 2: Por Producto** (tabla `config_precio_producto`)
- Override de márgenes para un producto específico
- Ejemplo: "Leche Premium" → Super 5%, Mayor 15%, Minor 25%

**Prioridad:** Producto > Categoría > Default (0%, 10%, 20%)

### 5. ✅ Auditoría Completa

Todos los cambios de precios se registran en `auditoria_precios` con:
- Precios anteriores y nuevos
- Usuario que hizo el cambio
- Fecha y hora exacta
- Si fue cálculo automático o manual
- Motivo del cambio (opcional)

---

## 💼 Casos de Uso

### Caso 1: Producto con Márgenes Estándar (Modo Automático)

**Escenario:** Leche Entera 1L tiene márgenes estándar de su categoría

```sql
-- 1. Producto ya existe con costo = 1000
-- 2. No tiene configuración específica → usa márgenes de categoría
-- 3. Categoría "Lácteos" tiene márgenes: 0%, 10%, 20%

-- Ver precios sugeridos
SELECT * FROM fn_calcular_precios_sugeridos(1);

-- Resultado esperado:
-- costo_base: 1000
-- precio_supermayorista_sugerido: 1000 (costo * 1.00)
-- precio_mayorista_sugerido: 1100 (costo * 1.10)
-- precio_minorista_sugerido: 1200 (costo * 1.20)

-- Aplicar precios automáticamente
SELECT * FROM fn_aplicar_precios_automaticos(1, 1);

-- Ahora el producto tiene sus precios en tabla 'precios'
```

### Caso 2: Producto con Márgenes Personalizados

**Escenario:** "Leche Premium" necesita márgenes más altos

```sql
-- Configurar márgenes personalizados
INSERT INTO config_precio_producto (
    producto_id,
    usa_calculo_automatico,
    margen_supermayorista,
    margen_mayorista,
    margen_minorista,
    usuario_id
) VALUES (
    2,          -- ID del producto
    TRUE,       -- Modo automático
    5.00,       -- +5% para supermayorista
    15.00,      -- +15% para mayorista
    25.00,      -- +25% para minorista
    1           -- ID del usuario
);

-- Aplicar precios
SELECT * FROM fn_aplicar_precios_automaticos(2, 1);
```

### Caso 3: Producto con Precio Manual

**Escenario:** "Producto Promocional" tiene precio especial negociado

```sql
-- Configurar como manual
INSERT INTO config_precio_producto (
    producto_id,
    usa_calculo_automatico,
    usuario_id
) VALUES (
    3,
    FALSE,      -- Modo MANUAL
    1
);

-- Ingresar precios manualmente
INSERT INTO precios (
    producto_id,
    precio_supermayorista,
    precio_mayorista,
    precio_minorista,
    calculado_automaticamente,
    usuario_id
) VALUES (
    3,
    950.00,     -- Precio manual
    1100.00,
    1300.00,
    FALSE,      -- NO fue calculado automáticamente
    1
);
```

### Caso 4: Actualización Automática al Cambiar Costo

**Escenario:** El costo de la leche sube de $1000 a $1200

```sql
-- Actualizar costo del producto
UPDATE productos
SET costo = 1200.00
WHERE id = 1;

-- Si el producto tiene usa_calculo_automatico = TRUE,
-- el TRIGGER actualizará automáticamente los precios:
-- - Supermayorista: 1200
-- - Mayorista: 1320
-- - Minorista: 1440

-- Verificar cambio
SELECT * FROM v_dashboard_precios_completo WHERE producto_id = 1;
```

### Caso 5: Sincronización Masiva de Precios

**Escenario:** Actualizar precios de TODOS los productos en modo automático

```sql
-- Sincronizar todos los precios automáticos
SELECT * FROM fn_sincronizar_precios_automaticos();

-- Esto actualizará los precios de todos los productos
-- configurados en modo automático
```

---

## 🔧 Funciones Disponibles

### `fn_obtener_margenes_producto(producto_id)`

Obtiene los márgenes configurados para un producto.

**Entrada:** `producto_id BIGINT`
**Salida:** `margen_supermayorista, margen_mayorista, margen_minorista, origen`

```sql
SELECT * FROM fn_obtener_margenes_producto(1);

-- Resultado:
-- margen_supermayorista | margen_mayorista | margen_minorista | origen
-- 0.00                  | 10.00            | 20.00            | categoria
```

### `fn_calcular_precios_sugeridos(producto_id)`

Calcula precios sugeridos aplicando márgenes sobre el costo.

**Entrada:** `producto_id BIGINT`
**Salida:** `costo_base, precio_supermayorista_sugerido, precio_mayorista_sugerido, precio_minorista_sugerido, márgenes, origen`

```sql
SELECT * FROM fn_calcular_precios_sugeridos(1);
```

### `fn_aplicar_precios_automaticos(producto_id, usuario_id)`

Aplica precios calculados automáticamente si el producto está en modo automático.

**Entrada:** `producto_id BIGINT, usuario_id BIGINT`
**Salida:** `precio_supermayorista, precio_mayorista, precio_minorista, aplicado`

```sql
SELECT * FROM fn_aplicar_precios_automaticos(1, 1);
```

### `fn_validar_precios_mayores_costo(producto_id, precios...)`

Valida que todos los precios sean mayores al costo.

**Entrada:** `producto_id, precio_super, precio_mayor, precio_minor`
**Salida:** `BOOLEAN`

```sql
SELECT fn_validar_precios_mayores_costo(1, 1000, 1100, 1200);
-- Retorna: TRUE si todos los precios >= costo
```

### `fn_sincronizar_precios_automaticos()`

Sincroniza precios de todos los productos en modo automático.

```sql
SELECT * FROM fn_sincronizar_precios_automaticos();
```

### `fn_cambiar_modo_calculo_producto(producto_id, usa_auto, usuario_id)`

Cambia el modo de cálculo de un producto (manual/automático).

```sql
-- Cambiar a modo automático
SELECT fn_cambiar_modo_calculo_producto(1, TRUE, 1);

-- Cambiar a modo manual
SELECT fn_cambiar_modo_calculo_producto(2, FALSE, 1);
```

---

## 📊 Vistas y Reportes

### `v_dashboard_precios_completo`

Vista principal con toda la información de precios consolidada.

**Columnas:**
- `producto_id, producto, categoria, costo, costo_base_real`
- `usa_calculo_automatico, calculado_automaticamente`
- `precio_supermayorista, precio_mayorista, precio_minorista`
- `margen_real_supermayorista_pct, margen_real_mayorista_pct, margen_real_minorista_pct`
- `margen_config_supermayorista, margen_config_mayorista, margen_config_minorista`
- `precio_sugerido_supermayorista, precio_sugerido_mayorista, precio_sugerido_minorista`
- `stock_actual, activo`

```sql
-- Ver dashboard completo
SELECT * FROM v_dashboard_precios_completo;

-- Filtrar productos con precios automáticos
SELECT * FROM v_dashboard_precios_completo
WHERE usa_calculo_automatico = TRUE;

-- Ver productos con margen menor al 10% en minorista
SELECT * FROM v_dashboard_precios_completo
WHERE margen_real_minorista_pct < 10;
```

### `v_precios_desactualizados`

Productos en modo automático cuyos precios difieren de los sugeridos.

```sql
SELECT * FROM v_precios_desactualizados;

-- Muestra productos que necesitan actualización de precios
```

### `v_productos_sin_precios_config`

Productos activos sin ningún precio configurado.

```sql
SELECT * FROM v_productos_sin_precios_config;

-- Productos que necesitan configuración inicial de precios
```

---

## 🛡️ Triggers y Validaciones

### Trigger 1: `trg_validar_precios_costo`

**Evento:** BEFORE INSERT OR UPDATE en `precios`
**Acción:** Valida que todos los precios sean >= costo del producto

**Ejemplo de rechazo:**
```sql
-- Intentar insertar precio menor al costo (SERÁ RECHAZADO)
INSERT INTO precios (producto_id, precio_supermayorista, precio_mayorista, precio_minorista)
VALUES (1, 500, 600, 700);  -- Si costo = 1000, esto FALLA

-- ERROR: Precio supermayorista (500) no puede ser menor al costo (1000)
```

### Trigger 2: `trg_auditar_cambio_precios`

**Evento:** AFTER UPDATE en `precios`
**Acción:** Registra todos los cambios de precios en `auditoria_precios`

```sql
-- Ver historial de cambios de un producto
SELECT
    fecha_cambio,
    precio_anterior_minorista,
    precio_nuevo_minorista,
    fue_calculo_automatico,
    usuario_id
FROM auditoria_precios
WHERE producto_id = 1
ORDER BY fecha_cambio DESC
LIMIT 10;
```

### Trigger 3: `trg_actualizar_precios_auto_costo`

**Evento:** AFTER UPDATE en `productos` (cuando cambia el costo)
**Acción:** Actualiza automáticamente los precios si el producto está en modo automático

```sql
-- Al actualizar el costo, los precios se actualizan automáticamente
UPDATE productos SET costo = 1500 WHERE id = 1;

-- El trigger recalcula y actualiza precios automáticamente
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Configurar Nueva Categoría con Márgenes

```sql
-- 1. Crear categoría
INSERT INTO categorias (nombre, activo) VALUES ('Bebidas', TRUE)
RETURNING id;  -- Supongamos que retorna id = 5

-- 2. Configurar márgenes para la categoría
INSERT INTO config_margenes_categoria (
    categoria_id,
    margen_supermayorista,
    margen_mayorista,
    margen_minorista,
    activo
) VALUES (
    5,      -- ID de la categoría
    2.00,   -- +2% para supermayorista
    12.00,  -- +12% para mayorista
    22.00   -- +22% para minorista
);

-- 3. Crear producto en esa categoría
INSERT INTO productos (nombre, categoria_id, unidad_id, costo, precio_lista, activo)
VALUES ('Coca Cola 2L', 5, 1, 800.00, 800.00, TRUE)
RETURNING id;  -- Supongamos que retorna id = 50

-- 4. Aplicar precios automáticos
SELECT * FROM fn_aplicar_precios_automaticos(50, 1);

-- Resultado: Precios calculados con márgenes de categoría Bebidas
```

### Ejemplo 2: Producto con Costo Base Manual

```sql
-- Escenario: El costo real es $1000, pero queremos calcular
-- los precios sobre una base de $1200

-- 1. Configurar costo base manual
INSERT INTO config_precio_producto (
    producto_id,
    usa_calculo_automatico,
    costo_base_manual,
    usuario_id
) VALUES (
    1,
    TRUE,
    1200.00,  -- Base manual para cálculos
    1
);

-- 2. Calcular precios (usará 1200 como base, no 1000)
SELECT * FROM fn_calcular_precios_sugeridos(1);

-- Resultado:
-- costo_base: 1200 (no 1000)
-- precio_supermayorista_sugerido: 1200
-- precio_mayorista_sugerido: 1320
-- precio_minorista_sugerido: 1440
```

### Ejemplo 3: Reporte de Márgenes por Categoría

```sql
-- Ver márgenes promedio por categoría
SELECT
    categoria,
    COUNT(*) as productos,
    ROUND(AVG(margen_real_supermayorista_pct), 2) as margen_avg_super,
    ROUND(AVG(margen_real_mayorista_pct), 2) as margen_avg_mayor,
    ROUND(AVG(margen_real_minorista_pct), 2) as margen_avg_minor
FROM v_dashboard_precios_completo
GROUP BY categoria
ORDER BY productos DESC;
```

### Ejemplo 4: Productos con Menor Margen

```sql
-- Identificar productos con margen menor al 10% en minorista
SELECT
    producto,
    categoria,
    costo,
    precio_minorista,
    margen_real_minorista_pct
FROM v_dashboard_precios_completo
WHERE margen_real_minorista_pct < 10
ORDER BY margen_real_minorista_pct ASC;
```

---

## ❓ FAQ

### ¿Qué pasa si un producto no tiene configuración?

Si un producto no tiene configuración en `config_precio_producto`, el sistema:
1. Asume `usa_calculo_automatico = TRUE`
2. Usa los márgenes de su categoría
3. Si la categoría no tiene márgenes, usa los defaults (0%, 10%, 20%)

### ¿Puedo cambiar un producto de manual a automático?

Sí, usa la función:
```sql
SELECT fn_cambiar_modo_calculo_producto(producto_id, TRUE, usuario_id);
```

Esto cambiará el modo y aplicará inmediatamente los precios calculados.

### ¿Cómo veo el historial de cambios de precios?

```sql
SELECT * FROM auditoria_precios
WHERE producto_id = 1
ORDER BY fecha_cambio DESC;
```

### ¿Se puede deshacer un cambio de precio?

No automáticamente, pero puedes:
1. Ver el precio anterior en `auditoria_precios`
2. Insertar manualmente un nuevo registro en `precios` con los valores anteriores

### ¿Qué pasa si el costo cambia en un producto manual?

Nada. Los productos en modo manual NO actualizan precios automáticamente.

### ¿Cómo actualizo masivamente los márgenes de una categoría?

```sql
-- 1. Actualizar márgenes de la categoría
UPDATE config_margenes_categoria
SET margen_mayorista = 15.00,  -- Nuevo margen
    margen_minorista = 25.00
WHERE categoria_id = 1;

-- 2. Sincronizar precios de todos los productos en modo automático
SELECT * FROM fn_sincronizar_precios_automaticos();
```

---

## 📞 Soporte

Para consultas o problemas con el sistema:
1. Revisar logs de errores en PostgreSQL
2. Consultar `auditoria_precios` para rastrear cambios
3. Verificar configuración en `config_precio_producto` y `config_margenes_categoria`

---

**Versión:** 1.0
**Fecha:** 2025-12-14
**Sistema:** ERP Los Hermanos
