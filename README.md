# ERP Los Hermanos - Sistema de Gestión Empresarial

> **Estado:** En Desarrollo | **Último Update:** Dic 2025 | **Progreso:** 30%

## 🎯 Descripción

Sistema ERP integral para empresas medianas con gestión de usuarios, clientes, gestión de stock, ventas y compras.

**Stack Tecnológico:**
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Vite + TailwindCSS + shadcn/ui  
- **Base de Datos:** 17 tablas relacionadas, normalizada

## 📊 Módulos del Sistema

### ✅ **Autenticación** (100%)
Sistema completo de usuarios con registro, login, recuperación de contraseña y perfiles.
- **Endpoints:** `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/recover`, `/auth/profile`
- **Frontend:** LoginPage, RegisterPage, RecoverPage
- **BD:** Tabla `usuarios`

### 🔄 **Gestión de Clientes** (0% - Planificado)
CRUD de clientes, cuenta corriente y gestión de pagos.
- **BD:** `clientes`, `movimientos_cc`, `pagos_cliente`
- **Stack:** NestJS + React + Prisma

### 🔄 **Gestión de Stock** (0% - Planificado)  
Catálogo de productos, categorías, precios y control de inventario.
- **BD:** `productos`, `categorias`, `precios`, `stock`
- **Stack:** NestJS + React + Prisma

### 🔄 **Gestión de Ventas** (0% - Planificado)
Facturación, cotizaciones y reportes de ventas.
- **BD:** `ventas`, `detalle_venta`
- **Stack:** NestJS + React + Prisma

### 🔄 **Gestión de Compras** (0% - Planificado)
Proveedores, órdenes de compra y recepción de mercadería.
- **BD:** `proveedores`, `ordenes_compra`, `detalle_orden`
- **Stack:** NestJS + React + Prisma

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
