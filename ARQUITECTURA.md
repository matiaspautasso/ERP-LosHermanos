# 🏗️ ARQUITECTURA - ERP LOS HERMANOS

> **Última Actualización:** Dic 2025

## 🎯 Visión Arquitectónica

Arquitectura monorepo modular que combina eficiencia operativa con separación clara de responsabilidades.

**Principios:**
- Backend y Frontend separados pero cohesivos
- Módulos independientes con servicios compartidos  
- Escalabilidad horizontal por módulos
- Testing granular y documentación modular

## 📁 ESTRUCTURA REAL DEL PROYECTO

```
ERP-LosHermanos/
├── backend/                    # Monorepo backend único
│   ├── src/
│   │   ├── modules/           # Módulos de negocio
│   │   │   ├── auth/          # ✅ Autenticación (sesiones)
│   │   │   ├── ventas/        # ✅ Gestión de ventas
│   │   │   ├── productos/     # 🔄 Productos y precios (70%)
│   │   │   ├── clientes/      # 🔄 Clientes (backend 100%)
│   │   │   ├── compras/       # ⏳ Compras (estructura inicial)
│   │   │   ├── proveedores/   # ⏳ Proveedores (estructura inicial)
│   │   │   ├── email/         # 📧 Servicio de emails
│   │   │   └── reportes/      # ⏳ Reportes (planificado)
│   │   ├── core/              # Servicios centrales (PrismaService)
│   │   └── shared/            # Decorators y utilidades compartidas
│   └── prisma/                # Schema y migraciones
│
├── frontend/                  # Monorepo frontend único
│   ├── src/
│   │   ├── modules/          # Módulos de negocio
│   │   │   ├── auth/         # ✅ Autenticación completa
│   │   │   ├── ventas/       # ✅ Ventas completo
│   │   │   └── productos/    # 🔄 Gestión de precios
│   │   ├── core/             # API client (axios), stores (zustand)
│   │   └── shared/           # Componentes UI (shadcn/ui)
│
├── database/                 # Scripts SQL y documentación BD
└── docs/
    └── modulos/             # Documentación separada por módulo
        ├── 01-autenticacion/ # ✅ Docs módulo auth
        └── ...
```

## ⚙️ STACK TECNOLÓGICO UNIFICADO

### **Backend (NestJS)**
- **Framework:** NestJS + TypeScript
- **ORM:** Prisma + PostgreSQL (Supabase)
- **Auth:** express-session + cookies httpOnly + bcrypt
- **Email:** Nodemailer (usado en recuperación de contraseña)
- **Testing:** Jest (configurado, sin tests implementados)

### **Frontend (React)**
- **Framework:** React 18 + TypeScript
- **Build:** Vite + SWC
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand (estado global), React Query (cache y sincronización)
- **HTTP:** Axios (withCredentials: true para cookies)
- **Testing:** Jest + Testing Library (configurado, sin tests implementados)

### **Database (PostgreSQL)**
- **Provider:** Supabase
- **Schema:** 17 tablas normalizadas
- **ORM:** Prisma con migraciones
- **Backup:** Automático vía Supabase

## 🔄 FLUJO DE DATOS

```
[Frontend] ←→ [API REST] ←→ [NestJS Services] ←→ [Prisma ORM] ←→ [PostgreSQL]
```

**Patrón por módulo:**
1. **Controller** recibe requests HTTP
2. **Service** ejecuta lógica de negocio  
3. **Prisma** maneja acceso a datos
4. **Frontend** consume API via Axios
5. **React Query** maneja cache y estado

## 🧩 PATRÓN DE MÓDULOS

### **Backend Module Pattern:**
```typescript
modules/[modulo]/
├── [modulo].module.ts      # Módulo NestJS
├── [modulo].controller.ts  # Endpoints REST
├── [modulo].service.ts     # Lógica de negocio
├── dto/                    # Data Transfer Objects
│   ├── create-[modulo].dto.ts
│   └── update-[modulo].dto.ts
└── tests/                  # Tests específicos
```

### **Frontend Module Pattern:**
```typescript
modules/[modulo]/
├── pages/                  # Páginas principales
├── components/            # Componentes específicos
├── hooks/                 # Custom hooks
├── api/                   # Services y tipos
│   ├── [modulo]Service.ts
│   └── types.ts
└── tests/                 # Tests específicos
```

## 🔐 SEGURIDAD

- **Autenticación:** express-session con cookies httpOnly (expiración 24h)
- **Autorización:** Guards por endpoint (NestJS)
- **Validación:** DTOs con class-validator
- **Contraseñas:** Hasheadas con bcrypt (10 rondas)
- **CORS:** Configurado para frontend específico con credenciales
- **Environment:** Variables sensibles en .env
- **Cookies:** sameSite: lax, secure en producción

## 📈 ESCALABILIDAD

### **Agregar Nuevo Módulo:**
1. Crear estructura en `backend/src/modules/[nuevo]`
2. Crear estructura en `frontend/src/modules/[nuevo]`  
3. Registrar módulo en `app.module.ts`
4. Crear documentación en `docs/modulos/`
5. Seguir patrones establecidos