# 🗺️ ROADMAP - ERP LOS HERMANOS

> **Estado:** Desarrollo Activo | **Última Actualización:** Dic 2025

## 🎯 Objetivos del Sistema

Sistema ERP modular para gestión integral de operaciones empresariales con arquitectura escalable.

**Principios:**
- Módulos independientes pero integrados
- Stack tecnológico unificado (NestJS + React + Prisma)
- Interfaz intuitiva y responsive
- Seguridad y control de accesos basados en sesiones

## 📋 CRONOGRAMA DE DESARROLLO

### ✅ **FASE 1: BASE (COMPLETADA)**
**Módulo Autenticación:** Sistema completo de usuarios, login, registro, recuperación de contraseña.
- Autenticación basada en sesiones con express-session
- Cookies httpOnly con expiración de 24 horas
- Recuperación de contraseña por email (nodemailer)

### ✅ **FASE 2: OPERACIONES CORE (COMPLETADA)**

#### **2.1 Gestión de Ventas** ✅
**Estado:** Implementado y funcional
**Funcionalidades:** Nueva venta, lista de ventas, detalle de venta, búsqueda de productos sin acentos
**Stack:** NestJS + React + Prisma + unaccent (PostgreSQL)
**BD:** `ventas`, `detalle_venta`
**Características:** Tipos de venta (Minorista, Mayorista, Supermayorista), formas de pago múltiples, sin IVA

#### **2.2 Gestión de Productos** 🔄 (70%)
**Estado:** Backend completo, frontend funcional con mejoras pendientes
**Funcionalidades:** CRUD productos, categorías, gestión de precios, ajuste masivo de precios
**Stack:** NestJS + React + Prisma
**BD:** `productos`, `categorias`, `precios`, `unidades`
**Pendiente:** Optimización de UX en gestión de precios

### 🔄 **FASE 3: ENTIDADES DE NEGOCIO (EN DESARROLLO)**

#### **3.1 Gestión de Clientes** 🔄 (50%)
**Estado:** Backend completo, frontend pendiente
**Funcionalidades:** CRUD clientes, cuenta corriente, historial de pagos
**Stack:** NestJS Controllers/Services + Prisma Models
**BD:** `clientes`, `movimientos_cc`, `pagos_cliente`
**Pendiente:** Interfaces de usuario (ListaClientesPage, NuevoClientePage, etc.)

#### **3.2 Gestión de Proveedores** 🔄 (10%)
**Estado:** Estructura inicial creada
**Funcionalidades:** CRUD proveedores, historial compras
**Stack:** NestJS + React + Prisma
**BD:** `proveedores`

#### **3.3 Gestión de Compras** 🔄 (10%)
**Estado:** Estructura inicial creada
**Funcionalidades:** Órdenes de compra, recepción, seguimiento
**Stack:** NestJS + React + Prisma
**BD:** `ordenes_compra`, `detalle_oc`

### 🔄 **FASE 4: ANÁLISIS (FUTURA)**

#### **4.1 Reportes y Dashboard**
**Funcionalidades:** Métricas, gráficos, reportes ejecutivos
**Stack:** NestJS + React + Charts.js + PDF reports
**BD:** Views, stored procedures

## 🏗️ ESTRUCTURA TECNOLÓGICA

### **Stack Unificado para Todos los Módulos:**
- **Backend:** NestJS + TypeScript + Prisma ORM
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Database:** PostgreSQL (Supabase)
- **Autenticación:** express-session + cookies httpOnly (no JWT)
- **Testing:** Jest + Testing Library (configurado, sin tests implementados)
- **UI:** shadcn/ui + Radix components
- **State Management:** Zustand (frontend), EventEmitter (backend)
- **HTTP:** Axios + React Query