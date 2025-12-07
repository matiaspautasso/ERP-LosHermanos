# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Descripción del Proyecto

ERP Los Hermanos es un sistema integral de gestión empresarial para empresas medianas. El proyecto está organizado como un monorepo con aplicaciones separadas de backend (NestJS) y frontend (React), compartiendo una base de datos PostgreSQL unificada mediante Prisma ORM alojada en Supabase.

**Stack Tecnológico:**
- Backend: NestJS + TypeScript + Prisma ORM
- Frontend: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- Base de Datos: PostgreSQL (Supabase) con 17 tablas normalizadas
- Gestión de Estado: Zustand (frontend), EventEmitter (backend)
- Capa HTTP: Axios + React Query

## Comandos de Desarrollo

### Backend (desde el directorio `backend/`)
```bash
npm install              # Instalar dependencias
npm run start:dev        # Iniciar servidor dev en http://localhost:3000
npm run build            # Compilar para producción
npm run start:prod       # Ejecutar build de producción
npm run lint             # Ejecutar ESLint con auto-corrección

# Comandos de Prisma
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir interfaz gráfica Prisma Studio
npm run prisma:seed      # Poblar base de datos con datos iniciales
```

### Frontend (desde el directorio `frontend/`)
```bash
npm install              # Instalar dependencias
npm run dev              # Iniciar servidor dev en http://localhost:5173
npm run build            # Compilar para producción (ejecuta verificación TypeScript primero)
npm run preview          # Previsualizar build de producción
```

### Base de Datos (desde la raíz del proyecto, Windows)
```bash
# Ejecutar scripts SQL contra Supabase
"/c/Program Files/PostgreSQL/18/bin/psql.exe" "postgresql://postgres:PASSWORD@HOST:PORT/postgres" -f database/DB-script-Loshermanos.sql
```

## Arquitectura General

### Estructura del Monorepo
El proyecto sigue un patrón de monorepo modular donde tanto backend como frontend están organizados por módulos de negocio en lugar de capas técnicas:

```
backend/src/
├── modules/              # Módulos de negocio
│   ├── auth/            # Autenticación (basada en sesiones)
│   ├── clientes/        # Clientes
│   ├── productos/       # Productos
│   ├── ventas/          # Ventas
│   └── [otros]/         # Otros módulos
├── core/                # Servicios compartidos (PrismaService)
└── shared/              # Decoradores y utilidades

frontend/src/
├── modules/             # Módulos de negocio (refleja backend)
│   ├── auth/
│   ├── productos/
│   └── ventas/
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

Al modificar la base de datos:
1. Actualizar schema en BD → 2. `npx prisma db pull` → 3. `npx prisma generate` → 4. Reiniciar servidor

### Validación y Eventos

- **Validación:** Usa `class-validator` en DTOs (`@IsString()`, `@IsOptional()`, `@Min()`, etc.)
- **Eventos:** `@nestjs/event-emitter` en memoria, diseñado para escalar a RabbitMQ

## Flujos de Trabajo Comunes

**Agregar Módulo:** Backend (crear en `modules/`, registrar en `app.module.ts`) → Frontend (crear en `modules/`, agregar rutas en `App.tsx`)

**Despliegue:** Backend puerto 3000, Frontend puerto 5173 (dev) → archivos estáticos (prod). CORS configurado. Cookies con `secure: true` en producción.

## Estado Actual de los Módulos

### Módulos Implementados

**Auth Module (Completo)**
- Endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/profile`, `/api/auth/recover`
- Frontend: LoginPage, RegisterPage, RecoverPage con formularios validados
- Funcionalidad: Login, registro, recuperación de contraseña, gestión de sesiones

**Productos Module (En desarrollo)**
- Backend: CRUD básico implementado
- Frontend: Componentes de gestión de precios (`GestionPreciosPage`)
- Integrado con categorías y unidades

**Ventas Module (En desarrollo)**
- Backend: CRUD de ventas con detalles, búsqueda de productos
- Frontend: `NuevaVentaPage`, `ListaVentasPage`, `DetalleVentaPage`
- Funcionalidad: Crear ventas, listar ventas, ver detalles, búsqueda de productos
- Integrado con clientes y productos

**Clientes Module (Backend implementado)**
- Backend: CRUD básico de clientes
- Frontend: Pendiente

### Módulos Planificados
- **Compras:** Proveedores, órdenes de compra
- **Reportes:** Dashboard ejecutivo, métricas de negocio

---

## Historial de Cambios Recientes

### Rama de Desarrollo Actual
**Rama activa:** `desarrollo-01`

### Mejoras al Módulo de Ventas (2025-12-06)

Se implementaron 6 cambios para mejorar UX y validaciones en el flujo de ventas:

1. **Modal de confirmación al cambiar cliente** - Previene cambios accidentales con productos en carrito
2. **Permanecer en página después de crear venta** - Limpia formulario automáticamente para ventas consecutivas
3. **Campo descuento acepta valores vacíos** - Tipo `number | ''` para mejor UX
4. **Validación de cliente antes de agregar productos** - Botón deshabilitado sin cliente seleccionado
5. **Campo cantidad acepta valores vacíos** - Tipo `number | string` durante edición
6. **Eliminación completa del IVA** - Removido del schema, cálculos y UI (`total = subtotal - descuento`)

**Archivos creados:**
- `frontend/src/modules/ventas/components/ConfirmacionModal.tsx`

**Archivos modificados:**
- `backend/prisma/schema.prisma`, `backend/src/modules/ventas/ventas.service.ts`
- `frontend/src/modules/ventas/api/types.ts`, `hooks/useVentas.ts`
- `frontend/src/modules/ventas/pages/NuevaVentaPage.tsx`, `DetalleVentaPage.tsx`

### Estado de los Servidores
- ✅ Backend corriendo en `http://localhost:3000`
- ✅ Frontend corriendo en `http://localhost:5173`
- ✅ Prisma Studio en `http://localhost:5555`
- ✅ API Docs Swagger en `http://localhost:3000/api/docs`

### Credenciales de Prueba
- Usuario: `vendedor`
- Contraseña: `vendedor123`

---

### Mejoras Adicionales al Módulo de Ventas (2025-12-07)

7. **Bloqueo automático de tipo de venta al seleccionar cliente** - El select se bloquea inmediatamente con el tipo del cliente seleccionado (`disabled={!!clienteId}`). Garantiza consistencia entre tipo de cliente y tipo de venta desde el inicio.

8. **Búsqueda de productos sin distinguir acentos** - Habilitada extensión `unaccent` en PostgreSQL. Búsqueda usa `unaccent(p.nombre) ILIKE unaccent('%valor%')`. Ejemplos: "jamon" encuentra "jamón", "cafe" encuentra "café".

**Archivos modificados:**
- `frontend/src/modules/ventas/pages/NuevaVentaPage.tsx` (línea 245)
- `backend/src/modules/productos/productos.service.ts` (método `search()` reescrito con SQL raw)
