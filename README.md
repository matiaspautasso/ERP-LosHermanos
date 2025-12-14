# ERP Los Hermanos

> **Estado:** En Desarrollo | **Progreso:** 65% | **Última Actualización:** Dic 2025

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

## Documentación

- **[CLAUDE.md](CLAUDE.md)** - Guía para desarrollo con Claude Code
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Detalles técnicos, patrones, convenciones
- **[ROADMAP.md](ROADMAP.md)** - Cronograma y planificación
- **[docs/modulos/](docs/modulos/)** - Documentación específica por módulo

## Licencia

Proyecto privado - Todos los derechos reservados
