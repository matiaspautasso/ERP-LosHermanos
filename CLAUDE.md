# CLAUDE.md - Instrucciones para Claude Code

> **Propósito:** Contexto actualizado del proyecto ERP Los Hermanos para Claude Code

## Qué es este proyecto

ERP Los Hermanos - Sistema modular de gestión empresarial con NestJS + React + Prisma + PostgreSQL (Supabase).

## Rama actual

**Rama:** `ventas/cambios` (actualizada enero 2026)

**Foco actual:**
- Módulo Ventas ✅ 100% completado
- Gestión de Precios ✅ 100% completado
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

## Comandos esenciales

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

# Base de Datos (Windows - usa variable de entorno)
psql "$DATABASE_URL" -f database/scripts/script.sql
```

## Workflow Database-First

**IMPORTANTE:** Cambios en BD se hacen primero en PostgreSQL, luego sincronizas:

1. Modificar schema en PostgreSQL (Supabase dashboard)
2. `cd backend` → `npx prisma db pull`
3. `npx prisma generate`
4. Reiniciar servidor dev

## 🔀 Workflow de Ramas

**SIEMPRE antes de hacer cambios significativos:**

1. Verificar rama actual: `git branch`
2. Crear rama para nuevos cambios desde rama principal:
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```
3. Hacer cambios y commits frecuentes
4. Push a remoto después de cada grupo lógico de cambios
5. Solicitar revisión antes de mergear a rama principal

**Ejemplo completo:**
```bash
# Ver rama actual
git branch

# Crear rama nueva
git checkout -b feature/mejora-clientes

# Hacer cambios, luego:
git add .
git commit -m "feat: descripción del cambio"
git push -u origin feature/mejora-clientes

# Después de revisión: merge a rama principal
```

## Documentación completa

Para más detalles consulta:

- **[README.md](README.md)** - Instalación, comandos y guía de navegación de documentación
- **[ARQUITECTURA.md](ARQUITECTURA.md)** - Stack técnico, patrones, convenciones completas
- **[ROADMAP.md](ROADMAP.md)** - Fases, progreso y próximos pasos
- **[database/README.md](database/README.md)** - Índice de scripts de base de datos disponibles

## Credenciales de prueba

- Email: `vendedor@erp.com`
- Password: `vendedor123`
