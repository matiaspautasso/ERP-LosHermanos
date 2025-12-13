# CLAUDE.md - Instrucciones para Asistente IA

> **Propósito:** Contexto actualizado del proyecto ERP Los Hermanos para Claude Code

## Qué es este proyecto

ERP Los Hermanos - Sistema modular de gestión empresarial con NestJS + React + Prisma + PostgreSQL (Supabase).

## Módulo activo (hoy)

**Rama actual:** `desarrollo-ventas-precios`

**Foco:**
- Módulo Ventas (100% completado)
- Gestión de Precios (100% completado)
- Optimización de Base de Datos (scripts en `database/scripts/`)

**Módulos en desarrollo:**
- Productos (70% - backend completo, frontend funcional)
- Clientes (50% - backend completo, frontend pendiente)

## Qué tocar / Qué NO tocar

### ✅ Puedes modificar

- `backend/src/modules/productos/` - Mejoras en gestión de productos
- `backend/src/modules/clientes/` - Backend de clientes
- `frontend/src/modules/productos/` - UI de gestión de precios
- `frontend/src/modules/clientes/` - UI de clientes (crear desde cero)
- `database/scripts/` - Scripts de mantenimiento/validación

### ⚠️ NO modificar sin consultar

- `backend/src/modules/auth/` - Autenticación estable
- `backend/src/modules/ventas/` - Ventas estables
- `frontend/src/modules/auth/` - Auth UI estable
- `frontend/src/modules/ventas/` - Ventas UI estable
- `backend/prisma/schema.prisma` - Database-first (cambios en PostgreSQL primero)

## Comandos mínimos

```bash
# Desarrollo completo
npm run dev              # Backend (3000) + Frontend (5173)

# Backend (desde backend/)
npm run start:dev        # Solo backend
npx prisma db pull       # Sincronizar schema desde BD
npx prisma generate      # Regenerar Prisma Client
npx prisma studio        # GUI BD (puerto 5555)

# Frontend (desde frontend/)
npm run dev              # Solo frontend

# Base de Datos (Windows)
"/c/Program Files/PostgreSQL/18/bin/psql.exe" "postgresql://USER:PASS@HOST:PORT/DB" -f database/scripts/script.sql
```

## Workflow Database-First

**IMPORTANTE:** Cambios en BD se hacen primero en PostgreSQL, luego sincronizas:

1. Modificar schema en PostgreSQL (Supabase)
2. `cd backend` → `npx prisma db pull`
3. `npx prisma generate`
4. Reiniciar servidor dev

## Documentación completa

- **[README.md](README.md)** - Instalación y uso básico
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Stack técnico, patrones, convenciones, troubleshooting
- **[ROADMAP.md](ROADMAP.md)** - Fases, progreso y pendientes

## Credenciales de prueba

- Email: `vendedor@erp.com`
- Password: `vendedor123`
