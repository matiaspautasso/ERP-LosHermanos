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
│   │   │   ├── auth/          # ✅ Módulo autenticación
│   │   │   ├── clientes/      # 🔄 Próximo módulo  
│   │   │   └── gestion-stock/ # ⏳ Módulo futuro
│   │   ├── core/              # Servicios centrales (Prisma, etc)
│   │   └── shared/            # Decorators y utilidades compartidas
│   └── prisma/                # Schema y migraciones
│
├── frontend/                  # Monorepo frontend único
│   ├── src/
│   │   ├── modules/          # Módulos de negocio
│   │   │   ├── auth/         # ✅ Módulo autenticación
│   │   │   ├── clientes/     # 🔄 Próximo módulo
│   │   │   └── gestion-stock/# ⏳ Módulo futuro
│   │   ├── core/             # API client, store global
│   │   └── shared/           # Componentes UI compartidos
│
├── database/                 # Scripts SQL y documentación BD
└── docs/
    └── modulos/             # Documentación separada por módulo
        ├── 01-autenticacion/ # ✅ Docs módulo auth
        ├── 02-clientes/      # 🔄 Docs próximo módulo
        └── 03-gestion-stock/ # ⏳ Docs módulo futuro
```

## ⚙️ STACK TECNOLÓGICO UNIFICADO

### **Backend (NestJS)**
- **Framework:** NestJS + TypeScript
- **ORM:** Prisma + PostgreSQL (Supabase)
- **Auth:** JWT + Guards + bcrypt
- **Email:** Nodemailer
- **Testing:** Jest + Supertest

### **Frontend (React)**
- **Framework:** React 18 + TypeScript
- **Build:** Vite + SWC
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand
- **HTTP:** Axios + React Query
- **Testing:** Jest + Testing Library

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

- **Autenticación:** JWT tokens con refresh
- **Autorización:** Guards por endpoint
- **Validación:** DTOs con class-validator
- **CORS:** Configurado para frontend específico
- **Environment:** Variables sensibles en .env

## 📈 ESCALABILIDAD

### **Agregar Nuevo Módulo:**
1. Crear estructura en `backend/src/modules/[nuevo]`
2. Crear estructura en `frontend/src/modules/[nuevo]`  
3. Registrar módulo en `app.module.ts`
4. Crear documentación en `docs/modulos/`
5. Seguir patrones establecidos