# Configuración de Supabase en VS Code

## ✅ Configuración Completada

La configuración de Supabase está **100% lista**. Archivos configurados:

- `supabase/config.toml` - Configuración del proyecto Supabase
- `supabase/.env` - Variables de entorno con API keys ✅
- `supabase/setup.ps1` - Script de ayuda
- `.vscode/settings.json` - Configuración completa de Supabase ✅
- `.vscode/extensions.json` - Extensiones recomendadas
- `ERP-LosHermanos.code-workspace` - Workspace configurado

## 🎯 Cómo Usar la Extensión

### Opción 1: Usando la Extensión de VS Code

1. **Abre la Paleta de Comandos**: `Ctrl+Shift+P`

2. **Comandos disponibles**:
   - `Supabase: Open Dashboard` - Abrir el panel de Supabase
   - `Supabase: Open in Browser` - Ver proyecto en navegador
   - Ver la documentación de la extensión para más comandos

### Opción 2: Usar el Script de Setup

```powershell
.\supabase\setup.ps1
```

### 1. Obtener las credenciales de Supabase

1. Abre tu proyecto en Supabase: https://app.supabase.com/project/rfhizunlwvoemvlscbqg
2. Ve a **Settings** → **API**
3. Copia las siguientes credenciales:
   - **Project URL** (ya configurada: `https://rfhizunlwvoemvlscbqg.supabase.co`)
   - **anon public** key
   - **service_role** key (¡Mantenerla secreta!)
4. Ve a **Settings** → **Database** para obtener:
   - La contraseña de la base de datos

### 2. Crear archivo .env en la carpeta supabase

```bash
# Copia el archivo de ejemplo
cp supabase/.env.example supabase/.env
```

Luego edita `supabase/.env` y reemplaza:
- `your-anon-key-here` con tu anon key
- `your-service-role-key-here` con tu service role key
- `YOUR_PASSWORD` con tu contraseña de base de datos

### 3. Inicializar la extensión de Supabase

Una vez configurado el archivo `.env`:

1. Presiona **Ctrl+Shift+P** (o **Cmd+Shift+P** en Mac)
2. Busca: **Supabase: Start**
3. Selecciona tu proyecto

### 4. Funcionalidades disponibles

Con la extensión configurada podrás:

- 🗄️ **Explorar la base de datos** - Barra lateral de Supabase
- 📝 **Ejecutar queries SQL** - SQL Editor integrado
- 🔐 **Gestionar autenticación** - Ver y administrar usuarios
- 📊 **Ver logs** - Monitorear actividad del proyecto
- 🌐 **Abrir Dashboard** - Acceso rápido al panel web

### 5. Accesos Rápidos

**Proyecto**: https://app.supabase.com/project/rfhizunlwvoemvlscbqg

- [Dashboard](https://app.supabase.com/project/rfhizunlwvoemvlscbqg)
- [API Settings](https://app.supabase.com/project/rfhizunlwvoemvlscbqg/settings/api)
- [Database Editor](https://app.supabase.com/project/rfhizunlwvoemvlscbqg/editor)
- [SQL Editor](https://app.supabase.com/project/rfhizunlwvoemvlscbqg/sql)
- [Auth Users](https://app.supabase.com/project/rfhizunlwvoemvlscbqg/auth/users)

### 5. Comandos útiles

Presiona **Ctrl+Shift+P** y busca:
- `Supabase: Connect to Project` - Conectar al proyecto
- `Supabase: Run SQL Query` - Ejecutar query SQL
- `Supabase: Generate Types` - Generar tipos TypeScript desde tu DB
- `Supabase: Open Dashboard` - Abrir dashboard en el navegador

## 🔗 Enlaces útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [CLI de Supabase](https://supabase.com/docs/guides/cli)
- [Panel de tu proyecto](https://app.supabase.com/project/rfhizunlwvoemvlscbqg)

## 🛡️ Seguridad

⚠️ **IMPORTANTE**: 
- Nunca subas el archivo `supabase/.env` a Git
- El archivo `.gitignore` ya debería incluir `*.env`
- La `service_role` key tiene privilegios completos, mantenla segura
