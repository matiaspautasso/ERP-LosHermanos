# 📋 PLAN DE REORGANIZACIÓN DEL PROYECTO

> **Fecha:** 2025-12-03
> **Estado Actual:** Monorepo con Backend + Frontend
> **Objetivo:** Estructura modular escalable manteniendo funcionalidad

---

## 🎯 ENFOQUE PROPUESTO

**IMPORTANTE:** La estructura original de `SugerenciasProyecto.md` propone separar backend/frontend por módulo. Sin embargo, esto es **muy complejo** para un monorepo y puede romper el sistema.

**Propongo una estructura HÍBRIDA más práctica:**
- ✅ Mantener backend y frontend como monorepos separados
- ✅ Organizar documentación por módulos
- ✅ Centralizar código compartido
- ✅ Facilitar desarrollo de nuevos módulos

---

## 📊 ESTRUCTURA ACTUAL vs PROPUESTA

### **ESTRUCTURA ACTUAL**

```
ERP-LosHermanos/
├── README.md                          # Básico
├── ESTADO-PROYECTO.md                 # Completo del proyecto
├── SugerenciasProyecto.md
├── DOCUMENTACION-EMAIL-SERVICE.md
├── DB-script-Loshermanos.sql
│
├── backend/                           # Backend monolítico
│   ├── src/
│   │   ├── modules/                   # Todos los módulos aquí
│   │   │   ├── auth/                  # ✅ Completo
│   │   │   ├── email/                 # ✅ Completo
│   │   │   ├── clientes/              # ❌ Vacío
│   │   │   ├── productos/             # ❌ Vacío
│   │   │   └── ...
│   │   ├── common/                    # Código compartido
│   │   └── infraestructura/
│   └── prisma/
│
└── frontend/                          # Frontend monolítico
    ├── src/
    │   ├── paginas/
    │   │   ├── login/                 # ✅ Completo
    │   │   ├── registro/              # ✅ Completo
    │   │   ├── clientes/              # ❌ Vacío
    │   │   ├── stock/                 # ❌ Vacío
    │   │   └── ...
    │   ├── componentes/
    │   ├── api/
    │   └── hooks/
```

### **ESTRUCTURA PROPUESTA (HÍBRIDA)**

```
ERP-LosHermanos/
├── 📋 README.md                       # ⭐ NUEVO: Descripción integral
├── 📋 ROADMAP.md                      # ⭐ NUEVO: Progreso de módulos
├── 📋 ARQUITECTURA.md                 # ⭐ NUEVO: Arquitectura general
│
├── 📂 backend/                        # Backend (sin cambios estructurales)
│   ├── src/
│   │   ├── modules/                   # Módulos organizados
│   │   │   ├── auth/                  # Módulo auth
│   │   │   ├── email/                 # Servicio de email
│   │   │   └── ...                    # Otros módulos
│   │   ├── shared/                    # ⭐ NUEVO: Código compartido
│   │   │   ├── decorators/            # Movido desde common/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── utils/
│   │   ├── core/                      # ⭐ RENOMBRADO: Era "common"
│   │   │   └── prisma/
│   │   └── config/
│   └── prisma/
│
├── 📂 frontend/                       # Frontend (sin cambios estructurales)
│   ├── src/
│   │   ├── modules/                   # ⭐ NUEVO: Organización modular
│   │   │   ├── auth/                  # Páginas de autenticación
│   │   │   │   ├── pages/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── RegisterPage.tsx
│   │   │   │   │   └── RecoverPage.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   └── api/
│   │   │   │       └── authService.ts
│   │   │   │
│   │   │   ├── clientes/              # Futuro módulo
│   │   │   ├── productos/             # Futuro módulo
│   │   │   └── ...
│   │   │
│   │   ├── shared/                    # ⭐ RENOMBRADO: Era "componentes"
│   │   │   ├── components/            # Componentes UI reutilizables
│   │   │   │   └── ui/                # shadcn/ui
│   │   │   ├── layouts/
│   │   │   └── utils/
│   │   │
│   │   ├── core/                      # ⭐ NUEVO: Servicios globales
│   │   │   ├── store/                 # Zustand stores
│   │   │   └── api/                   # Axios config
│   │   │
│   │   └── assets/
│
├── 📂 database/                       # ⭐ NUEVO: BD centralizada
│   ├── DB-script-Loshermanos.sql      # Script movido aquí
│   ├── migrations/                    # Migraciones de Prisma
│   └── docs/
│       └── modelo-entidad-relacion.md
│
└── 📂 docs/                           # ⭐ NUEVO: Documentación modular
    ├── modulos/
    │   ├── 01-autenticacion/
    │   │   ├── README.md              # Estado del módulo
    │   │   ├── api.md                 # Endpoints
    │   │   ├── arquitectura.md        # Diseño
    │   │   └── email-service.md       # Servicio de email
    │   │
    │   ├── 02-clientes/               # Futuro
    │   ├── 03-productos/              # Futuro
    │   └── ...
    │
    └── guias/
        ├── desarrollo.md
        ├── deployment.md
        └── contributing.md
```

---

## 🔄 CAMBIOS DETALLADOS

### **1. Documentación (NUEVO)**

| Acción | Archivo Origen | Destino | Descripción |
|--------|---------------|---------|-------------|
| CREAR | - | `README.md` | Descripción integral del ERP |
| CREAR | - | `ROADMAP.md` | Progreso de todos los módulos |
| CREAR | - | `ARQUITECTURA.md` | Arquitectura general |
| MOVER | `ESTADO-PROYECTO.md` | `docs/modulos/01-autenticacion/README.md` | Estado del módulo auth |
| MOVER | `DOCUMENTACION-EMAIL-SERVICE.md` | `docs/modulos/01-autenticacion/email-service.md` | Docs de email |
| MOVER | `SugerenciasProyecto.md` | `docs/guias/` | Archivar sugerencias |

### **2. Base de Datos (NUEVO)**

| Acción | Archivo Origen | Destino |
|--------|---------------|---------|
| MOVER | `DB-script-Loshermanos.sql` | `database/DB-script-Loshermanos.sql` |
| CREAR | - | `database/docs/modelo-entidad-relacion.md` |

### **3. Backend - Reorganización**

| Acción | Origen | Destino | Impacto |
|--------|--------|---------|---------|
| RENOMBRAR | `src/common/` | `src/core/` | ⚠️ Actualizar imports |
| CREAR | - | `src/shared/` | Código compartido entre módulos |
| MOVER | `src/common/decorators/` | `src/shared/decorators/` | ⚠️ Actualizar imports |

**Archivos afectados:**
- `src/modules/auth/auth.controller.ts` - Importa `GetUser` decorator
- `src/modules/auth/listeners/password-recovery.listener.ts` - Importa `PrismaService`

### **4. Frontend - Reorganización Modular**

| Acción | Origen | Destino | Impacto |
|--------|--------|---------|---------|
| CREAR | - | `src/modules/` | Nueva estructura modular |
| MOVER | `src/paginas/login/` | `src/modules/auth/pages/` | ⚠️ Actualizar rutas |
| MOVER | `src/paginas/registro/` | `src/modules/auth/pages/` | ⚠️ Actualizar rutas |
| MOVER | `src/hooks/useAuth.ts` | `src/modules/auth/hooks/` | ⚠️ Actualizar imports |
| MOVER | `src/api/authService.ts` | `src/modules/auth/api/` | ⚠️ Actualizar imports |
| RENOMBRAR | `src/componentes/` | `src/shared/components/` | ⚠️ Actualizar imports |
| MOVER | `src/estado/authStore.ts` | `src/core/store/` | ⚠️ Actualizar imports |

**Archivos que necesitan actualización de rutas:**
- `src/App.tsx` - Rutas de React Router
- `src/modules/auth/pages/LoginPage.tsx` - Imports de componentes
- `src/modules/auth/pages/RegisterPage.tsx` - Imports de componentes
- `src/modules/auth/pages/RecoverPage.tsx` - Imports de componentes y hooks
- `src/modules/auth/hooks/useAuth.ts` - Imports de authService y store

---

## ⚠️ IMPACTOS Y PRECAUCIONES

### **Imports del Backend**

**ANTES:**
```typescript
// src/modules/auth/auth.controller.ts
import { GetUser } from '../../common/decorators/get-user.decorator';
```

**DESPUÉS:**
```typescript
// src/modules/auth/auth.controller.ts
import { GetUser } from '../../shared/decorators/get-user.decorator';
```

**ANTES:**
```typescript
// src/modules/auth/listeners/password-recovery.listener.ts
import { PrismaService } from '../../../common/prisma/prisma.service';
```

**DESPUÉS:**
```typescript
// src/modules/auth/listeners/password-recovery.listener.ts
import { PrismaService } from '../../../core/prisma/prisma.service';
```

### **Rutas del Frontend (React Router)**

**ANTES:**
```typescript
// src/App.tsx
import LoginPage from './paginas/login/LoginPage';
import RegisterPage from './paginas/registro/RegisterPage';
import RecoverPage from './paginas/registro/RecoverPage';
```

**DESPUÉS:**
```typescript
// src/App.tsx
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import RecoverPage from './modules/auth/pages/RecoverPage';
```

### **Imports del Frontend**

**ANTES:**
```typescript
// src/paginas/registro/RecoverPage.tsx
import { Button } from '@/componentes/ui/button';
import { useAuth } from '@/hooks/useAuth';
```

**DESPUÉS:**
```typescript
// src/modules/auth/pages/RecoverPage.tsx
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '../hooks/useAuth';
```

### **Path Aliases (tsconfig.json)**

Necesitaremos actualizar:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"]
    }
  }
}
```

---

## 📝 PLAN DE MIGRACIÓN PASO A PASO

### **FASE 1: Preparación (Sin tocar código)**

1. ✅ **Crear carpetas nuevas:**
   ```bash
   mkdir -p docs/modulos/01-autenticacion
   mkdir -p docs/guias
   mkdir -p database/docs
   mkdir -p backend/src/shared
   mkdir -p frontend/src/modules/auth/{pages,hooks,api}
   mkdir -p frontend/src/core/store
   ```

2. ✅ **Crear documentación nueva:**
   - `README.md` principal
   - `ROADMAP.md`
   - `ARQUITECTURA.md`

### **FASE 2: Mover Documentación**

3. ✅ **Mover archivos de docs:**
   ```bash
   mv ESTADO-PROYECTO.md docs/modulos/01-autenticacion/README.md
   mv DOCUMENTACION-EMAIL-SERVICE.md docs/modulos/01-autenticacion/email-service.md
   mv SugerenciasProyecto.md docs/guias/
   mv DB-script-Loshermanos.sql database/
   ```

### **FASE 3: Backend - Actualizar Estructura**

4. ✅ **Renombrar carpetas backend:**
   ```bash
   cd backend/src
   mv common core
   mkdir shared
   mv core/decorators shared/
   ```

5. ⚠️ **Actualizar imports del backend:**
   - `auth.controller.ts`
   - `password-recovery.listener.ts`
   - Cualquier otro archivo que importe de `common/`

6. ✅ **Verificar que backend compile:**
   ```bash
   cd backend
   npm run build
   ```

### **FASE 4: Frontend - Reestructuración Modular**

7. ✅ **Crear estructura modular:**
   ```bash
   cd frontend/src
   mkdir -p modules/auth/{pages,hooks,api}
   ```

8. ✅ **Mover archivos del módulo auth:**
   ```bash
   mv paginas/login/* modules/auth/pages/
   mv paginas/registro/* modules/auth/pages/
   mv hooks/useAuth.ts modules/auth/hooks/
   mv api/authService.ts modules/auth/api/
   ```

9. ✅ **Reorganizar carpetas shared y core:**
   ```bash
   mv componentes shared/components
   mv estado/authStore.ts core/store/
   ```

10. ⚠️ **Actualizar imports del frontend:**
    - `App.tsx` (rutas)
    - `LoginPage.tsx`
    - `RegisterPage.tsx`
    - `RecoverPage.tsx`
    - `useAuth.ts`

11. ✅ **Actualizar path aliases:**
    - `tsconfig.json`
    - `vite.config.ts`

12. ✅ **Verificar que frontend compile:**
    ```bash
    cd frontend
    npm run build
    ```

### **FASE 5: Validación**

13. ✅ **Iniciar servers y probar:**
    ```bash
    # Terminal 1
    cd backend && npm run start:dev

    # Terminal 2
    cd frontend && npm run dev
    ```

14. ✅ **Probar funcionalidades:**
    - Login
    - Registro
    - Recuperación de contraseña
    - Verificar que emails se envíen

### **FASE 6: Limpieza**

15. ✅ **Eliminar carpetas vacías:**
    ```bash
    # Frontend
    rm -rf frontend/src/paginas/login
    rm -rf frontend/src/paginas/registro
    rm -rf frontend/src/hooks
    rm -rf frontend/src/api
    rm -rf frontend/src/estado

    # Si quedan vacías
    rmdir frontend/src/paginas
    ```

16. ✅ **Commit de cambios:**
    ```bash
    git add .
    git commit -m "refactor: Reorganizar proyecto en estructura modular"
    ```

---

## 🎯 RESULTADO ESPERADO

### **Beneficios Inmediatos:**

1. ✅ **Documentación Clara:**
   - Cada módulo tiene su propia documentación
   - README principal muestra estado general
   - ROADMAP muestra progreso

2. ✅ **Código Organizado:**
   - Frontend modular por funcionalidad
   - Backend con código compartido centralizado
   - Fácil encontrar archivos relacionados

3. ✅ **Escalabilidad:**
   - Plantilla clara para nuevos módulos
   - Código compartido reutilizable
   - Menos conflictos entre desarrolladores

4. ✅ **Mantenibilidad:**
   - Cada módulo independiente
   - Testing más enfocado
   - Deploy incremental posible

### **Lo que NO cambia:**

- ❌ Configuración de build (package.json)
- ❌ Configuración de BD (prisma)
- ❌ Variables de entorno
- ❌ Lógica de negocio
- ❌ Funcionalidad del usuario

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Imports rotos | Alta | Alto | Verificar con TypeScript antes de commit |
| Rutas incorrectas | Media | Alto | Probar todas las páginas manualmente |
| Path aliases no funcionan | Media | Medio | Revisar tsconfig.json y vite.config.ts |
| Pérdida de funcionalidad | Baja | Alto | Hacer commit antes de empezar |

---

## ✅ CHECKLIST PRE-MIGRACIÓN

Antes de empezar, asegúrate de:

- [x] Backend funcionando correctamente
- [x] Frontend funcionando correctamente
- [x] Base de datos conectada
- [x] Emails enviándose correctamente
- [ ] **Git commit de estado actual** ⚠️ **HACER ANTES DE MIGRAR**
- [ ] Backup de archivos importantes
- [ ] Tiempo suficiente para completar (2-3 horas)

---

## 🎯 ENFOQUE ELEGIDO: MIGRACIÓN COMPLETA (OPCIÓN A)

**Reorganización completa del proyecto en rama separada**

### Pre-requisitos:
1. ✅ Hacer commit del estado actual en rama `desarrollo`
2. ✅ Crear rama `reorganizacion-modular`
3. ✅ Hacer toda la migración en la nueva rama
4. ✅ Probar que todo funcione
5. ✅ Merge a `desarrollo` solo cuando esté validado

### Características:
- ✅ Reorganizar todo ahora
- ✅ Frontend y backend modular
- ✅ Documentación organizada por módulos
- ✅ Estructura escalable para futuros módulos
- ⏱️ Tiempo estimado: 2-3 horas
- ⚠️ Riesgo: Medio (mitigado por usar rama separada)

