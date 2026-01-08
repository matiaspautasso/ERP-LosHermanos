# Documentación de Módulos - ERP Los Hermanos

> Índice de documentación por módulo del sistema

## 📚 Módulos Documentados

### ✅ Módulos Completados (100%)

#### 01. Autenticación
**Estado:** ✅ Producción
**Documentación:** [01-autenticacion/README.md](01-autenticacion/README.md)

**Funcionalidades:**
- Sistema completo de login/registro
- Recuperación de contraseña por email
- Gestión de perfiles de usuario
- Protección de rutas (Guards)

#### 02. Ventas
**Estado:** ✅ Producción
**Documentación Principal:** [ventas/README.md](ventas/README.md)
**Fixes Recientes:** [ventas/FIXES-2026-01-08.md](ventas/FIXES-2026-01-08.md)

**Funcionalidades:**
- CRUD completo de ventas
- Gestión de precios (individual y masiva)
- Tipos de venta (Minorista, Mayorista, Supermayorista)
- Exportación a PDF y Excel
- Historial de cambios de precios
- Filtrado de clientes por tipo de venta

**Última actualización:** 2026-01-08 (Mejoras UX)

---

### 🔄 Módulos en Desarrollo

#### 03. Productos
**Estado:** ✅ Backend completo | ✅ Frontend completo
**Progreso:** 100%

**Funcionalidades:**
- CRUD de productos con categorías
- Sistema de precios multi-nivel
- Gestión de unidades de medida
- Validación de jerarquía de precios

**Pendiente:**
- Gestión de stock en tiempo real
- Alertas de stock mínimo

#### 04. Clientes
**Estado:** ✅ Backend completo | 🔄 Frontend pendiente
**Progreso:** 50%

**Funcionalidades implementadas:**
- Backend CRUD completo
- API de cuenta corriente
- Búsqueda y filtrado

**Pendiente:**
- Frontend: ListaClientesPage
- Frontend: NuevoClientePage
- Frontend: DetalleClientePage

#### 05. Proveedores
**Estado:** 🔄 Estructura inicial
**Progreso:** 10%

**Pendiente:**
- Backend CRUD completo
- Frontend completo
- Integración con compras

#### 06. Compras
**Estado:** 🔄 Estructura inicial
**Progreso:** 10%

**Pendiente:**
- Backend: Órdenes de compra
- Backend: Recepción de mercadería
- Frontend completo
- Integración con stock

---

### ⏳ Módulos Planificados

#### 07. Reportes
**Estado:** ⏳ Planificado
**Progreso:** 0%

**Planificado:**
- Reportes de ventas por período
- Análisis de productos más vendidos
- Análisis de clientes
- Exportación automática

#### 08. Dashboard
**Estado:** ⏳ Planificado
**Progreso:** 0%

**Planificado:**
- Métricas principales (ventas, compras, stock)
- Gráficos de tendencias
- KPIs configurables
- Alertas y notificaciones

---

## 🗂️ Estructura de Documentación por Módulo

Cada módulo completado sigue esta estructura:

```
docs/modulos/[nombre-modulo]/
├── README.md                    # Documentación principal
├── FIXES-[YYYY-MM-DD].md       # Changelog de fixes específicos (opcional)
└── [documentos-adicionales].md # Guías, tutoriales, etc.
```

### Contenido de README.md

Cada README de módulo contiene:

1. **Información General** - Propósito, tecnologías, tablas BD
2. **Endpoints Implementados** - API backend y rutas frontend
3. **Configuración Técnica** - Schemas, validaciones, configuración
4. **Funcionalidades Operativas** - Lista de features implementadas
5. **Optimizaciones** - Performance, UX, seguridad
6. **Fixes Recientes** - Últimos cambios y mejoras
7. **Próximos Pasos** - Roadmap del módulo
8. **Referencias** - Links a documentación relacionada

---

## 📖 Documentación General del Proyecto

- **[README.md](../../README.md)** - Introducción, instalación y guía de navegación
- **[ARQUITECTURA.md](../../ARQUITECTURA.md)** - Stack técnico, patrones y convenciones
- **[ROADMAP.md](../../ROADMAP.md)** - Fases del proyecto y progreso
- **[CHANGELOG.md](../../CHANGELOG.md)** - Historial de cambios
- **[CLAUDE.md](../../CLAUDE.md)** - Instrucciones para Claude Code
- **[FLUJO-AGENTES.md](../../FLUJO-AGENTES.md)** - Workflow con agentes

---

## 🔍 Cómo Usar Esta Documentación

### Para Desarrolladores
1. Lee el **README.md** del módulo para entender su arquitectura
2. Revisa **ARQUITECTURA.md** para patrones y convenciones
3. Consulta **ROADMAP.md** para ver el estado actual
4. Usa **CHANGELOG.md** para ver cambios recientes

### Para Claude Code
1. Consulta **CLAUDE.md** para contexto del proyecto
2. Lee el **README.md** del módulo específico
3. Revisa **FLUJO-AGENTES.md** para workflow de desarrollo
4. Sigue las restricciones de cada agente

### Para Documentar Cambios
1. Actualiza el **README.md** del módulo afectado
2. Agrega entrada en **CHANGELOG.md** (raíz)
3. Actualiza **ROADMAP.md** si cambia el progreso
4. Crea documento **FIXES-[FECHA].md** si son múltiples fixes

---

## 📊 Progreso Global de Documentación

| Módulo | Documentación | Completitud |
|--------|--------------|-------------|
| Autenticación | ✅ Completa | 100% |
| Ventas | ✅ Completa | 100% |
| Productos | 🔄 Pendiente | 0% |
| Clientes | 🔄 Pendiente | 0% |
| Proveedores | ⏳ No iniciado | 0% |
| Compras | ⏳ No iniciado | 0% |
| Reportes | ⏳ No iniciado | 0% |
| Dashboard | ⏳ No iniciado | 0% |

**Próxima documentación a crear:** Módulo Productos (cuando se complete frontend)

---

## 🤝 Contribuciones a la Documentación

Al documentar un módulo, asegúrate de:

- ✅ Seguir la estructura estándar de README.md
- ✅ Incluir ejemplos de código cuando sea relevante
- ✅ Documentar validaciones de negocio
- ✅ Listar archivos modificados en fixes
- ✅ Actualizar CHANGELOG.md y ROADMAP.md
- ✅ Usar formato Markdown consistente
- ✅ Incluir schemas de base de datos
- ✅ Documentar endpoints de API

---

**Última actualización:** 2026-01-08
**Mantenido por:** agente-documentar (Claude Code)
