# ERP Los Hermanos

> **Estado:** En Desarrollo | **Progreso:** 65% | **Última Actualización:** Enero 2026

## Qué es

Sistema ERP modular para gestión integral de empresas medianas con arquitectura escalable.

**Stack Principal:**
- **Backend:** NestJS + Prisma + PostgreSQL (Supabase)
- **Frontend:** React 18 + Vite + TailwindCSS + shadcn/ui
- **Autenticación:** express-session (sin JWT)

## Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- PostgreSQL (local o Supabase)

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/ERP-LosHermanos.git
cd ERP-LosHermanos

# 2. Instalar dependencias
npm run install:all

# 3. Configurar variables de entorno
# Crear backend/.env (ver sección Variables de Entorno)
# Crear frontend/.env (ver sección Variables de Entorno)

# 4. Sincronizar schema de base de datos
cd backend
npx prisma db pull
npx prisma generate
cd ..

# 5. Levantar proyecto completo
npm run dev
```

### URLs de desarrollo

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs
- **Prisma Studio:** http://localhost:5555 (ejecutar `npm run prisma:studio` desde `backend/`)

### Credenciales de prueba

- **Email:** `vendedor@erp.com`
- **Password:** `vendedor123`

---

## 📚 Guía de Documentación

Este proyecto cuenta con documentación completa organizada por propósito:

### Para empezar

| Documento | Cuándo consultarlo |
|-----------|-------------------|
| **[README.md](README.md)** (este archivo) | Instalación inicial, comandos básicos, overview del proyecto |
| **[CLAUDE.md](CLAUDE.md)** | Contexto rápido para Claude Code: rama actual, módulos activos, comandos esenciales |
| **[FLUJO-AGENTES.md](FLUJO-AGENTES.md)** | Flujo de trabajo con agentes Claude Code: roles, secuencia obligatoria, restricciones |

### Para desarrollar

| Documento | Cuándo consultarlo |
|-----------|-------------------|
| **[ARQUITECTURA.md](ARQUITECTURA.md)** | Stack técnico, patrones de código, convenciones, troubleshooting |
| **[ROADMAP.md](ROADMAP.md)** | Estado de módulos, próximos pasos, progreso del proyecto |

### Para base de datos

| Documento | Cuándo consultarlo |
|-----------|-------------------|
| **[database/README.md](database/README.md)** | Índice de scripts SQL disponibles y cuándo usarlos |
| **[database/scripts/00-LEEME-estructura-y-reglas.md](database/scripts/00-LEEME-estructura-y-reglas.md)** | Reglas de negocio, constraints, funciones y vistas |
| **[database/scripts/GUIA-SISTEMA-PRECIOS.md](database/scripts/GUIA-SISTEMA-PRECIOS.md)** | Sistema completo de gestión automática de precios |
| **[backend/docs/PRISMA-CONNECTION-GUIDE.md](backend/docs/PRISMA-CONNECTION-GUIDE.md)** | Gestión de conexiones Prisma + Supabase |

### Para Supabase

| Documento | Cuándo consultarlo |
|-----------|-------------------|
| **[supabase/README.md](supabase/README.md)** | Configuración de Supabase en VS Code, enlaces al dashboard |

---

## Ejecución del proyecto

### Caso 1: Desarrollo normal (sin actualizar dependencias)

**Cuándo usar:** Desarrollo diario, cuando ya tienes las dependencias instaladas.

```bash
npm run dev
```

**¿Qué hace?**
- ✅ Levanta backend en modo desarrollo (NestJS - puerto 3000)
- ✅ Levanta frontend en modo desarrollo (React - puerto 5173)
- ⚡ **Tiempo:** 2-5 segundos

**Casos de uso:**
- Inicio de día de trabajo
- Después de hacer cambios en el código
- Cuando reinicies los servidores
- El 95% del tiempo usarás este comando

---

### Caso 2: Con actualización de dependencias

**Cuándo usar:** Cuando agregaste/actualizaste paquetes o hiciste `git pull` con cambios en `package.json`.

#### Opción A: Instalar + Levantar
```bash
npm run dev:fresh
```

**¿Qué hace?**
1. 📦 Instala dependencias en backend y frontend
2. ✅ Levanta ambos servidores
- ⏱️ **Tiempo:** 30-90 segundos

#### Opción B: Instalar por separado
```bash
npm run install:all    # Solo instalar dependencias
npm run dev            # Luego levantar servidores
```

**Ejemplos prácticos:**
```bash
# Agregaste un nuevo paquete
cd frontend
npm install axios
cd ..
npm run dev  # Ya está instalado, solo levanta

# Hiciste git pull con cambios en package.json
git pull
npm run dev:fresh  # Instala nuevas dependencias + levanta

# Primera vez que clonas el proyecto
git clone <repo>
cd ERP-LosHermanos
npm run dev:fresh  # Instala todo + levanta
```

---

## Scripts principales

### Desde la raíz del proyecto

```bash
npm run dev              # Levantar backend + frontend (rápido)
npm run dev:fresh        # Instalar dependencias + levantar servidores
npm run install:all      # Solo instalar dependencias de backend y frontend
```

### Backend (desde `backend/`)

```bash
npm install              # Instalar dependencias
npm run start:dev        # Servidor desarrollo (puerto 3000)
npm run build            # Compilar para producción
npm run start:prod       # Ejecutar build de producción

# Prisma
npm run prisma:generate  # Regenerar Prisma Client
npm run prisma:studio    # GUI base de datos (puerto 5555)
npm run prisma:seed      # Poblar base de datos con datos iniciales
npx prisma db pull       # Sincronizar schema desde PostgreSQL
```

### Frontend (desde `frontend/`)

```bash
npm install              # Instalar dependencias
npm run dev              # Servidor desarrollo (puerto 5173)
npm run build            # Compilar para producción
npm run preview          # Previsualizar build de producción
```

---

## 🔀 Workflow de Ramas

**IMPORTANTE:** Siempre trabajar en ramas separadas para cambios significativos.

### Antes de hacer cambios

1. **Verificar rama actual**
   ```bash
   git branch
   ```

2. **Crear rama para nuevos cambios**
   ```bash
   git checkout -b feature/nombre-descriptivo
   # o para fixes:
   git checkout -b fix/nombre-descriptivo
   ```

### Durante el desarrollo

3. **Commits frecuentes con mensajes descriptivos**
   ```bash
   git add .
   git commit -m "feat: descripción clara del cambio"
   ```

4. **Push a remoto después de cada grupo lógico de cambios**
   ```bash
   git push -u origin feature/nombre-descriptivo
   ```

### Integración

5. **Solicitar revisión antes de mergear**
   - Crear Pull Request en GitHub
   - Esperar aprobación
   - Mergear a rama principal (desarrollo o main)

### Ejemplo completo

```bash
# 1. Verificar rama actual
git branch

# 2. Crear rama nueva
git checkout -b feature/mejora-clientes

# 3. Hacer cambios, luego commits
git add .
git commit -m "feat: agregar validación de email en clientes"

# 4. Push a remoto
git push -u origin feature/mejora-clientes

# 5. Crear PR en GitHub y esperar revisión
# 6. Después de aprobación: merge a rama principal
```

**Ramas principales:**
- `main` - Código en producción (estable)
- `desarrollo` - Rama de integración principal (usar para desarrollo)
- `feature/*` - Ramas de características nuevas
- `fix/*` - Ramas de corrección de bugs

---

## Variables de entorno

### Backend `.env`

Crear archivo `backend/.env` con las siguientes variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=tu-clave-secreta-aleatoria
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
```

### Frontend `.env`

Crear archivo `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

## Estado de módulos

| Módulo | Estado | Backend | Frontend |
|--------|--------|---------|----------|
| Autenticación | ✅ 100% | Completo | Completo |
| Ventas | ✅ 100% | Completo | Completo |
| Productos | 🔄 70% | Completo | Funcional |
| Clientes | 🔄 50% | Completo | Pendiente |
| Compras | 🔄 10% | Inicial | Pendiente |
| Proveedores | 🔄 10% | Inicial | Pendiente |
| Reportes | ⏳ 0% | Planificado | Planificado |

## 📖 Documentación Completa

Ver la sección **[📚 Guía de Documentación](#-guía-de-documentación)** más arriba para un índice completo de toda la documentación disponible organizada por propósito.

**Enlaces rápidos:**
- **[CLAUDE.md](CLAUDE.md)** - Contexto para Claude Code (rama actual, comandos, workflow)
- **[FLUJO-AGENTES.md](FLUJO-AGENTES.md)** - Flujo de trabajo con agentes Claude Code
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Stack técnico completo, patrones y convenciones
- **[ROADMAP.md](ROADMAP.md)** - Estado del proyecto y próximos pasos
- **[database/README.md](database/README.md)** - Índice de scripts SQL
- **[supabase/README.md](supabase/README.md)** - Configuración de Supabase

## Licencia

Proyecto privado - Todos los derechos reservados
