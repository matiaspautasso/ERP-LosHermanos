# CHANGELOG - ERP Los Hermanos

> Registro cronológico de cambios significativos en el proyecto

## Formato

- **feat:** Nueva funcionalidad
- **fix:** Corrección de bugs
- **perf:** Mejora de rendimiento
- **refactor:** Refactorización de código
- **docs:** Cambios en documentación
- **style:** Cambios de formato (sin afectar lógica)
- **test:** Agregar o modificar tests
- **chore:** Tareas de mantenimiento

---

## [2026-01-08] - Mejoras UX en Módulo Ventas

### Frontend - Gestión de Precios

**fix: Mejorar UX del modal de ajuste masivo de precios**
- Permitir borrar el valor "0" en el input de porcentaje para facilitar edición
- Prevenir doble click en botón de ajuste masivo durante operación
- Agregar warning visual cuando el ajuste está en proceso
- Pasar estado `isLoading` desde página principal al modal

**Archivos modificados:**
- `frontend/src/modules/ventas/components/ModalAjusteMasivo.tsx`
- `frontend/src/modules/ventas/pages/GestionPreciosPage.tsx`

**Impacto:** Mejora la experiencia de usuario al realizar ajustes masivos de precios, evitando errores y operaciones duplicadas.

### Frontend - Nueva Venta

**fix: Filtrar clientes según tipo de venta seleccionado**
- Los clientes ahora se filtran automáticamente según el tipo de venta (Minorista, Mayorista, Supermayorista)
- Mejora la usabilidad al mostrar solo clientes relevantes para cada tipo de operación

**Archivos modificados:**
- `frontend/src/modules/ventas/pages/NuevaVentaPage.tsx`

**Impacto:** Reduce errores en la selección de clientes y agiliza el proceso de creación de ventas.

### Documentación

**docs: Crear documentación completa del módulo Ventas**
- Creado `docs/modulos/ventas/README.md` con documentación exhaustiva del módulo
- Creado `docs/modulos/ventas/FIXES-2026-01-08.md` con detalles de fixes implementados
- Creado `docs/modulos/README.md` como índice de documentación de módulos
- Actualizado `ROADMAP.md` con progreso de Fase 2 (100% completada)

**Archivos creados/modificados:**
- `docs/modulos/ventas/README.md` (nuevo)
- `docs/modulos/ventas/FIXES-2026-01-08.md` (nuevo)
- `docs/modulos/README.md` (nuevo)
- `ROADMAP.md` (actualizado)

**Impacto:** Mejora significativa en la documentación del proyecto, facilitando onboarding y mantenimiento futuro.

---

## Leyenda

- ✅ Completado
- 🔄 En desarrollo
- ⏳ Planificado
- ❌ Cancelado

---

## Plantilla para nuevas entradas

```markdown
## [YYYY-MM-DD] - Título del cambio

### Categoría (Backend / Frontend / Database)

**tipo: Descripción breve**
- Detalle del cambio 1
- Detalle del cambio 2

**Archivos modificados:**
- `ruta/archivo1.ts`
- `ruta/archivo2.tsx`

**Impacto:** Descripción del impacto en funcionalidad/performance/UX
```
