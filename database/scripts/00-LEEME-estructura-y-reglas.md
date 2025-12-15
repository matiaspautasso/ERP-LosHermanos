## 📋 Documentación: Script de Estructura y Reglas de Negocio

### Archivo: `00-estructura-y-reglas-negocio.sql`

---

## 🎯 Propósito

Script maestro que mantiene y valida la estructura de la base de datos con reglas de negocio escalables y automatizadas.

---

## 📦 Contenido del Script

### **1. REGLAS DE NEGOCIO - PRECIOS**

#### ✅ Constraint: Jerarquía de precios
```sql
precio_supermayorista < precio_mayorista < precio_minorista
```
- Garantiza que Supermayorista sea el más bajo
- Mayorista mayor a Supermayorista
- Minorista el más alto
- Todos los precios deben ser mayores a 0

#### ✅ Índice: Un solo precio vigente por producto
- Solo el precio más reciente está activo
- Previene múltiples precios "actuales" por producto

---

### **2. REGLAS DE NEGOCIO - PRODUCTOS**

#### ✅ Vista: Productos sin precios
- Monitorea productos activos sin precios configurados
- **Acción requerida:** Configurar precios antes de vender

#### ✅ Constraint: Stock no negativo
- El stock nunca puede ser menor a 0

#### ✅ Constraint: Costo vs Precio Lista
- El costo siempre debe ser menor al precio de lista
- Previene vender a pérdida

---

### **3. REGLAS DE NEGOCIO - VENTAS**

#### ✅ Constraint: Tipos de venta válidos
- Solo: `'Supermayorista'`, `'Mayorista'`, `'Minorista'`
- **Importante:** Solo estos 3 tipos interactúan en el módulo ventas

#### ✅ Constraint: Total positivo
- Las ventas deben tener un monto mayor a 0

#### ✅ Constraint: Descuento máximo 100%
- El descuento está entre 0% y 100%

#### ✅ Constraint: Cantidades positivas
- Los productos vendidos deben tener cantidad > 0

---

### **4. REGLAS DE NEGOCIO - CLIENTES**

#### ✅ Constraint: Tipos de cliente válidos
- `'Supermayorista'`, `'Mayorista'`, `'Minorista'`, `'Mostrador'`
- Alineado con tipos de venta

#### ✅ Constraint: Formato de correo
- Validación básica de email con regex
- Permite NULL (correo opcional)

---

### **5. FUNCIONES DE UTILIDAD**

#### 📌 `fn_obtener_precio_por_tipo(producto_id, tipo_venta)`
```sql
SELECT fn_obtener_precio_por_tipo(1, 'Mayorista');
```
Retorna el precio correcto según tipo de venta.

#### 📌 `fn_validar_stock_disponible(producto_id, cantidad)`
```sql
SELECT fn_validar_stock_disponible(1, 10);
```
Retorna `TRUE` si hay suficiente stock.

#### 📌 `fn_calcular_margen_ganancia(producto_id)`
```sql
SELECT * FROM fn_calcular_margen_ganancia(1);
```
Retorna tabla con márgenes por tipo de precio:
- Tipo de precio
- Precio
- Costo
- Margen en pesos
- Margen en porcentaje

---

### **6. TRIGGERS Y AUDITORÍA**

#### 🔍 Tabla: `auditoria_precios`
Registra automáticamente todos los cambios de precios:
- Precios anteriores y nuevos
- Usuario que realizó el cambio
- Fecha y hora del cambio
- Motivo (opcional)

#### ⚡ Trigger: `trg_auditar_precios`
- Se dispara automáticamente al actualizar precios
- Registra histórico completo de cambios
- No requiere intervención manual

---

### **7. VISTAS PARA REPORTES**

#### 📊 `v_dashboard_precios_margenes`
Dashboard principal de precios y márgenes:
```sql
SELECT * FROM v_dashboard_precios_margenes;
```
Muestra:
- Producto, categoría
- Costo y 3 precios
- Márgenes porcentuales para cada tipo
- Stock actual
- Fecha de última actualización

#### ⚠️ `v_precios_jerarquia_invalida`
**Alerta temprana** de precios que violan jerarquía:
```sql
SELECT * FROM v_precios_jerarquia_invalida;
```
- Detecta precios fuera de orden
- Identifica el problema específico
- **Debe estar vacía** (0 registros)

#### 📈 `v_resumen_ventas_por_tipo`
Análisis agregado de ventas:
```sql
SELECT * FROM v_resumen_ventas_por_tipo;
```
- Cantidad de ventas por tipo
- Total facturado
- Ticket promedio
- Descuentos aplicados
- Clientes únicos
- Rango de fechas

#### 🏆 `v_productos_mas_vendidos_por_tipo`
Ranking de productos por tipo de venta:
```sql
SELECT * FROM v_productos_mas_vendidos_por_tipo
WHERE tipo_venta = 'Mayorista'
LIMIT 10;
```
- Segmentado por tipo de venta
- Cantidad total vendida
- Total facturado
- Precio promedio

---

### **8. ÍNDICES DE OPTIMIZACIÓN**

- `ix_ventas_tipo_fecha`: Búsqueda rápida de ventas por tipo y fecha
- `ix_productos_activo_stock`: Filtros de productos activos con stock
- `ix_auditoria_precios_producto_fecha`: Auditoría de cambios

---

## 🚀 Cómo Ejecutar

### Opción 1: Desde SQLTools (recomendado)
1. Abrir el archivo en VS Code
2. Conectar a la base de datos
3. `Ctrl+Shift+E` → Ejecutar todo el script

### Opción 2: Desde terminal
```bash
psql "postgresql://USER:PASS@HOST:PORT/DB" -f database/scripts/00-estructura-y-reglas-negocio.sql
```

### Opción 3: Desde pgAdmin
- Copiar y pegar el contenido
- Ejecutar como script

---

## 📋 Validaciones Post-Ejecución

El script ejecuta automáticamente un reporte final que muestra:

```
========================================
REPORTE DE VALIDACIÓN DE REGLAS DE NEGOCIO
========================================
Productos activos sin precios: 0
Precios con jerarquía inválida: 0
Productos con stock negativo: 0
Ventas con tipo inválido: 0
========================================
✓ TODAS LAS VALIDACIONES PASARON EXITOSAMENTE
========================================
```

Si hay problemas, consulta las vistas de diagnóstico.

---

## 🔍 Consultas Útiles

### Ver productos sin precios
```sql
SELECT * FROM v_productos_sin_precios;
```

### Dashboard completo de precios
```sql
SELECT * FROM v_dashboard_precios_margenes
ORDER BY margen_minorista_pct ASC;
```

### Detectar precios con jerarquía incorrecta
```sql
SELECT * FROM v_precios_jerarquia_invalida;
-- ⚠️ Esta vista DEBE estar vacía
```

### Historial de cambios de un producto
```sql
SELECT * FROM auditoria_precios 
WHERE producto_id = 1 
ORDER BY fecha_cambio DESC;
```

### Calcular margen de ganancia
```sql
SELECT * FROM fn_calcular_margen_ganancia(1);
```

### Validar stock antes de venta
```sql
SELECT fn_validar_stock_disponible(1, 50) as stock_ok;
```

### Resumen de ventas del mes actual
```sql
SELECT * FROM v_resumen_ventas_por_tipo;
```

### Top 10 productos más vendidos (Mayorista)
```sql
SELECT * FROM v_productos_mas_vendidos_por_tipo
WHERE tipo_venta = 'Mayorista'
ORDER BY cantidad_total_vendida DESC
LIMIT 10;
```

---

## 🔄 Escalabilidad y Mantenimiento

### Agregar nuevas reglas de negocio:

1. **Nueva constraint:**
```sql
ALTER TABLE tabla 
ADD CONSTRAINT nombre_constraint CHECK (condicion);
```

2. **Nueva validación:**
```sql
CREATE OR REPLACE VIEW v_nombre_validacion AS
SELECT ... WHERE condicion_invalida;
```

3. **Nuevo trigger:**
```sql
CREATE TRIGGER nombre_trigger
AFTER INSERT OR UPDATE ON tabla
FOR EACH ROW
EXECUTE FUNCTION funcion_validacion();
```

### Modificar reglas existentes:

```sql
-- Eliminar constraint antigua
ALTER TABLE tabla DROP CONSTRAINT nombre_constraint;

-- Agregar constraint nueva
ALTER TABLE tabla ADD CONSTRAINT nombre_constraint CHECK (nueva_condicion);
```

---

## ⚠️ Advertencias

1. **Datos existentes:** Si tienes datos que violan las nuevas reglas, el script fallará
   - Ejecuta primero: `SELECT * FROM v_precios_jerarquia_invalida;`
   - Corrige los datos manualmente
   - Luego ejecuta el script

2. **Backup:** Siempre haz backup antes de ejecutar en producción
   ```sql
   -- Ejecutar database/scripts/01-backup-antes-limpieza.sql
   ```

3. **Constraints vs Triggers:** Las constraints previenen inserts/updates inválidos; los triggers solo auditan

---

## 🎯 Casos de Uso

### Caso 1: Nuevo producto sin precios
❌ **Problema:** Intentar vender producto sin precios configurados

✅ **Solución:**
```sql
-- Ver productos sin precios
SELECT * FROM v_productos_sin_precios;

-- Configurar precios
INSERT INTO precios (producto_id, precio_supermayorista, precio_mayorista, precio_minorista, usuario_id)
VALUES (1, 100.00, 120.00, 150.00, 1);
```

### Caso 2: Precios fuera de jerarquía
❌ **Problema:** Mayorista menor a Supermayorista

```sql
-- Esto FALLARÁ por el constraint
INSERT INTO precios (producto_id, precio_supermayorista, precio_mayorista, precio_minorista, usuario_id)
VALUES (1, 150.00, 120.00, 100.00, 1);
-- ERROR: new row violates check constraint "chk_jerarquia_precios"
```

✅ **Solución:** Corregir jerarquía
```sql
INSERT INTO precios (producto_id, precio_supermayorista, precio_mayorista, precio_minorista, usuario_id)
VALUES (1, 100.00, 120.00, 150.00, 1);
```

### Caso 3: Analizar márgenes de ganancia
```sql
-- Ver márgenes de todos los productos
SELECT 
    producto,
    margen_supermayorista_pct,
    margen_mayorista_pct,
    margen_minorista_pct
FROM v_dashboard_precios_margenes
WHERE margen_minorista_pct < 20  -- Margen bajo (menos del 20%)
ORDER BY margen_minorista_pct ASC;
```

### Caso 4: Auditar cambios de precios sospechosos
```sql
-- Ver cambios de precios en los últimos 7 días
SELECT 
    p.nombre as producto,
    ap.precio_anterior_minorista,
    ap.precio_nuevo_minorista,
    (ap.precio_nuevo_minorista - ap.precio_anterior_minorista) as diferencia,
    ap.fecha_cambio,
    u.username as usuario
FROM auditoria_precios ap
JOIN productos p ON ap.producto_id = p.id
JOIN usuarios u ON ap.usuario_id = u.id
WHERE ap.fecha_cambio >= NOW() - INTERVAL '7 days'
ORDER BY ABS(ap.precio_nuevo_minorista - ap.precio_anterior_minorista) DESC;
```

---

## 🛠️ Troubleshooting

### Error: "relation already exists"
**Causa:** El constraint/vista/función ya existe

**Solución:** El script usa `IF NOT EXISTS` / `CREATE OR REPLACE`, ejecutar nuevamente

### Error: "new row violates check constraint"
**Causa:** Intentaste insertar datos que violan las reglas

**Solución:** Verificar los datos antes de insertar

### Vista vacía inesperadamente
**Causa:** No hay datos que cumplan la condición

**Solución:** Esto es normal, especialmente para vistas de validación

---

## 📚 Referencias

- PostgreSQL Check Constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- PostgreSQL Triggers: https://www.postgresql.org/docs/current/triggers.html
- PostgreSQL Functions: https://www.postgresql.org/docs/current/xfunc.html

---

## 🔄 Próximos Pasos Recomendados

1. **Ejecutar el script** en un entorno de desarrollo primero
2. **Validar** que todas las reglas funcionen correctamente
3. **Revisar vistas de diagnóstico** para encontrar datos inconsistentes
4. **Corregir datos** si es necesario
5. **Ejecutar en producción** después de validar
6. **Monitorear** `v_precios_jerarquia_invalida` periódicamente
7. **Revisar** `auditoria_precios` para detectar cambios sospechosos

---

## 📝 Changelog

- **2025-12-14**: Creación inicial del script
  - Reglas de negocio de precios, productos, ventas y clientes
  - Funciones de utilidad
  - Triggers de auditoría
  - Vistas de reportes y diagnóstico
  - Índices de optimización

---

**Mantenido por:** ERP Los Hermanos Team  
**Última actualización:** 2025-12-14
