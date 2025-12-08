# ERP Los Hermanos - Sistema de Gestión Empresarial

> **Estado:** En Desarrollo | **Último Update:** Dic 2025 | **Progreso:** 65%

## 🎯 Descripción

Sistema ERP integral para empresas medianas con gestión de usuarios, clientes, gestión de stock, ventas y compras.

**Stack Tecnológico:**
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Base de Datos:** 17 tablas relacionadas, normalizada
- **Autenticación:** express-session con cookies (no JWT)

## 📊 Módulos del Sistema

### ✅ **Autenticación** (100%)
Sistema completo de usuarios con registro, login, recuperación de contraseña y perfiles.
- **Endpoints:** `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/recover`, `/auth/profile`
- **Frontend:** LoginPage, RegisterPage, RecoverPage, ProtectedRoute
- **BD:** Tabla `usuarios`
- **Autenticación:** express-session con cookies httpOnly

### ✅ **Gestión de Ventas** (100%)
Sistema completo de ventas con búsqueda de productos, gestión de clientes y tipos de venta.
- **Backend:** CRUD completo, búsqueda con unaccent, soporte Supermayorista
- **Frontend:** NuevaVentaPage, ListaVentasPage, DetalleVentaPage
- **BD:** `ventas`, `detalle_venta`
- **Características:** Sin IVA, búsqueda sin acentos, formas de pago múltiples

### 🔄 **Gestión de Productos** (70%)
Catálogo de productos, categorías, precios y control de inventario.
- **Backend:** CRUD completo, búsqueda avanzada, gestión de precios
- **Frontend:** GestionPreciosPage (funcional, mejoras de UX pendientes)
- **BD:** `productos`, `categorias`, `precios`, `unidades`
- **Stack:** NestJS + React + Prisma

### 🔄 **Gestión de Clientes** (50%)
CRUD de clientes, cuenta corriente y gestión de pagos.
- **Backend:** CRUD completo implementado
- **Frontend:** Pendiente de desarrollo
- **BD:** `clientes`, `movimientos_cc`, `pagos_cliente`

### 🔄 **Gestión de Compras** (10%)
Proveedores, órdenes de compra y recepción de mercadería.
- **Backend:** Estructura inicial creada
- **Frontend:** Pendiente de desarrollo
- **BD:** `proveedores`, `ordenes_compra`, `detalle_oc`

### 🔄 **Reportes** (0% - Planificado)
Dashboard ejecutivo con métricas y análisis de negocio.
- **BD:** Views y stored procedures
- **Stack:** NestJS + React + Charts.js

## 🚀 Instalación y Configuración

### 1. Backend
```bash
cd backend
npm install
npm run start:dev  # http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### 3. Base de Datos
- Configurar variables en `.env` (Supabase)
- El script SQL está en `database/DB-script-Loshermanos.sql`

## 📚 Documentación

- **[Autenticación](docs/modulos/01-autenticacion/README.md)** - Estado y configuración del módulo Auth
- **[Roadmap](ROADMAP.md)** - Cronograma de desarrollo
- **[Arquitectura](ARQUITECTURA.md)** - Documentación técnica
