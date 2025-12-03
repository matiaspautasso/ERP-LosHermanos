# 🗺️ ROADMAP - ERP LOS HERMANOS

> **Estado:** Desarrollo Activo | **Última Actualización:** Dic 2025

## 🎯 Objetivos del Sistema

Sistema ERP modular para gestión integral de operaciones empresariales con arquitectura escalable.

**Principios:**
- Módulos independientes pero integrados
- Stack tecnológico unificado (NestJS + React + Prisma)
- Interfaz intuitiva y responsive
- Seguridad y control de accesos

## 📋 CRONOGRAMA DE DESARROLLO

### ✅ **FASE 1: BASE (COMPLETADA)**
**Módulo Autenticación:** Sistema completo de usuarios, login, registro, recuperación.

### 🔄 **FASE 2: ENTIDADES DE NEGOCIO (PLANIFICADA)**

#### **2.1 Gestión de Clientes**
**Funcionalidades:** CRUD clientes, cuenta corriente, historial de pagos
**Stack:** NestJS Controllers/Services + React Pages + Prisma Models
**BD:** `clientes`, `movimientos_cc`, `pagos_cliente`

#### **2.2 Gestión de Stock**  
**Funcionalidades:** Catálogo productos, categorías, control inventario, precios
**Stack:** NestJS Controllers/Services + React Pages + Prisma Models
**BD:** `productos`, `categorias`, `precios`, `stock`

#### **2.3 Gestión de Proveedores**
**Funcionalidades:** CRUD proveedores, historial compras, evaluaciones
**Stack:** NestJS Controllers/Services + React Pages + Prisma Models  
**BD:** `proveedores`

### 🔄 **FASE 3: OPERACIONES (FUTURA)**

#### **3.1 Gestión de Ventas**
**Funcionalidades:** Facturación, cotizaciones, reportes
**Stack:** NestJS + React + Prisma + PDF generation
**BD:** `ventas`, `detalle_venta`

#### **3.2 Gestión de Compras**
**Funcionalidades:** Órdenes de compra, recepción, seguimiento
**Stack:** NestJS + React + Prisma + Email notifications
**BD:** `ordenes_compra`, `detalle_orden`

### 🔄 **FASE 4: ANÁLISIS (FUTURA)**

#### **4.1 Reportes y Dashboard**
**Funcionalidades:** Métricas, gráficos, reportes ejecutivos
**Stack:** NestJS + React + Charts.js + PDF reports
**BD:** Views, stored procedures

## 🏗️ ESTRUCTURA TECNOLÓGICA

### **Stack Unificado para Todos los Módulos:**
- **Backend:** NestJS + TypeScript + Prisma ORM
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Database:** PostgreSQL (Supabase)
- **Autenticación:** JWT + Guards
- **Testing:** Jest + Testing Library
- **UI:** shadcn/ui + Radix components