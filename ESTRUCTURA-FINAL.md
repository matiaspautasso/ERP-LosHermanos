# 🏗️ ESTRUCTURA FINAL DEL PROYECTO

> **Vista previa de cómo quedará el proyecto después de la reorganización**
> **Opción:** Migración Completa (Opción A)

---

## 📂 ESTRUCTURA COMPLETA DEL PROYECTO

```
ERP-LosHermanos/
│
├── 📋 README.md                                    # ⭐ NUEVO - Descripción integral del ERP
├── 📋 ROADMAP.md                                   # ⭐ NUEVO - Progreso de todos los módulos
├── 📋 ARQUITECTURA.md                              # ⭐ NUEVO - Arquitectura general del sistema
├── 📋 PLAN-REORGANIZACION.md                       # Existente - Plan de migración
├── 📋 ESTRUCTURA-FINAL.md                          # Este archivo
├── 📋 .gitignore
│
├── 📂 .claude/                                     # Configuración de Claude
│   └── settings.local.json
│
├── 📂 backend/                                     # API NestJS
│   ├── 📋 package.json
│   ├── 📋 tsconfig.json
│   ├── 📋 nest-cli.json
│   ├── 📋 .env
│   ├── 📋 .env.example
│   │
│   ├── 📂 prisma/
│   │   └── schema.prisma
│   │
│   ├── 📂 dist/                                    # Build output
│   │
│   ├── 📂 node_modules/
│   │
│   └── 📂 src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── app.controller.ts
│       │
│       ├── 📂 config/                              # Configuración global
│       │   └── ... (existente)
│       │
│       ├── 📂 core/                                # ⚡ RENOMBRADO (era "common")
│       │   └── 📂 prisma/                          # Servicios fundamentales
│       │       ├── prisma.module.ts
│       │       └── prisma.service.ts
│       │
│       ├── 📂 shared/                              # ⭐ NUEVO - Código compartido entre módulos
│       │   ├── 📂 decorators/                      # ⚡ MOVIDO desde common/decorators
│       │   │   └── get-user.decorator.ts
│       │   ├── 📂 guards/                          # Guards reutilizables
│       │   ├── 📂 interceptors/                    # Interceptors
│       │   ├── 📂 filters/                         # Exception filters
│       │   └── 📂 utils/                           # Utilidades
│       │
│       ├── 📂 infraestructura/                     # Infraestructura existente
│       │   ├── bus-memoria/
│       │   ├── cache/
│       │   ├── prisma/
│       │   └── sesiones/
│       │
│       ├── 📂 modules/                             # Módulos de negocio
│       │   │
│       │   ├── 📂 auth/                            # ✅ Módulo de Autenticación
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── 📂 dto/
│       │   │   │   ├── login.dto.ts
│       │   │   │   ├── register.dto.ts
│       │   │   │   └── recover.dto.ts
│       │   │   ├── 📂 events/
│       │   │   │   ├── index.ts
│       │   │   │   ├── user-registered.event.ts
│       │   │   │   ├── user-logged-in.event.ts
│       │   │   │   └── password-recovery-requested.event.ts
│       │   │   └── 📂 listeners/
│       │   │       ├── index.ts
│       │   │       └── password-recovery.listener.ts
│       │   │
│       │   ├── 📂 email/                           # ✅ Servicio de Email
│       │   │   ├── email.module.ts
│       │   │   └── email.service.ts
│       │   │
│       │   ├── 📂 clientes/                        # ⏳ Futuro - Vacío por ahora
│       │   ├── 📂 productos/                       # ⏳ Futuro - Vacío por ahora
│       │   ├── 📂 ventas/                          # ⏳ Futuro - Vacío por ahora
│       │   ├── 📂 compras/                         # ⏳ Futuro - Vacío por ahora
│       │   ├── 📂 proveedores/                     # ⏳ Futuro - Vacío por ahora
│       │   ├── 📂 reportes/                        # ⏳ Futuro - Vacío por ahora
│       │   └── 📂 usuarios/                        # ⏳ Futuro - CRUD usuarios
│       │
│       └── 📂 tests/                               # Tests globales
│
│
├── 📂 frontend/                                    # Aplicación React
│   ├── 📋 package.json
│   ├── 📋 tsconfig.json
│   ├── 📋 vite.config.ts
│   ├── 📋 tailwind.config.js
│   ├── 📋 .env
│   ├── 📋 .env.example
│   ├── 📋 index.html
│   │
│   ├── 📂 public/
│   │
│   ├── 📂 node_modules/
│   │
│   └── 📂 src/
│       ├── main.tsx
│       ├── App.tsx                                 # ⚠️ ACTUALIZAR rutas
│       ├── index.css
│       │
│       ├── 📂 modules/                             # ⭐ NUEVO - Módulos de negocio
│       │   │
│       │   ├── 📂 auth/                            # ✅ Módulo de Autenticación
│       │   │   │
│       │   │   ├── 📂 pages/                       # ⚡ MOVIDO desde paginas/
│       │   │   │   ├── LoginPage.tsx              # ⚠️ Actualizar imports
│       │   │   │   ├── RegisterPage.tsx           # ⚠️ Actualizar imports
│       │   │   │   └── RecoverPage.tsx            # ⚠️ Actualizar imports
│       │   │   │
│       │   │   ├── 📂 hooks/                       # ⚡ MOVIDO desde hooks/
│       │   │   │   └── useAuth.ts                 # ⚠️ Actualizar imports
│       │   │   │
│       │   │   └── 📂 api/                         # ⚡ MOVIDO desde api/
│       │   │       └── authService.ts             # ⚠️ Actualizar imports
│       │   │
│       │   ├── 📂 clientes/                        # ⏳ Futuro - Vacío
│       │   │   ├── 📂 pages/
│       │   │   ├── 📂 hooks/
│       │   │   └── 📂 api/
│       │   │
│       │   ├── 📂 productos/                       # ⏳ Futuro - Vacío
│       │   ├── 📂 ventas/                          # ⏳ Futuro - Vacío
│       │   ├── 📂 compras/                         # ⏳ Futuro - Vacío
│       │   └── 📂 stock/                           # ⏳ Futuro - Vacío
│       │
│       ├── 📂 shared/                              # ⚡ RENOMBRADO (era "componentes")
│       │   │
│       │   ├── 📂 components/                      # Componentes UI reutilizables
│       │   │   └── 📂 ui/                          # shadcn/ui components
│       │   │       ├── button.tsx
│       │   │       ├── input.tsx
│       │   │       ├── label.tsx
│       │   │       ├── checkbox.tsx
│       │   │       ├── alert-dialog.tsx
│       │   │       └── sonner.tsx
│       │   │
│       │   ├── 📂 layouts/                         # Layouts existentes
│       │   │
│       │   └── 📂 utils/                           # Utilidades compartidas
│       │
│       ├── 📂 core/                                # ⭐ NUEVO - Servicios centrales
│       │   │
│       │   ├── 📂 store/                           # Estado global
│       │   │   └── authStore.ts                   # ⚡ MOVIDO desde estado/
│       │   │
│       │   ├── 📂 api/                             # Configuración API
│       │   │   ├── axios.ts                       # Cliente Axios
│       │   │   └── types.ts                       # Tipos globales
│       │   │
│       │   └── 📂 config/                          # Configuración global
│       │
│       ├── 📂 assets/                              # Assets estáticos
│       │   └── logo-los-hermanos.png
│       │
│       ├── 📂 lib/                                 # Librerías existentes
│       │   └── utils.ts
│       │
│       └── 📂 estilos/                             # Estilos globales (si existen)
│
│
├── 📂 database/                                    # ⭐ NUEVO - Base de datos centralizada
│   │
│   ├── DB-script-Loshermanos.sql                  # ⚡ MOVIDO desde raíz
│   │
│   ├── 📂 migrations/                              # Migraciones de Prisma
│   │   └── ... (auto-generadas)
│   │
│   └── 📂 docs/                                    # Documentación de BD
│       ├── modelo-entidad-relacion.md             # ⭐ NUEVO
│       └── tablas.md                              # ⭐ NUEVO
│
│
├── 📂 docs/                                        # ⭐ NUEVO - Documentación del proyecto
│   │
│   ├── 📂 modulos/                                 # Documentación por módulo
│   │   │
│   │   ├── 📂 01-autenticacion/                    # Módulo Auth
│   │   │   ├── README.md                          # ⚡ MOVIDO desde ESTADO-PROYECTO.md
│   │   │   ├── email-service.md                   # ⚡ MOVIDO desde DOCUMENTACION-EMAIL-SERVICE.md
│   │   │   ├── api-endpoints.md                   # ⭐ NUEVO
│   │   │   └── arquitectura.md                    # ⭐ NUEVO
│   │   │
│   │   ├── 📂 02-clientes/                         # ⏳ Futuro
│   │   ├── 📂 03-productos/                        # ⏳ Futuro
│   │   ├── 📂 04-ventas/                           # ⏳ Futuro
│   │   └── 📂 05-compras/                          # ⏳ Futuro
│   │
│   └── 📂 guias/                                   # Guías de desarrollo
│       ├── desarrollo.md                          # ⭐ NUEVO - Guía para desarrolladores
│       ├── deployment.md                          # ⭐ NUEVO - Cómo hacer deploy
│       ├── contributing.md                        # ⭐ NUEVO - Cómo contribuir
│       └── SugerenciasProyecto.md                 # ⚡ MOVIDO - Archivo original
│
│
└── 📂 infraestructura/                             # Configuración de infraestructura
    ├── 📂 docker/
    ├── 📂 despliegue/
    └── 📂 scripts/

```

---

## 📊 RESUMEN DE CAMBIOS

### **Archivos NUEVOS (15 archivos)**

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Descripción integral del ERP |
| `ROADMAP.md` | Progreso de todos los módulos |
| `ARQUITECTURA.md` | Arquitectura general del sistema |
| `ESTRUCTURA-FINAL.md` | Este archivo (vista previa) |
| `backend/src/shared/` | Carpeta para código compartido |
| `frontend/src/modules/` | Carpeta para módulos de negocio |
| `frontend/src/core/` | Carpeta para servicios centrales |
| `database/` | Carpeta para BD centralizada |
| `database/docs/modelo-entidad-relacion.md` | Diagrama ER |
| `database/docs/tablas.md` | Documentación de tablas |
| `docs/` | Carpeta de documentación |
| `docs/modulos/01-autenticacion/api-endpoints.md` | Endpoints del módulo |
| `docs/modulos/01-autenticacion/arquitectura.md` | Diseño del módulo |
| `docs/guias/desarrollo.md` | Guía para desarrolladores |
| `docs/guias/deployment.md` | Guía de deployment |

### **Archivos MOVIDOS (11 archivos)**

| Origen | Destino |
|--------|---------|
| `ESTADO-PROYECTO.md` | `docs/modulos/01-autenticacion/README.md` |
| `DOCUMENTACION-EMAIL-SERVICE.md` | `docs/modulos/01-autenticacion/email-service.md` |
| `SugerenciasProyecto.md` | `docs/guias/SugerenciasProyecto.md` |
| `DB-script-Loshermanos.sql` | `database/DB-script-Loshermanos.sql` |
| `backend/src/common/` | `backend/src/core/` |
| `backend/src/common/decorators/` | `backend/src/shared/decorators/` |
| `frontend/src/paginas/login/` | `frontend/src/modules/auth/pages/` |
| `frontend/src/paginas/registro/` | `frontend/src/modules/auth/pages/` |
| `frontend/src/hooks/useAuth.ts` | `frontend/src/modules/auth/hooks/useAuth.ts` |
| `frontend/src/api/authService.ts` | `frontend/src/modules/auth/api/authService.ts` |
| `frontend/src/componentes/` | `frontend/src/shared/components/` |
| `frontend/src/estado/authStore.ts` | `frontend/src/core/store/authStore.ts` |

### **Archivos a ACTUALIZAR (7 archivos)**

| Archivo | Razón | Cambios |
|---------|-------|---------|
| `backend/src/modules/auth/auth.controller.ts` | Import de decorator | `../../common/decorators` → `../../shared/decorators` |
| `backend/src/modules/auth/listeners/password-recovery.listener.ts` | Import de PrismaService | `../../../common/prisma` → `../../../core/prisma` |
| `frontend/src/App.tsx` | Rutas de React Router | `./paginas/login` → `./modules/auth/pages` |
| `frontend/src/modules/auth/pages/LoginPage.tsx` | Imports de componentes | `@/componentes/ui` → `@/shared/components/ui` |
| `frontend/src/modules/auth/pages/RegisterPage.tsx` | Imports de componentes | `@/componentes/ui` → `@/shared/components/ui` |
| `frontend/src/modules/auth/pages/RecoverPage.tsx` | Imports de componentes y hooks | `@/componentes` → `@/shared/components`, `@/hooks` → `../hooks` |
| `frontend/src/modules/auth/hooks/useAuth.ts` | Imports de authService y store | `@/api` → `../api`, `@/estado` → `@/core/store` |

### **Carpetas a ELIMINAR (después de mover)**

```
frontend/src/paginas/          (si queda vacía)
frontend/src/hooks/            (después de mover useAuth.ts)
frontend/src/api/              (si queda vacía)
frontend/src/estado/           (después de mover authStore.ts)
```

---

## 🎯 BENEFICIOS DE ESTA ESTRUCTURA

### **1. Organización Clara**
- ✅ Cada módulo en su carpeta (`modules/auth/`, `modules/clientes/`)
- ✅ Código compartido centralizado (`shared/`, `core/`)
- ✅ Documentación organizada por módulo (`docs/modulos/`)

### **2. Escalabilidad**
- ✅ Fácil agregar nuevos módulos (copiar estructura de `auth/`)
- ✅ Código reutilizable en `shared/`
- ✅ Documentación por módulo facilita entendimiento

### **3. Mantenibilidad**
- ✅ Archivos relacionados juntos
- ✅ Imports más claros con path aliases
- ✅ Testing enfocado por módulo

### **4. Colaboración**
- ✅ Desarrolladores pueden trabajar en módulos diferentes
- ✅ Menos conflictos de merge
- ✅ Estado claro por módulo en docs

---

## 📐 CONVENCIONES DE NOMENCLATURA

### **Carpetas:**
- `core/` - Servicios fundamentales del sistema
- `shared/` - Código compartido entre módulos
- `modules/` - Módulos de negocio independientes
- `docs/` - Documentación
- `database/` - Scripts y docs de BD

### **Archivos:**
- `README.md` - Raíz: Descripción general, Módulos: Estado del módulo
- `ROADMAP.md` - Progreso y planificación
- `ARQUITECTURA.md` - Diseño del sistema
- `*.md` en `docs/` - Documentación específica

---

## 🔄 PATH ALIASES ACTUALIZADOS

```json
// tsconfig.json y vite.config.ts
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"],
      "@assets/*": ["./src/assets/*"]
    }
  }
}
```

**Ejemplos de uso:**
```typescript
// Antes
import { Button } from '@/componentes/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Después
import { Button } from '@shared/components/ui/button';
import { useAuth } from '@modules/auth/hooks/useAuth';
```

---

## ✅ VALIDACIÓN FINAL

Después de la migración, el proyecto debe cumplir:

- [ ] Backend compila sin errores (`npm run build`)
- [ ] Frontend compila sin errores (`npm run build`)
- [ ] Backend se ejecuta (`npm run start:dev`)
- [ ] Frontend se ejecuta (`npm run dev`)
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Recuperación de contraseña funciona
- [ ] Emails se envían correctamente
- [ ] Todos los imports resuelven correctamente
- [ ] No hay errores en consola
- [ ] Tests pasan (si existen)

---

**Esta es la estructura final que tendrá el proyecto.**

**¿Aprobada para proceder con la migración?**
