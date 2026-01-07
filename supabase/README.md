# Configuración de Supabase - ERP Los Hermanos

> **Estado:** ✅ Configurado y funcional | **Última actualización:** Enero 2026

## 🎯 Información del Proyecto

```
Project ID:   rfhizunlwvoemvlscbqg
Project URL:  https://rfhizunlwvoemvlscbqg.supabase.co
Database:     aws-1-sa-east-1.pooler.supabase.com:5432
User:         postgres.rfhizunlwvoemvlscbqg
Status:       ✅ Operativo
```

---

## 🚀 Inicio Rápido

### Opción 1: Paleta de Comandos VS Code
1. Presiona `Ctrl+Shift+P`
2. Escribe "Supabase"
3. Selecciona el comando que necesites

### Opción 2: SQLTools (Recomendado para queries)
1. Click en ícono de base de datos en barra lateral
2. Conecta a "ERP Los Hermanos"
3. Explora tablas y ejecuta queries

### Opción 3: Dashboard Web
Abre: https://app.supabase.com/project/rfhizunlwvoemvlscbqg

---

## 📁 Archivos de Configuración

### Principales
- ✅ `supabase/.env` - API keys y credenciales (configurado)
- ✅ `supabase/config.toml` - Configuración del proyecto
- ✅ `.vscode/settings.json` - Integración VS Code
- ✅ `.gitignore` - Protección de credenciales

### Credenciales Configuradas
- ✅ Anon Key (public)
- ✅ Service Role Key (secret) - ⚠️ Mantener privada
- ✅ Database URL completa
- ✅ Conexión pooler configurada

---

## 🔗 Enlaces Directos al Dashboard

| Sección | URL |
|---------|-----|
| Dashboard Principal | https://app.supabase.com/project/rfhizunlwvoemvlscbqg |
| Editor de Base de Datos | https://app.supabase.com/project/rfhizunlwvoemvlscbqg/editor |
| SQL Editor | https://app.supabase.com/project/rfhizunlwvoemvlscbqg/sql |
| API Settings | https://app.supabase.com/project/rfhizunlwvoemvlscbqg/settings/api |
| Usuarios (Auth) | https://app.supabase.com/project/rfhizunlwvoemvlscbqg/auth/users |

---

## 🛠️ Comandos Útiles

### Verificar conexión
```bash
# Ver info del proyecto
.\supabase\setup.ps1
```

### Ejecutar scripts SQL
```bash
# Windows (Git Bash)
"/c/Program Files/PostgreSQL/18/bin/psql.exe" \
  "$DATABASE_URL" \
  -f database/scripts/script.sql

# O usar SQLTools en VS Code (más rápido)
```

---

## 🛡️ Seguridad

### ⚠️ IMPORTANTE
- ❌ **NUNCA** subas `supabase/.env` a Git
- ❌ **NUNCA** compartas tu Service Role Key
- ✅ `.gitignore` ya protege archivos `.env`
- ✅ Service Role Key tiene privilegios totales - solo uso local

### Rotación de credenciales
Si necesitas regenerar keys:
1. Ve a Settings → API en el dashboard
2. Click en "Reset" junto a la key que quieras regenerar
3. Actualiza `supabase/.env` con la nueva key

---

## 💡 Funcionalidades Disponibles

Con la extensión de Supabase configurada puedes:

- 🗄️ **Explorar base de datos** - Barra lateral con estructura completa
- 📝 **Ejecutar queries SQL** - Editor integrado con autocomplete
- 🔐 **Gestionar autenticación** - Ver y administrar usuarios
- 👥 **Administración de datos** - CRUD visual de tablas
- 📊 **Ver logs** - Monitoreo de actividad en tiempo real
- 🔍 **Consultas en tiempo real** - Resultados instantáneos

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
**Solución:**
1. Verifica que `supabase/.env` tenga las credenciales correctas
2. Verifica conexión a internet
3. Verifica que el proyecto no esté pausado en Supabase dashboard

### Error: "Prepared statement already exists"
**Causa:** Usar conexión directa en lugar de pooler
**Solución:** Usa la conexión con `pgbouncer=true` (ya configurada)

### Extensión no aparece en VS Code
**Solución:**
1. Verifica que Supabase extension esté instalada
2. Recarga VS Code: `Ctrl+Shift+P` → "Reload Window"
3. Verifica `.vscode/settings.json` tenga configuración de Supabase

---

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [CLI de Supabase](https://supabase.com/docs/guides/cli)
- [Guía de conexión Prisma](../backend/docs/PRISMA-CONNECTION-GUIDE.md)

---

**Configurado por:** ERP Los Hermanos Team
**Última verificación:** Enero 2026
