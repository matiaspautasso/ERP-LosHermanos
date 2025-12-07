# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

ERP Los Hermanos es un sistema integral de gestión empresarial para empresas medianas. El proyecto está organizado como un monorepo con aplicaciones separadas de backend (NestJS) y frontend (React), compartiendo una base de datos PostgreSQL unificada mediante Prisma ORM alojada en Supabase.

**Stack Tecnológico:**
- Backend: NestJS + TypeScript + Prisma ORM + express-session
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- Base de Datos: PostgreSQL (Supabase) con 17 tablas normalizadas
- Gestión de Estado: Zustand (frontend), EventEmitter (backend)
- Capa HTTP: Axios + React Query
- Testing: Jest (configurado pero sin tests implementados)

## Comandos de Desarrollo

### Backend (desde el directorio `backend/`)
```bash
npm install              # Instalar dependencias
npm run start:dev        # Iniciar servidor dev en http://localhost:3000
npm run build            # Compilar para producción
npm run start:prod       # Ejecutar build de producción
npm run lint             # Ejecutar ESLint con auto-corrección
npm test                 # Tests (placeholder - sin tests implementados)

# Comandos de Prisma
npm run prisma:generate  # Generar Prisma Client después de cambios en schema
npm run prisma:migrate   # Crear y aplicar migración
npm run prisma:studio    # Abrir interfaz gráfica en http://localhost:5555
npm run prisma:seed      # Poblar base de datos con datos iniciales

# Flujo de trabajo con Prisma
npx prisma db pull       # Sincronizar schema desde base de datos existente
npx prisma generate      # Regenerar Prisma Client
```

### Frontend (desde el directorio `frontend/`)
```bash
npm install              # Instalar dependencias
npm run dev              # Iniciar servidor dev en http://localhost:5173
npm run build            # Compilar para producción (ejecuta tsc primero)
npm run preview          # Previsualizar build de producción
```

### Base de Datos (desde la raíz del proyecto, Windows)
```bash
# Ejecutar scripts SQL contra Supabase usando psql local
"/c/Program Files/PostgreSQL/18/bin/psql.exe" "postgresql://postgres:PASSWORD@HOST:PORT/postgres" -f database/DB-script-Loshermanos.sql
```

## Arquitectura General

### Estructura del Monorepo
El proyecto sigue un patrón de monorepo modular donde tanto backend como frontend están organizados por módulos de negocio en lugar de capas técnicas:

```
backend/src/
├── modules/              # Módulos de negocio
│   ├── auth/            # ✅ Autenticación (basada en sesiones)
│   ├── usuarios/        # 🔄 Gestión de usuarios (en desarrollo)
│   ├── clientes/        # 🔄 Gestión de clientes (backend completado)
│   ├── productos/       # 🔄 Productos y precios
│   ├── ventas/          # ✅ Ventas y detalles de venta
│   ├── compras/         # ⏳ Compras (estructura inicial)
│   ├── proveedores/     # ⏳ Proveedores (estructura inicial)
│   ├── email/           # 📧 Servicio de emails (nodemailer)
│   └── reportes/        # ⏳ Reportes (estructura inicial)
├── core/                # Servicios compartidos (PrismaService)
└── shared/              # Decoradores y utilidades

frontend/src/
├── modules/             # Módulos de negocio (solo implementados)
│   ├── auth/            # ✅ Login, registro, recuperación
│   ├── productos/       # 🔄 Gestión de precios
│   └── ventas/          # ✅ Nueva venta, lista, detalles
├── core/                # Configuración global (axios, stores, rutas)
└── shared/              # Componentes UI reutilizables (shadcn/ui)
```

### Patrón de Módulos

**Estructura de Módulo Backend:**
```
modules/[modulo]/
├── [modulo].module.ts      # Definición del módulo NestJS
├── [modulo].controller.ts  # Endpoints REST
├── [modulo].service.ts     # Lógica de negocio
├── dto/                    # DTOs con class-validator
│   ├── create-[modulo].dto.ts
│   └── update-[modulo].dto.ts
└── events/                 # Eventos de dominio (opcional)
```

**Estructura de Módulo Frontend:**
```
modules/[modulo]/
├── pages/                  # Componentes de página
├── components/            # Componentes específicos del módulo
├── hooks/                 # React hooks personalizados
└── api/                   # Capa de API
    ├── [modulo]Service.ts
    └── types.ts
```

### Flujo de Autenticación
- **Tipo:** Autenticación basada en sesiones con express-session
- **Sesiones:** Almacenadas en cookies (httpOnly, sameSite: lax, expiración de 24 horas)
- **Contraseñas:** Hasheadas con bcrypt (10 rondas)
- **Endpoints Principales:** `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/profile`
- **Frontend:** Axios configurado con `withCredentials: true` para enviar cookies automáticamente
- **Estado:** Gestionado mediante Zustand store (`authStore`)
- **Protección de Rutas:** Componente `ProtectedRoute` envuelve rutas protegidas y redirige a login si no hay autenticación

### Arquitectura de Base de Datos

**Puntos Clave:**
- 17 tablas normalizadas con restricciones de foreign key adecuadas
- IDs BigInt en todas las tablas (serializados a strings mediante config global)
- Timestamps usan `@db.Timestamptz(6)` para manejo de zona horaria
- Tipos Decimal para valores monetarios (`@db.Decimal(12, 2)`)
- Mapeo de nombres: modelo `User` mapea a tabla `usuarios`
- Schema de Prisma auto-generado desde base de datos existente

**Tablas Principales:**
- `usuarios` (User): Usuarios del sistema con autenticación
- `clientes`: Clientes con seguimiento de cuenta corriente
- `productos`: Productos con precios, stock, categorías
- `ventas` + `detalle_venta`: Transacciones de ventas
- `ordenes_compra` + `detalle_oc`: Órdenes de compra
- `movimientos_stock`: Auditoría de movimientos de stock
- `precios`: Historial de precios de productos

**Relaciones Importantes:**
- La mayoría de operaciones requieren `usuario_id` (usuario que realizó la acción)
- `productos` se vincula con `categorias` y `unidades`
- `ventas` se vincula con `clientes`, `User`, y tiene múltiples `detalle_venta`
- Eliminaciones en cascada configuradas en tablas de detalle (ej. `detalle_venta` cuando se elimina `ventas`)

## Configuración de Variables de Entorno

### Backend `.env`
Variables requeridas (ver `backend/.env.example`):
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=tu-clave-secreta
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000/api
```

## Detalles Importantes de Implementación

### Configuraciones Globales

**Backend (`main.ts`):**
- Validation pipe global con `whitelist: true`, `forbidNonWhitelisted: true` y `transform: true`
- CORS habilitado para URL del frontend con credenciales
- Serialización de BigInt a string configurada globalmente mediante prototipo
- Express-session configurada con cookies (maxAge: 24h, httpOnly, secure en producción)
- Documentación Swagger en `/api/docs`
- Todas las rutas con prefijo `/api`

**Frontend (`core/api/axios.ts`):**
- URL base desde variable de entorno `VITE_API_URL`
- `withCredentials: true` para sesiones basadas en cookies
- Timeout de 10 segundos
- Interceptor global de errores para manejo de 401

**Frontend - React Query:**
- Configurado con retry: 1 y refetchOnWindowFocus: false
- Utilizado para manejo de cache y estado del servidor
- QueryClient configurado en `App.tsx`

### Trabajando con Prisma

**Workflow cuando se modifica la base de datos:**
1. Actualizar schema directamente en PostgreSQL (Supabase)
2. `npx prisma db pull` - Sincroniza schema.prisma con la BD
3. `npx prisma generate` - Regenera Prisma Client con nuevos tipos
4. Reiniciar servidor dev (`npm run start:dev`)

**Nota importante:** Este proyecto usa database-first approach. Los cambios se hacen primero en PostgreSQL, luego se sincronizan con Prisma.

### Validación y Eventos

- **Validación:** Usa `class-validator` en DTOs (`@IsString()`, `@IsOptional()`, `@Min()`, etc.)
- **Eventos:** `@nestjs/event-emitter` en memoria, diseñado para escalar a RabbitMQ

## Flujos de Trabajo Comunes

**Agregar Módulo:** Backend (crear en `modules/`, registrar en `app.module.ts`) → Frontend (crear en `modules/`, agregar rutas en `App.tsx`)

**Despliegue:** Backend puerto 3000, Frontend puerto 5173 (dev) → archivos estáticos (prod). CORS configurado. Cookies con `secure: true` en producción.

## Estado de los Módulos

### ✅ Módulos Completados

**Auth Module**
- Endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/profile`, `/api/auth/recover`
- Frontend: LoginPage, RegisterPage, RecoverPage, ProtectedRoute
- Autenticación basada en sesiones (express-session, no JWT)
- Recuperación de contraseña por email (nodemailer)
- **Características adicionales:** Cambio de contraseña desde login

**Ventas Module**
- Backend: CRUD completo, búsqueda de productos con `unaccent`
- Frontend: NuevaVentaPage, ListaVentasPage, DetalleVentaPage, modal de confirmación
- Características: Búsqueda sin acentos, soporte Supermayorista, sin IVA
- UX optimizada para ventas consecutivas

### 🔄 Módulos en Desarrollo

**Productos Module**
- Backend: CRUD básico, búsqueda avanzada
- Frontend: GestionPreciosPage (parcial)
- Integrado con categorías, unidades y precios

**Clientes Module**
- Backend: CRUD completo
- Frontend: Pendiente

**Usuarios Module**
- Backend: Estructura inicial
- Funcionalidad: Por definir

### ⏳ Módulos Planificados

**Compras:** Backend inicial creado, frontend pendiente
**Proveedores:** Backend inicial creado, frontend pendiente
**Reportes:** Estructura inicial, sin implementación
**Email:** Servicio base implementado (usado en auth recovery)

## Configuración de Desarrollo

### URLs de Desarrollo
- **Backend API:** `http://localhost:3000/api`
- **Frontend:** `http://localhost:5173`
- **Swagger Docs:** `http://localhost:3000/api/docs`
- **Prisma Studio:** `http://localhost:5555` (cuando se ejecuta `npm run prisma:studio`)

### Credenciales de Prueba
- Email: `vendedor@erp.com`
- Contraseña: `vendedor123`

### Extensiones PostgreSQL Habilitadas
- `unaccent` - Búsquedas sin distinguir acentos (ej: "cafe" encuentra "café")

## Cambios Recientes (Diciembre 2025)

### Rama Actual: `desarrollo`

**Mejoras al Módulo de Ventas (9 cambios implementados):**
1. Modal de confirmación al cambiar cliente
2. Formulario se mantiene abierto después de crear venta
3. Campo descuento acepta valores vacíos
4. Validación de cliente antes de agregar productos
5. Campo cantidad acepta valores vacíos durante edición
6. Eliminación completa del IVA del sistema
7. Bloqueo automático de tipo de venta al seleccionar cliente
8. Búsqueda de productos sin distinguir acentos
9. Modal de búsqueda permanece abierto al agregar productos

**Mejoras al Módulo de Auth:**
- Funcionalidad de cambio de contraseña desde login
- Botón de registro restaurado en página de login

**Cambios en Base de Datos:**
- Campo `iva_porcentaje` eliminado de tabla `detalle_venta`
- Campo `precio_supermayorista` agregado a tabla `precios` (Decimal 12,2, default 0)
- VARCHAR ampliado a 20 caracteres en campos `tipo` y `tipo_venta`

**Componentes Nuevos:**
- `ConfirmacionModal.tsx` - Modal reutilizable de confirmación

## Convenciones de Código

### Backend
- DTOs para validación con `class-validator` decorators
- Servicios manejan lógica de negocio, controllers solo routing
- Todas las operaciones retornan objetos con estructura consistente
- BigInt serializados automáticamente como strings en JSON

### Frontend
- Hooks personalizados usan prefijo `use` (ej: `useVentas`, `useAuth`)
- Stores de Zustand para estado global (ej: `authStore`)
- React Query para cache y sincronización con servidor
- Componentes shadcn/ui en `shared/components/ui/`

### Base de Datos
- Database-first: cambios se hacen en PostgreSQL, luego `prisma db pull`
- IDs son BigInt (convertidos a string en aplicación)
- Timestamps con zona horaria: `@db.Timestamptz(6)`
- Decimales monetarios: `@db.Decimal(12, 2)`

## Implementaciones Futuras Planificadas

### Gestión de Precios (Submódulo de Ventas)
**Objetivo:** Interfaz unificada para visualización, edición individual y ajustes masivos de precios.

**Enfoque UX:** Pantalla única sin navegación entre vistas separadas.

**Funcionalidad principal:**
- Tabla con filtros por tipo de precio (Minorista/Mayorista/Supermayorista) y búsqueda
- Edición individual mediante modal
- Ajustes masivos por porcentaje o monto fijo
- Filtros opcionales por categoría

**Endpoints a implementar:**
- `GET /api/productos/precios/lista` - Listado con filtros
- `PATCH /api/productos/precios/masivo` - Actualización masiva

**Componentes Frontend a crear:**
- `GestionPreciosPage.tsx` - Página principal unificada
- `ModalEditarPrecio.tsx` - Edición de precios individuales
- `ModalAjusteMasivo.tsx` - Configuración de ajustes masivos
- `usePrecios` hook - Integración con React Query

**Archivos Backend a crear/modificar:**
- DTOs: `FiltrosPreciosDto`, `ActualizacionMasivaDto`
- Service: métodos `getPreciosConFiltros()`, `actualizarPreciosMasivo()`
- Controller: nuevos endpoints GET y PATCH

### Módulo Clientes (Frontend)
**Pendiente:** Interfaces de usuario para gestión de clientes (backend ya implementado)

**Páginas a crear:**
- ListaClientesPage - Vista de todos los clientes
- NuevoClientePage - Alta de cliente
- EditarClientePage - Modificación de datos
- DetalleClientePage - Visualización y cuenta corriente

### Módulo Compras
**Pendiente:** Implementación completa de órdenes de compra, recepción y gestión de proveedores

### Módulo Reportes
**Pendiente:** Dashboard con métricas, gráficos y exportación a PDF
