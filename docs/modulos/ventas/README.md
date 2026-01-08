# 📊 MÓDULO VENTAS - ESTADO

> **Última actualización:** Ene 2026 | **Estado:** ✅ FUNCIONANDO (100%)

## 🎯 INFORMACIÓN GENERAL

**Funcionalidad:** Sistema completo de gestión de ventas con soporte multi-precio, gestión de precios masiva, filtros avanzados y exportación.
**Tecnologías:** NestJS + React + TypeScript + Prisma + PostgreSQL + jsPDF + xlsx
**Base de Datos:** Tablas `ventas`, `detalle_venta`, `productos`, `clientes`, `precios_producto`, `historial_precios`

## 🔐 ENDPOINTS IMPLEMENTADOS

### Backend (NestJS) - `/api/ventas`
- `POST /` - Crear nueva venta con detalles
- `GET /` - Listar ventas con paginación y filtros
- `GET /:id` - Obtener detalle de venta específica
- `PUT /:id` - Actualizar venta existente
- `DELETE /:id` - Eliminar venta (soft delete)

### Backend (NestJS) - `/api/precios`
- `GET /` - Listar precios de productos con filtros
- `PUT /masivo` - Actualizar precios masivamente (por categoría, tipo de venta)
- `GET /historial/:productoId` - Obtener historial de cambios de precio
- `PUT /:productoId` - Actualizar precio individual de producto

### Frontend (React)
- **NuevaVentaPage** - Formulario de creación de ventas con búsqueda de productos y cálculo automático
- **ListaVentasPage** - Listado de ventas con filtros, búsqueda y exportación
- **DetalleVentaPage** - Vista detallada de venta con información completa
- **GestionPreciosPage** - Gestión de precios individuales y masivos con historial
- **ModalAjusteMasivo** - Modal para ajuste masivo de precios con validaciones

## ⚙️ CONFIGURACIÓN TÉCNICA

### Backend

#### Validaciones de Negocio
```typescript
// Jerarquía de precios
minorista >= mayorista >= supermayorista

// Tipos de venta
enum TipoVenta {
  MINORISTA = 'Minorista',
  MAYORISTA = 'Mayorista',
  SUPERMAYORISTA = 'Supermayorista'
}

// Formas de pago
enum FormaPago {
  EFECTIVO = 'Efectivo',
  TARJETA = 'Tarjeta',
  TRANSFERENCIA = 'Transferencia'
}
```

#### Database Schema (Ventas)
```sql
CREATE TABLE ventas (
  id SERIAL PRIMARY KEY,
  fecha_venta TIMESTAMP NOT NULL DEFAULT NOW(),
  cliente_id INTEGER REFERENCES clientes(id),
  tipo_venta VARCHAR(20) NOT NULL,
  forma_pago VARCHAR(20) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detalle_venta (
  id SERIAL PRIMARY KEY,
  venta_id INTEGER REFERENCES ventas(id),
  producto_id INTEGER REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);
```

#### Database Schema (Precios)
```sql
CREATE TABLE precios_producto (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER UNIQUE REFERENCES productos(id),
  precio_minorista DECIMAL(10, 2) NOT NULL,
  precio_mayorista DECIMAL(10, 2) NOT NULL,
  precio_supermayorista DECIMAL(10, 2) NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE historial_precios (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER REFERENCES productos(id),
  precio_minorista_anterior DECIMAL(10, 2),
  precio_mayorista_anterior DECIMAL(10, 2),
  precio_supermayorista_anterior DECIMAL(10, 2),
  precio_minorista_nuevo DECIMAL(10, 2),
  precio_mayorista_nuevo DECIMAL(10, 2),
  precio_supermayorista_nuevo DECIMAL(10, 2),
  tipo_cambio VARCHAR(50),
  fecha_cambio TIMESTAMP DEFAULT NOW(),
  usuario_id INTEGER REFERENCES usuarios(id)
);

-- Índices optimizados
CREATE INDEX idx_historial_producto_fecha
  ON historial_precios(producto_id, fecha_cambio DESC);
CREATE INDEX idx_historial_fecha
  ON historial_precios(fecha_cambio DESC);
```

### Frontend

#### Estado de Venta
```typescript
interface Venta {
  id: number;
  fecha_venta: Date;
  cliente?: Cliente;
  tipo_venta: TipoVenta;
  forma_pago: FormaPago;
  total: number;
  detalles: DetalleVenta[];
  usuario: Usuario;
}

interface DetalleVenta {
  id: number;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
```

#### Estado de Precios
```typescript
interface PrecioProducto {
  id: number;
  producto_id: number;
  producto: Producto;
  precio_minorista: number;
  precio_mayorista: number;
  precio_supermayorista: number;
  fecha_actualizacion: Date;
}

interface HistorialPrecio {
  id: number;
  producto_id: number;
  precio_minorista_anterior: number;
  precio_mayorista_anterior: number;
  precio_supermayorista_anterior: number;
  precio_minorista_nuevo: number;
  precio_mayorista_nuevo: number;
  precio_supermayorista_nuevo: number;
  tipo_cambio: string;
  fecha_cambio: Date;
  usuario: Usuario;
}
```

## ✅ FUNCIONALIDADES OPERATIVAS

### Gestión de Ventas
1. **Nueva Venta** - Creación de ventas con selección de productos y cálculo automático
2. **Búsqueda de productos** - Búsqueda sin acentos con normalización de texto
3. **Tipos de venta** - Soporte para Minorista, Mayorista y Supermayorista con precios diferenciados
4. **Formas de pago** - Efectivo, Tarjeta y Transferencia
5. **Filtrado de clientes** - Clientes filtrados según tipo de venta seleccionado
6. **Exportación** - PDF y Excel de ventas individuales
7. **Listado con filtros** - Búsqueda por cliente, fecha, tipo de venta y forma de pago
8. **Detalle de venta** - Vista completa con historial y detalles

### Gestión de Precios
1. **Precios individuales** - Edición de precios por producto
2. **Ajuste masivo** - Actualización masiva por categoría y/o tipo de venta
3. **Validación de jerarquía** - Control automático de jerarquía de precios
4. **Historial de cambios** - Registro completo de cambios con usuario y fecha
5. **Exportación a Excel** - Lista de precios completa exportable
6. **Filtros avanzados** - Por categoría, nombre, código
7. **Prevención de doble click** - Protección contra operaciones duplicadas
8. **UX mejorada** - Input de porcentaje mejorado con capacidad de borrar valor cero

## 🔧 OPTIMIZACIONES IMPLEMENTADAS

### Base de Datos
- **Índices optimizados** en `historial_precios` para consultas rápidas
- **Database-first approach** para mantener integridad
- **Soft deletes** para auditoría de ventas

### Frontend
- **Normalización de texto** sin acentos para búsquedas
- **Cálculo automático** de subtotales y totales
- **Validación en tiempo real** de precios y jerarquía
- **Loading states** sincronizados entre componentes
- **Prevención de doble click** en operaciones críticas

## 📝 FIXES RECIENTES (2026-01-08)

### UX Mejoras en Gestión de Precios
1. **Input de porcentaje mejorado** - Ahora permite borrar el valor "0" para facilitar edición
2. **Prevención de doble click** - Botón "Aplicar Ajuste Masivo" se deshabilita durante operación
3. **Warning visual** - Indicador visual cuando el ajuste está en proceso
4. **Estado sincronizado** - `isLoading` compartido entre GestionPreciosPage y ModalAjusteMasivo

### Filtrado de Clientes en Nueva Venta
1. **Filtro automático** - Clientes filtrados según tipo de venta seleccionado
2. **Mejora de usabilidad** - Solo muestra clientes relevantes para cada tipo de operación
3. **Reducción de errores** - Previene selección incorrecta de clientes

**Archivos modificados:**
- `frontend/src/modules/ventas/components/ModalAjusteMasivo.tsx`
- `frontend/src/modules/ventas/pages/NuevaVentaPage.tsx`
- `frontend/src/modules/ventas/pages/GestionPreciosPage.tsx`

## 🚀 PRÓXIMOS PASOS

1. **Gestión de stock** - Integración con sistema de inventarios
2. **Alertas de stock mínimo** - Notificaciones automáticas
3. **Reportes de ventas** - Dashboard con métricas y gráficos
4. **Integración con cuenta corriente** - Vinculación con módulo de clientes

## 📚 DOCUMENTACIÓN ADICIONAL

- **[ARQUITECTURA.md](../../../ARQUITECTURA.md)** - Detalles técnicos del stack
- **[ROADMAP.md](../../../ROADMAP.md)** - Estado del módulo en roadmap general
- **[CHANGELOG.md](../../../CHANGELOG.md)** - Historial completo de cambios
- **[database/scripts/GUIA-SISTEMA-PRECIOS.md](../../../database/scripts/GUIA-SISTEMA-PRECIOS.md)** - Guía del sistema de precios
