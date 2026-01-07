# Scripts de Base de Datos - ERP Los Hermanos

> **Propósito:** Índice de scripts SQL disponibles para mantenimiento, validación y gestión de la base de datos

---

## 📁 Estructura de Scripts

```
database/scripts/
├── 00-LEEME-estructura-y-reglas.md      # Documentación de reglas de negocio
├── GUIA-SISTEMA-PRECIOS.md              # Sistema completo de gestión de precios
├── 01-backup-antes-limpieza.sql         # Backup temporal pre-limpieza
├── 02-limpiar-duplicados.sql            # Limpieza de productos duplicados
├── 03-validar-integridad.sql            # Validación de integridad referencial
├── 07-sistema-gestion-precios-completo.sql  # Sistema automático de precios
├── 08-corregir-datos-precios.sql        # Corrección de datos de precios
├── 09-relevamiento-precio-lista.sql     # Análisis de precio_lista
├── 11-remover-constraints-precio-lista.sql  # Remover constraints obsoletos
├── 12-eliminar-columna-precio-lista.sql     # Eliminar columna precio_lista
└── historicos/                          # Scripts de eventos únicos históricos
    └── RESUMEN-LIMPIEZA-2025-12.md      # Resumen de limpieza dic 2025
```

---

## 📚 Documentación Clave

### 1. 📖 00-LEEME-estructura-y-reglas.md
**Propósito:** Documentación completa de reglas de negocio implementadas en BD

**Incluye:**
- Constraints de jerarquía de precios
- Validaciones de productos, ventas y clientes
- Funciones de utilidad
- Triggers de auditoría
- Vistas de reportes y diagnóstico
- Índices de optimización

**Cuándo leer:** Antes de hacer cambios en estructura de BD o reglas de negocio

---

### 2. 📘 GUIA-SISTEMA-PRECIOS.md
**Propósito:** Manual completo del sistema de gestión automática de precios

**Incluye:**
- Arquitectura del sistema
- Modo manual vs automático
- Configuración de márgenes (por categoría y por producto)
- Funciones disponibles
- Vistas y reportes
- Triggers y validaciones
- Ejemplos prácticos y FAQ

**Cuándo leer:** Al trabajar con precios, márgenes o configuración de productos

---

## 🔧 Scripts de Mantenimiento

### Scripts de Limpieza (Orden de ejecución)

**1. Backup antes de cambios**
```bash
psql "$DATABASE_URL" -f database/scripts/01-backup-antes-limpieza.sql
```
- Crea respaldo temporal de datos críticos
- Ejecutar SIEMPRE antes de limpiezas masivas

**2. Limpiar duplicados**
```bash
psql "$DATABASE_URL" -f database/scripts/02-limpiar-duplicados.sql
```
- Consolida productos duplicados
- Actualiza referencias en ventas y precios
- ⚠️ Ejecutar solo si hay duplicados confirmados

**3. Validar integridad**
```bash
psql "$DATABASE_URL" -f database/scripts/03-validar-integridad.sql
```
- Verifica integridad referencial
- Valida jerarquía de precios
- Reporta problemas encontrados
- ✅ Ejecutar después de cambios en BD

---

## 💰 Scripts del Sistema de Precios

### Script Principal

**7. Sistema de gestión de precios completo**
```bash
psql "$DATABASE_URL" -f database/scripts/07-sistema-gestion-precios-completo.sql
```
- Instala sistema completo de precios automáticos
- Crea tablas de configuración
- Implementa funciones de cálculo
- Configura triggers y vistas
- ⚠️ Ejecutar una sola vez (idempotente)

### Scripts de Corrección

**8. Corregir datos de precios**
```bash
psql "$DATABASE_URL" -f database/scripts/08-corregir-datos-precios.sql
```
- Corrige precios con jerarquía inválida
- Sincroniza precios desactualizados

**9-12. Scripts de migración precio_lista**
- Scripts históricos de eliminación de columna `precio_lista`
- Ya ejecutados - mantener solo como referencia

---

## 🔍 Comandos Útiles

### Ejecutar script SQL
```bash
# Método 1: psql (recomendado para scripts complejos)
psql "$DATABASE_URL" -f database/scripts/nombre-script.sql

# Método 2: SQLTools en VS Code
# Abrir script → Ctrl+Shift+E → Ejecutar

# Método 3: Supabase SQL Editor
# Copiar contenido → Pegar en SQL Editor → Ejecutar
```

### Verificar estado de BD
```sql
-- Ver productos sin precios
SELECT * FROM v_productos_sin_precios_config;

-- Ver precios con jerarquía inválida (debe estar vacío)
SELECT * FROM v_precios_jerarquia_invalida;

-- Dashboard completo de precios
SELECT * FROM v_dashboard_precios_completo LIMIT 10;
```

---

## ⚠️ Buenas Prácticas

### Antes de ejecutar scripts

1. ✅ **Leer la documentación** del script
2. ✅ **Hacer backup** si el script modifica datos
3. ✅ **Probar en desarrollo** antes de producción
4. ✅ **Verificar** que no haya transacciones activas

### Después de ejecutar scripts

1. ✅ **Verificar resultados** con queries de validación
2. ✅ **Revisar logs** de errores/warnings
3. ✅ **Sincronizar Prisma** si cambió el schema:
   ```bash
   cd backend
   npx prisma db pull
   npx prisma generate
   ```
4. ✅ **Reiniciar backend** si es necesario

---

## 🚨 Troubleshooting

### Error: "relation already exists"
**Solución:** El script ya fue ejecutado previamente (normal en scripts idempotentes)

### Error: "constraint violation"
**Solución:** Hay datos que violan las nuevas reglas. Corregir datos primero con scripts de corrección.

### Error: "permission denied"
**Solución:** Verificar que tienes permisos de escritura en la BD

---

## 📖 Referencias

- **[ARQUITECTURA.md](../ARQUITECTURA.md)** - Diseño de base de datos completo
- **[backend/docs/PRISMA-CONNECTION-GUIDE.md](../backend/docs/PRISMA-CONNECTION-GUIDE.md)** - Gestión de conexiones
- **[supabase/README.md](../supabase/README.md)** - Configuración de Supabase

---

**Mantenido por:** ERP Los Hermanos Team
**Última actualización:** Enero 2026
