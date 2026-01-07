# 📘 Guía de Gestión de Conexiones Prisma + Supabase

---

## 🎯 OBJETIVO

Evitar agotamiento del pool de conexiones en Supabase cuando usas Prisma con NestJS.

---

## 📊 LÍMITES DE SUPABASE

| Plan | Conexiones Directas | Conexiones Pooler (PgBouncer) |
|------|-------------------|-------------------------------|
| Free | 60 | ~15 (compartido) |
| Pro | 200 | ~500 |
| Team | 400+ | ~1000+ |

**⚠️ IMPORTANTE:** Estás usando el **Session Pooler** de Supabase (puerto 5432 con `pgbouncer=true`), que es limitado en el plan Free.

---

## 1️⃣ CONFIGURACIÓN ÓPTIMA DEL POOL

### `.env` (Ya configurado)

```bash
# ✅ CONFIGURACIÓN OPTIMIZADA
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?schema=public&pgbouncer=true&connection_limit=5&pool_timeout=10&connect_timeout=10"
```

### Parámetros Explicados

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `pgbouncer=true` | ✅ | Usa Session Pooler de Supabase (requerido) |
| `connection_limit` | 5 | Máximo de conexiones por instancia de Prisma |
| `pool_timeout` | 10 | Segundos para esperar una conexión del pool |
| `connect_timeout` | 10 | Segundos para establecer conexión inicial |

### 🧮 Cálculo de Límites

```
Total disponible en Supabase Free: ~15 conexiones
Connection limit por instancia:     5 conexiones
Máximo de instancias seguras:       3 instancias (15 ÷ 5)
```

**Instancias típicas:**
- 1x Backend en desarrollo (hot-reload puede crear múltiples)
- 1x Tests corriendo
- 1x Scripts manuales

**⚠️ Si tienes más de 3 procesos simultáneos, reduce `connection_limit` a 3.**

---

## 2️⃣ PRISMASERVICE - SINGLETON GLOBAL

### ✅ Ya está configurado correctamente

Tu `PrismaService` es **singleton** en toda la aplicación porque:

1. **`@Global()` en PrismaModule** → Disponible en todos los módulos
2. **Un solo provider** → NestJS crea una única instancia
3. **Lifecycle hooks** → Se conecta una sola vez al iniciar

```typescript
// backend/src/core/prisma/prisma.module.ts
@Global()  // ← Hace que PrismaService sea singleton global
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### ✅ Logging Mejorado

El `PrismaService` actualizado ahora incluye:
- ✅ Event listeners para errores y warnings
- ✅ Logger de NestJS para mejor trazabilidad
- ✅ Verificación de conexión al iniciar
- ✅ Manejo de errores en desconexión

---

## 3️⃣ SCRIPTS CON PRISMA

### ❌ INCORRECTO - Sin cerrar conexión

```typescript
// ❌ MAL - La conexión queda abierta
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  console.log(users);
  // ❌ No se desconecta
}

main();
```

### ✅ CORRECTO - Template de script

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    // Tu lógica aquí
    const users = await prisma.user.findMany();
    console.log(`✅ Encontrados ${users.length} usuarios`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    // ✅ SIEMPRE cerrar la conexión
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
```

---

## 4️⃣ TESTS CON JEST

### ❌ INCORRECTO - Tests sin cleanup

```typescript
// ❌ MAL - Conexiones se acumulan
describe('MiServicio', () => {
  let service: MiServicio;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MiServicio, PrismaService],
    }).compile();

    service = module.get(MiServicio);
    prisma = module.get(PrismaService);
  });

  it('debería funcionar', async () => {
    const result = await service.getData();
    expect(result).toBeDefined();
  });

  // ❌ No se desconecta Prisma
});
```

### ✅ CORRECTO - Con cleanup

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/core/prisma/prisma.service';
import { MiServicio } from './mi-servicio.service';

describe('MiServicio', () => {
  let service: MiServicio;
  let prisma: PrismaService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [MiServicio, PrismaService],
    }).compile();

    service = module.get(MiServicio);
    prisma = module.get(PrismaService);
  });

  // ✅ Cerrar conexiones después de cada test
  afterEach(async () => {
    await module.close();
  });

  // ✅ Cleanup final
  afterAll(async () => {
    // Asegurar que todas las conexiones se cierren
    await prisma.$disconnect();
  });

  it('debería funcionar', async () => {
    const result = await service.getData();
    expect(result).toBeDefined();
  });
});
```

### 🎯 MEJOR OPCIÓN - Usar Mocks en Tests Unitarios

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { createMockPrismaService } from '../helpers/mock-data';

describe('MiServicio (Unit)', () => {
  let service: MiServicio;
  let mockPrisma: any;

  beforeEach(async () => {
    // ✅ Usar mock - NO se conecta a BD real
    mockPrisma = createMockPrismaService();

    const module = await Test.createTestingModule({
      providers: [
        MiServicio,
        {
          provide: PrismaService,
          useValue: mockPrisma,  // ← Mock en lugar de PrismaService real
        },
      ],
    }).compile();

    service = module.get(MiServicio);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería funcionar con mock', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 1, name: 'Test' }]);

    const result = await service.getData();
    expect(result).toHaveLength(1);

    // ✅ No hay conexión real a BD
  });
});
```

---

## 5️⃣ TESTS E2E (End-to-End)

### ✅ Setup de BD de prueba

```typescript
// test/setup-e2e.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,  // ← BD separada para tests
    },
  },
});

export async function setupTestDatabase() {
  // Limpiar BD antes de tests
  await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
  console.log('🧹 BD de prueba limpia');
}

export async function teardownTestDatabase() {
  await prisma.$disconnect();
  console.log('🔌 BD de prueba desconectada');
}

// Exportar para usar en tests
export { prisma };
```

### ✅ Test E2E con cleanup

```typescript
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { setupTestDatabase, teardownTestDatabase } from './setup-e2e';

describe('AppController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await teardownTestDatabase();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

---

## 6️⃣ COMANDOS ÚTILES DE MONITOREO

### Verificar conexiones activas en Supabase

```bash
# Conectar a Supabase con psql
psql "postgresql://USER:PASS@HOST:5432/DB"

# Ver conexiones activas
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE datname = 'postgres'
ORDER BY query_start DESC;

# Contar conexiones por estado
SELECT state, COUNT(*)
FROM pg_stat_activity
WHERE datname = 'postgres'
GROUP BY state;
```

### Verificar pool de Prisma (en desarrollo)

```typescript
// Agregar al PrismaService temporalmente
console.log('Pool stats:', this._engineConfig);
```

---

## 7️⃣ TROUBLESHOOTING

### ❌ Error: "Can't reach database server"

**Causa:** Todas las conexiones del pool están agotadas.

**Solución:**
1. Reduce `connection_limit` a 3 en `.env`
2. Asegúrate de cerrar scripts/tests correctamente
3. Reinicia el backend: `npm run start:dev`

### ❌ Error: "Prepared statement already exists"

**Causa:** Usar PgBouncer en modo "transaction" en lugar de "session".

**Solución:**
✅ Ya usas `pgbouncer=true` que fuerza modo "session" → Correcto

### ❌ Error: "Connection timeout"

**Causa:** `pool_timeout` muy bajo o todas las conexiones ocupadas.

**Solución:**
1. Aumenta `pool_timeout` a 20: `pool_timeout=20`
2. Verifica que no haya scripts colgados sin `$disconnect()`

### ❌ Hot-reload en desarrollo crea múltiples instancias

**Causa:** NestJS reinicia la app pero no cierra conexiones antiguas.

**Solución temporal:**
```bash
# Usar nodemon en lugar de nest start --watch
npm install --save-dev nodemon

# En package.json
"dev": "nodemon --exec ts-node -r tsconfig-paths/register src/main.ts"
```

---

## 8️⃣ CHECKLIST DE BUENAS PRÁCTICAS

### Backend
- ✅ `PrismaModule` es `@Global()`
- ✅ Un solo `PrismaService` en toda la app
- ✅ `connection_limit` entre 3-5 para desarrollo
- ✅ Usar Session Pooler de Supabase (`pgbouncer=true`)

### Scripts
- ✅ Siempre crear nueva instancia de `PrismaClient`
- ✅ Usar `try/catch/finally` con `$disconnect()` en `finally`
- ✅ Llamar a `process.exit()` al finalizar

### Tests Unitarios
- ✅ Usar mocks de Prisma (NO conexión real)
- ✅ `jest.clearAllMocks()` en `afterEach()`

### Tests E2E
- ✅ BD separada para tests (`TEST_DATABASE_URL`)
- ✅ `app.close()` en `afterAll()`
- ✅ `prisma.$disconnect()` en teardown

### Monitoreo
- ✅ Revisar logs de conexión en Supabase Dashboard
- ✅ Activar logging de queries lentas si hay problemas
- ✅ Verificar conexiones activas con `pg_stat_activity`

---

## 📚 RECURSOS

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)

---

**✅ Configuración completada. Tu backend ahora gestiona conexiones de forma óptima.**
