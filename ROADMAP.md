# ROADMAP - ERP Los Hermanos

> **Estado:** Desarrollo Activo | **Progreso Global:** 70% | **Última Actualización:** Ene 2026

## Objetivos del Proyecto

Desarrollar un sistema ERP modular y escalable para gestión integral de empresas medianas, con enfoque en:

- Operaciones de ventas y compras
- Gestión de inventarios y precios
- Seguimiento de clientes y proveedores
- Reportes y análisis de negocio
- Arquitectura extensible para futuros módulos

## FASE 1: Infraestructura Base ✅ 100%

**Objetivo:** Establecer fundamentos técnicos y autenticación

### 1.1 Configuración Inicial ✅
- Monorepo con NestJS + React + Prisma
- Base de datos PostgreSQL (Supabase) con 17 tablas normalizadas
- Configuración de desarrollo local
- CI/CD básico

### 1.2 Autenticación ✅
- Sistema de login con sesiones (express-session)
- Registro de usuarios
- Recuperación de contraseña por email
- Protección de rutas frontend y backend
- Cambio de contraseña desde login

**Estado:** ✅ Completado

---

## FASE 2: Operaciones Core ✅ 100%

**Objetivo:** Implementar funcionalidades principales de ventas y productos

### 2.1 Gestión de Ventas ✅ 100%
- CRUD completo de ventas
- Búsqueda de productos sin acentos
- Tipos de venta (Minorista, Mayorista, Supermayorista)
- Formas de pago (Efectivo, Tarjeta, Transferencia)
- Exportación a PDF y Excel
- Detalle de venta con historial
- Filtrado automático de clientes por tipo de venta

**Mejoras recientes (2026-01-08):**
- Input de porcentaje mejorado en ajuste masivo
- Prevención de doble click en operaciones críticas
- Filtrado de clientes según tipo de venta
- Warning visual durante operaciones en proceso

**Estado:** ✅ Completado

### 2.2 Gestión de Productos ✅ 100%
- CRUD de productos con categorías y unidades
- Sistema de precios por tipo de venta
- Gestión de precios individuales y masivos
- Historial de cambios de precios con índices optimizados
- Validación de jerarquía de precios
- Exportación de lista de precios a Excel
- UX optimizada en gestión de precios (2026-01-08)

**Mejoras recientes (2026-01-08):**
- Prevención de doble click en ajuste masivo de precios
- Input de porcentaje mejorado con capacidad de borrar valor cero
- Estado de loading sincronizado entre componentes
- Warning visual durante operaciones

**Pendiente (Próximas fases):**
- Gestión de stock en tiempo real
- Alertas de stock mínimo
- Integración con módulo de compras

**Estado:** ✅ Completado (Gestión de precios optimizada)

---

## FASE 3: Entidades de Negocio 🔄 30%

**Objetivo:** Completar gestión de clientes, proveedores y compras

### 3.1 Gestión de Clientes 🔄 50%

**Completado:**
- Backend CRUD completo
- API para cuenta corriente
- Búsqueda y filtrado

**Pendiente:**
- Frontend: ListaClientesPage
- Frontend: NuevoClientePage
- Frontend: EditarClientePage
- Frontend: DetalleClientePage con cuenta corriente
- Integración con ventas

**Estado:** 🔄 Backend completado, frontend pendiente

### 3.2 Gestión de Proveedores 🔄 10%

**Completado:**
- Estructura inicial de módulo

**Pendiente:**
- Backend CRUD completo
- Frontend completo
- Integración con compras

**Estado:** 🔄 Estructura inicial

### 3.3 Gestión de Compras 🔄 10%

**Completado:**
- Estructura inicial de módulo
- Modelos de BD (ordenes_compra, detalle_oc, recepciones)

**Pendiente:**
- Backend: Órdenes de compra
- Backend: Recepción de mercadería
- Backend: Seguimiento de estado
- Frontend completo
- Integración con stock

**Estado:** 🔄 Estructura inicial

---

## FASE 4: Análisis y Reportes ⏳ 0%

**Objetivo:** Implementar dashboard y reportes ejecutivos

### 4.1 Dashboard ⏳

**Planificado:**
- Métricas principales (ventas, compras, stock)
- Gráficos de tendencias
- Alertas y notificaciones
- KPIs configurables

**Estado:** ⏳ Planificado

### 4.2 Reportes ⏳

**Planificado:**
- Reporte de ventas por período
- Reporte de productos más vendidos
- Análisis de clientes
- Análisis de proveedores
- Exportación a PDF y Excel
- Programación de reportes automáticos

**Estado:** ⏳ Planificado

---

## FASE 5: Optimizaciones y Extensiones ⏳ 0%

**Objetivo:** Mejorar performance y agregar funcionalidades avanzadas

### 5.1 Performance ⏳

**Planificado:**
- Optimización de consultas BD
- Caché de datos frecuentes
- Paginación mejorada
- Lazy loading optimizado

### 5.2 Funcionalidades Avanzadas ⏳

**Planificado:**
- Módulo de usuarios y permisos granulares
- Auditoría completa de operaciones
- Backup automático
- Notificaciones en tiempo real
- Integración con APIs externas (AFIP, etc.)

**Estado:** ⏳ Planificado

---

## Resumen de Progreso por Módulo

| Módulo | Fase | Progreso | Backend | Frontend |
|--------|------|----------|---------|----------|
| Autenticación | 1 | ✅ 100% | Completo | Completo |
| Ventas | 2 | ✅ 100% | Completo | Completo |
| Productos | 2 | ✅ 100% | Completo | Completo |
| Clientes | 3 | 🔄 50% | Completo | Pendiente |
| Proveedores | 3 | 🔄 10% | Inicial | Pendiente |
| Compras | 3 | 🔄 10% | Inicial | Pendiente |
| Reportes | 4 | ⏳ 0% | Planificado | Planificado |
| Dashboard | 4 | ⏳ 0% | Planificado | Planificado |

---

## Próximos Pasos (Prioridad)

1. **Completar Módulo Clientes (Frontend)** - Fase 3.1
   - Crear todas las páginas de gestión de clientes
   - Integrar con sistema de ventas
   - Implementar cuenta corriente

2. **Implementar Módulo Proveedores** - Fase 3.2
   - Backend CRUD completo
   - Frontend completo
   - Integración con compras

3. **Implementar Módulo Compras** - Fase 3.3
   - Órdenes de compra
   - Recepción de mercadería
   - Integración con stock

4. **Gestión de Stock** - Fase 2.2 (Extensión)
   - Control de inventarios en tiempo real
   - Alertas de stock mínimo
   - Integración con compras y ventas

5. **Dashboard y Reportes** - Fase 4
   - Métricas básicas
   - Reportes de ventas
   - Análisis de negocio

---

## Notas

- Las fases no son estrictamente secuenciales; algunos módulos de Fase 3 pueden desarrollarse en paralelo
- Los porcentajes son estimaciones basadas en funcionalidad implementada vs planificada
- Para detalles técnicos de implementación, ver [ARQUITECTURA.md](ARQUITECTURA.md)
- Para comandos y desarrollo, ver [CLAUDE.md](CLAUDE.md) y [README.md](README.md)
