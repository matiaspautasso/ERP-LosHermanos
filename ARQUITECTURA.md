# ARQUITECTURA - ERP Los Hermanos

> **Última Actualización:** Dic 2025

## Tabla de Contenidos

1. [Visión Arquitectónica](#visión-arquitectónica)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Patrón de Módulos](#patrón-de-módulos)
5. [Flujo de Datos](#flujo-de-datos)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Base de Datos](#base-de-datos)
8. [Workflow con Prisma](#workflow-con-prisma)
9. [Patrones de Comunicación Frontend-Backend](#patrones-de-comunicación-frontend-backend)
10. [Configuraciones Globales](#configuraciones-globales)
11. [Convenciones de Código](#convenciones-de-código)
12. [Dependencias Clave](#dependencias-clave)
13. [Características Implementadas](#características-implementadas)
14. [Troubleshooting](#troubleshooting)

---

## Visión Arquitectónica

Arquitectura **monorepo modular** que combina eficiencia operativa con separación clara de responsabilidades.

**Principios:**
- Backend y Frontend separados pero cohesivos
- Módulos independientes con servicios compartidos
- Escalabilidad horizontal por módulos
- **Database-first approach** con Prisma (cambios en BD primero, luego sincronización)
- Separación de responsabilidades clara (controllers solo routing, services lógica de negocio)

**Diseño:**
```
[React UI] ←→ [Axios] ←→ [NestJS API] ←→ [Prisma ORM] ←→ [PostgreSQL]
    ↓                          ↓
[Zustand State]         [Services Layer]
[React Query Cache]     [Event Emitters]
```

---

## Stack Tecnológico

### Backend (NestJS)

| Componente | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| Framework | NestJS | Latest | Framework principal backend |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| ORM | Prisma Client | Latest | Acceso a base de datos |
| Base de Datos | PostgreSQL (Supabase) | 14+ | Almacenamiento persistente |
| Autenticación | express-session | Latest | Sesiones basadas en cookies |
| Validación | class-validator | Latest | Validación de DTOs |
| Transformación | class-transformer | Latest | Transformación de objetos |
| Emails | Nodemailer | Latest | Envío de correos |
| Documentación | @nestjs/swagger | Latest | Documentación API automática |
| Testing | Jest | Latest | Framework de testing |
| Eventos | @nestjs/event-emitter | Latest | Eventos de dominio |

### Frontend (React)

| Componente | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| Framework | React | 18.x | UI library |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| Build Tool | Vite | Latest | Build tool rápido |
| Styling | TailwindCSS | 3.x | Utility-first CSS |
| UI Components | shadcn/ui (Radix) | Latest | Componentes accesibles |
| Estado Global | Zustand | Latest | Estado global ligero |
| Server State | React Query | Latest | Gestión de caché y sincronización |
| HTTP Client | Axios | Latest | Cliente HTTP |
| Routing | React Router | 6.x | Routing SPA |
| Formularios | React Hook Form | Latest | Gestión de formularios |
| Validación | Zod | Latest | Validación de schemas |
| PDF | jsPDF | Latest | Generación de PDFs |
| Excel | xlsx | Latest | Exportación Excel |
| Toasts | sonner | Latest | Notificaciones toast |

### Base de Datos (PostgreSQL)

| Componente | Tecnología | Propósito |
|-----------|------------|-----------|
| Proveedor | Supabase | PostgreSQL gestionado |
| Schema | 17 tablas normalizadas | Modelo de datos |
| ORM | Prisma | Database-first approach |
| Extensions | unaccent | Búsquedas sin acentos |

---

## Estructura del Proyecto

### Vista General

```
ERP-LosHermanos/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/           # Módulos de negocio
│   │   │   ├── auth/          # ✅ Autenticación
│   │   │   ├── ventas/        # ✅ Ventas
│   │   │   ├── productos/     # 🔄 Productos (70%)
│   │   │   ├── clientes/      # 🔄 Clientes (50%)
│   │   │   ├── compras/       # ⏳ Compras (10%)
│   │   │   ├── proveedores/   # ⏳ Proveedores (10%)
│   │   │   ├── email/         # 📧 Email service
│   │   │   └── reportes/      # ⏳ Reportes
│   │   ├── core/              # Servicios compartidos
│   │   │   └── prisma/        # PrismaService
│   │   ├── shared/            # Utilidades compartidas
│   │   │   ├── decorators/    # Decoradores custom
│   │   │   └── guards/        # Guards de autenticación
│   │   └── main.ts            # Punto de entrada
│   ├── prisma/
│   │   ├── schema.prisma      # Schema de Prisma
│   │   └── seed.ts            # Datos de prueba
│   ├── test/                  # Tests (configurado)
│   ├── .env                   # Variables de entorno
│   └── package.json
│
├── frontend/                  # App React
│   └── src/
│       ├── modules/          # Módulos UI
│       │   ├── auth/         # ✅ Login, registro, recover
│       │   │   ├── pages/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── api/
│       │   ├── ventas/       # ✅ Gestión ventas
│       │   │   ├── pages/
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── api/
│       │   └── productos/    # 🔄 Gestión precios
│       │       ├── pages/
│       │       ├── components/
│       │       ├── hooks/
│       │       └── api/
│       ├── core/             # Configuración global
│       │   ├── api/          # Configuración axios
│       │   ├── stores/       # Stores Zustand
│       │   └── routes/       # Configuración de rutas
│       ├── shared/           # Componentes compartidos
│       │   ├── components/   # Componentes reutilizables
│       │   │   ├── ui/       # shadcn/ui components
│       │   │   └── ConfirmacionModal.tsx
│       │   └── layouts/      # Layouts (Sidebar, etc.)
│       ├── App.tsx           # Componente raíz
│       ├── main.tsx          # Punto de entrada
│       └── vite.config.ts
│
├── database/                 # Scripts SQL
│   └── scripts/
│       ├── 01-backup-antes-limpieza.sql
│       ├── 02-limpiar-duplicados.sql
│       └── 03-validar-integridad.sql
│
├── docs/                     # Documentación
│   └── modulos/             # Docs por módulo
│
├── .gitignore
├── package.json             # Scripts raíz
├── CLAUDE.md                # Guía para Claude Code
├── README.md                # Instalación y uso básico
├── ROADMAP.md               # Fases y progreso
└── ARQUITECTURA.md          # Este archivo
```

---

## Patrón de Módulos

### Backend Module Pattern

Cada módulo de backend sigue esta estructura:

```typescript
backend/src/modules/[modulo]/
├── [modulo].module.ts          # Módulo NestJS (imports, providers, exports)
├── [modulo].controller.ts      # REST endpoints (solo routing)
├── [modulo].service.ts         # Lógica de negocio
├── dto/                        # Data Transfer Objects
│   ├── create-[modulo].dto.ts  # DTO para creación
│   └── update-[modulo].dto.ts  # DTO para actualización (PartialType)
└── events/                     # Eventos de dominio (opcional)
    └── [modulo].events.ts
```

**Ejemplo de Controller:**
```typescript
@Controller('ventas')
@UseGuards(AuthenticatedGuard)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto, @GetUser() user: User) {
    return this.ventasService.create(createVentaDto, user.id);
  }

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }
}
```

**Ejemplo de Service:**
```typescript
@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createVentaDto: CreateVentaDto, usuarioId: bigint) {
    const venta = await this.prisma.venta.create({
      data: {
        ...createVentaDto,
        usuario_id: usuarioId,
      },
      include: { detalles: true },
    });

    this.eventEmitter.emit('venta.creada', venta);
    return venta;
  }
}
```

### Frontend Module Pattern

Cada módulo de frontend sigue esta estructura:

```typescript
frontend/src/modules/[modulo]/
├── pages/                      # Páginas principales
│   ├── Lista[Modulo]Page.tsx
│   ├── Nuevo[Modulo]Page.tsx
│   ├── Editar[Modulo]Page.tsx
│   └── Detalle[Modulo]Page.tsx
├── components/                # Componentes específicos
│   ├── Modal[Algo].tsx
│   └── Tabla[Algo].tsx
├── hooks/                     # React hooks + React Query
│   └── use[Modulo].ts
└── api/                       # Services y tipos
    ├── [modulo]Service.ts     # Funciones de API
    └── types.ts               # Tipos TypeScript
```

**Ejemplo de Service (Frontend):**
```typescript
// modules/ventas/api/ventasService.ts
import { apiClient } from '@/core/api/axios';
import { Venta, CreateVentaDto } from './types';

export const ventasService = {
  async crearVenta(data: CreateVentaDto): Promise<Venta> {
    const response = await apiClient.post<Venta>('/ventas', data);
    return response.data;
  },

  async obtenerVentas(): Promise<Venta[]> {
    const response = await apiClient.get<Venta[]>('/ventas');
    return response.data;
  },
};
```

**Ejemplo de Hook con React Query:**
```typescript
// modules/ventas/hooks/useVentas.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ventasService } from '../api/ventasService';
import { toast } from 'sonner';

export const useCrearVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ventasService.crearVenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear venta');
    },
  });
};

export const useListaVentas = () => {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: ventasService.obtenerVentas,
  });
};
```

---

## Flujo de Datos

### Flujo típico de una operación

1. **Usuario interactúa con UI** (React Component)
   - Ejemplo: Click en botón "Crear Venta"

2. **Hook dispara mutación/query** (React Query)
   - `const { mutate } = useCrearVenta()`
   - `mutate(formData)`

3. **Service hace request HTTP** (Axios)
   - `apiClient.post('/ventas', data)`
   - Header: `Cookie: connect.sid=...` (automático con `withCredentials: true`)

4. **Controller recibe request** (NestJS)
   - Guard valida sesión (`@UseGuards(AuthenticatedGuard)`)
   - Validation pipe valida DTO
   - Controller extrae datos: `@Body() dto, @GetUser() user`

5. **Service ejecuta lógica de negocio**
   - Validaciones adicionales
   - Transformaciones
   - Lógica de dominio

6. **Prisma accede/modifica base de datos**
   - `prisma.venta.create({ data: {...} })`
   - Transacciones si es necesario

7. **Eventos de dominio (opcional)**
   - `eventEmitter.emit('venta.creada', venta)`

8. **Response retorna por la cadena inversa**
   - Service → Controller → HTTP → Axios → React Query → Component

9. **React Query actualiza caché**
   - Invalida queries relacionadas
   - Re-fetch automático

10. **UI se actualiza**
    - Toast de confirmación
    - Tabla actualizada
    - Formulario reseteado

### Diagrama de Flujo

```
┌─────────────┐
│  React UI   │ ← Usuario interactúa
└──────┬──────┘
       │
       ↓
┌──────────────┐
│ React Query  │ ← Mutación/Query
│   Hooks      │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│    Axios     │ ← HTTP Request (withCredentials: true)
│  apiClient   │
└──────┬───────┘
       │
       ↓ HTTP POST/GET/PUT/DELETE
       │
┌──────────────┐
│   NestJS     │
│  Controller  │ ← @UseGuards, @Body, @GetUser
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   NestJS     │ ← Lógica de negocio
│   Service    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│    Prisma    │ ← CRUD operations
│     ORM      │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  PostgreSQL  │ ← Datos persistentes
│   (Supabase) │
└──────────────┘
```

---

## Autenticación y Seguridad

### Sistema de Autenticación

**Tipo:** Autenticación basada en **sesiones** (NO JWT)

**Stack:**
- `express-session` (backend)
- Cookies `httpOnly` y `sameSite: lax`
- `bcrypt` para hashing de contraseñas (10 rondas)
- `withCredentials: true` en axios (frontend)

### Flujo de Autenticación

#### 1. Login

**Frontend:**
```typescript
// modules/auth/api/authService.ts
const response = await apiClient.post('/auth/login', {
  email: 'vendedor@erp.com',
  password: 'vendedor123',
});
// Cookie se establece automáticamente en el navegador
```

**Backend:**
```typescript
// modules/auth/auth.controller.ts
@Post('login')
async login(@Body() dto: LoginDto, @Session() session: Record<string, any>) {
  const user = await this.authService.validateUser(dto.email, dto.password);
  session.userId = user.id; // Guarda en sesión
  return user;
}
```

**Resultado:** Cookie `connect.sid=...` se establece en navegador

#### 2. Requests Autenticados

**Frontend:**
```typescript
// Automático con withCredentials: true
const ventas = await apiClient.get('/ventas');
// Cookie se envía automáticamente
```

**Backend:**
```typescript
@Controller('ventas')
@UseGuards(AuthenticatedGuard) // Valida sesión
export class VentasController {
  @Get()
  findAll(@GetUser() user: User) { // Decorator custom extrae user
    return this.ventasService.findAll(user.id);
  }
}
```

#### 3. Logout

**Frontend:**
```typescript
await apiClient.post('/auth/logout');
// Cookie se elimina
```

**Backend:**
```typescript
@Post('logout')
logout(@Session() session: Record<string, any>) {
  session.destroy();
}
```

### Configuración de Seguridad

**Backend - Session Config (`main.ts`):**
```typescript
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true,               // No accesible desde JS
      sameSite: 'lax',              // Protección CSRF
      secure: process.env.NODE_ENV === 'production', // HTTPS en prod
    },
  }),
);
```

**Frontend - Axios Config:**
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Envía cookies automáticamente
  timeout: 10000,
});

// Interceptor para redirigir a login en 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### Protección de Rutas

**Backend - Guard:**
```typescript
// shared/guards/authenticated.guard.ts
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return request.session?.userId !== undefined;
  }
}
```

**Frontend - Protected Route:**
```typescript
// shared/components/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

// Uso en App.tsx
<Route path="/ventas" element={<ProtectedRoute><VentasPage /></ProtectedRoute>} />
```

### CORS

**Configuración en Backend:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL, // Solo frontend permitido
  credentials: true,                 // Permite cookies
});
```

---

## Base de Datos

### Arquitectura de PostgreSQL

**Características Técnicas:**
- 17 tablas normalizadas (3NF)
- Foreign keys con restricciones de integridad
- IDs BigInt en todas las tablas (serializados a `string` en JSON)
- Timestamps con zona horaria: `@db.Timestamptz(6)`
- Decimales monetarios: `@db.Decimal(12, 2)`
- Extension `unaccent` habilitada (búsquedas sin acentos)

### Tablas Principales

#### 1. Autenticación y Usuarios

**`usuarios` (User en Prisma):**
```prisma
model User {
  id                BigInt    @id @default(autoincrement())
  nombre            String    @db.VarChar(100)
  apellido          String    @db.VarChar(100)
  email             String    @unique @db.VarChar(255)
  password          String    @db.VarChar(255)
  activo            Boolean   @default(true)
  creado_en         DateTime  @default(now()) @db.Timestamptz(6)
  actualizado_en    DateTime  @updatedAt @db.Timestamptz(6)

  ventas            Venta[]
  @@map("usuarios")
}
```

#### 2. Clientes

**`clientes`:**
```prisma
model Cliente {
  id                  BigInt    @id @default(autoincrement())
  nombre              String    @db.VarChar(100)
  apellido            String    @db.VarChar(100)
  tipo_cliente        String    @db.VarChar(20) // 'minorista', 'mayorista', 'supermayorista'
  email               String?   @db.VarChar(255)
  telefono            String?   @db.VarChar(20)
  direccion           String?   @db.VarChar(255)
  saldo_cuenta        Decimal   @default(0) @db.Decimal(12, 2)
  activo              Boolean   @default(true)
  creado_en           DateTime  @default(now()) @db.Timestamptz(6)

  ventas              Venta[]
  movimientos_cc      MovimientoCuentaCorriente[]
  @@map("clientes")
}
```

#### 3. Productos y Precios

**`productos`:**
```prisma
model Producto {
  id                BigInt      @id @default(autoincrement())
  nombre            String      @db.VarChar(255)
  descripcion       String?     @db.Text
  codigo_barras     String?     @unique @db.VarChar(50)
  categoria_id      BigInt
  unidad_id         BigInt
  stock_actual      Decimal     @default(0) @db.Decimal(12, 2)
  stock_minimo      Decimal     @default(0) @db.Decimal(12, 2)
  activo            Boolean     @default(true)
  creado_en         DateTime    @default(now()) @db.Timestamptz(6)

  categoria         Categoria   @relation(fields: [categoria_id], references: [id])
  unidad            Unidad      @relation(fields: [unidad_id], references: [id])
  precios           Precio[]
  detalles_venta    DetalleVenta[]
  @@map("productos")
}
```

**`precios` (Historial completo):**
```prisma
model Precio {
  id                      BigInt    @id @default(autoincrement())
  producto_id             BigInt
  precio_minorista        Decimal   @db.Decimal(12, 2)
  precio_mayorista        Decimal   @db.Decimal(12, 2)
  precio_supermayorista   Decimal   @db.Decimal(12, 2)
  ultima_modificacion     DateTime  @default(now()) @db.Timestamptz(6)
  usuario_id              BigInt?

  producto                Producto  @relation(fields: [producto_id], references: [id])

  @@index([producto_id, ultima_modificacion(sort: Desc)], name: "ix_precios_producto_fecha")
  @@map("precios")
}
```

**Índice Optimizado:**
- `ix_precios_producto_fecha`: Compuesto en `(producto_id, ultima_modificacion DESC)`
- Permite obtener precio actual de un producto con `ORDER BY + LIMIT 1` eficientemente

#### 4. Ventas

**`ventas`:**
```prisma
model Venta {
  id                BigInt        @id @default(autoincrement())
  cliente_id        BigInt
  usuario_id        BigInt
  tipo_venta        String        @db.VarChar(20) // 'minorista', 'mayorista', 'supermayorista'
  forma_pago        String        @db.VarChar(20) // 'efectivo', 'tarjeta', 'transferencia'
  total             Decimal       @db.Decimal(12, 2)
  fecha             DateTime      @default(now()) @db.Timestamptz(6)

  cliente           Cliente       @relation(fields: [cliente_id], references: [id])
  usuario           User          @relation(fields: [usuario_id], references: [id])
  detalles          DetalleVenta[]
  @@map("ventas")
}
```

**`detalle_venta`:**
```prisma
model DetalleVenta {
  id                BigInt    @id @default(autoincrement())
  venta_id          BigInt
  producto_id       BigInt
  cantidad          Decimal   @db.Decimal(12, 2)
  precio_unitario   Decimal   @db.Decimal(12, 2)
  subtotal          Decimal   @db.Decimal(12, 2)

  venta             Venta     @relation(fields: [venta_id], references: [id], onDelete: Cascade)
  producto          Producto  @relation(fields: [producto_id], references: [id])
  @@map("detalle_venta")
}
```

#### 5. Compras y Proveedores

**`proveedores`:**
```prisma
model Proveedor {
  id                BigInt    @id @default(autoincrement())
  nombre            String    @db.VarChar(255)
  contacto          String?   @db.VarChar(100)
  telefono          String?   @db.VarChar(20)
  email             String?   @db.VarChar(255)
  direccion         String?   @db.VarChar(255)
  activo            Boolean   @default(true)

  ordenes_compra    OrdenCompra[]
  @@map("proveedores")
}
```

**`ordenes_compra`:**
```prisma
model OrdenCompra {
  id                BigInt        @id @default(autoincrement())
  proveedor_id      BigInt
  usuario_id        BigInt
  estado            String        @db.VarChar(20) // 'pendiente', 'recibida', 'cancelada'
  total             Decimal       @db.Decimal(12, 2)
  fecha_emision     DateTime      @default(now()) @db.Timestamptz(6)
  fecha_recepcion   DateTime?     @db.Timestamptz(6)

  proveedor         Proveedor     @relation(fields: [proveedor_id], references: [id])
  detalles          DetalleOrdenCompra[]
  @@map("ordenes_compra")
}
```

#### 6. Auditoría

**`movimientos_stock`:**
```prisma
model MovimientoStock {
  id                BigInt    @id @default(autoincrement())
  producto_id       BigInt
  tipo_movimiento   String    @db.VarChar(20) // 'entrada', 'salida', 'ajuste'
  cantidad          Decimal   @db.Decimal(12, 2)
  motivo            String?   @db.Text
  usuario_id        BigInt?
  fecha             DateTime  @default(now()) @db.Timestamptz(6)

  @@map("movimientos_stock")
}
```

### Relaciones Importantes

1. **Usuario → Ventas/Compras:** La mayoría de operaciones requieren `usuario_id` (trazabilidad)
2. **Producto → Categoría/Unidad:** Relación obligatoria
3. **Venta → Cliente + Usuario + DetalleVenta[]:** Venta completa con detalles
4. **Precio → Producto:** Historial completo (un producto tiene muchos precios)
5. **Eliminaciones en cascada:** `DetalleVenta` se elimina cuando se elimina `Venta`

### BigInt Serialization

**Problema:** JavaScript no soporta BigInt en JSON nativo

**Solución:** Serialización global en `main.ts`

```typescript
// backend/src/main.ts
BigInt.prototype.toJSON = function () {
  return this.toString();
};
```

**Resultado:** Todos los BigInt se convierten a `string` automáticamente en respuestas HTTP

### Extension unaccent

**Propósito:** Búsquedas sin distinguir acentos

**Ejemplo de uso:**
```typescript
// Buscar productos sin acentos
const productos = await this.prisma.$queryRaw`
  SELECT * FROM productos
  WHERE unaccent(nombre) ILIKE unaccent(${'%cafe%'})
`;
// Encuentra: "Café", "cafe", "CAFE", etc.
```

---

## Workflow con Prisma

### Database-First Approach

**IMPORTANTE:** Este proyecto NO usa migraciones de Prisma (`prisma migrate`). Los cambios se hacen directamente en PostgreSQL.

### Flujo cuando se modifica la Base de Datos

1. **Modificar schema en PostgreSQL** (Supabase dashboard o psql)
   ```sql
   ALTER TABLE productos ADD COLUMN nuevo_campo VARCHAR(255);
   ```

2. **Sincronizar schema de Prisma** desde backend:
   ```bash
   cd backend
   npx prisma db pull
   ```
   - Lee schema de PostgreSQL
   - Actualiza `prisma/schema.prisma`

3. **Regenerar Prisma Client:**
   ```bash
   npx prisma generate
   ```
   - Genera tipos TypeScript actualizados
   - Actualiza métodos del cliente

4. **Reiniciar servidor dev:**
   ```bash
   # Ctrl+C para detener
   npm run start:dev
   ```

### Prisma Studio (GUI de BD)

```bash
cd backend
npm run prisma:studio
# Abre http://localhost:5555
```

- Visualizar datos
- Editar registros
- Explorar relaciones
- NO usar para cambios de schema (usar PostgreSQL directo)

### Seed (Datos de Prueba)

**Archivo:** `backend/prisma/seed.ts`

**Ejecutar:**
```bash
cd backend
npm run prisma:seed
```

**Contenido típico:**
- Usuario de prueba (`vendedor@erp.com`)
- Categorías de productos
- Unidades
- Productos de ejemplo
- Clientes de ejemplo

---

## Patrones de Comunicación Frontend-Backend

### Capa de API (Frontend)

Cada módulo tiene carpeta `api/` con:

1. **`[modulo]Service.ts`** - Funciones de API
2. **`types.ts`** - Tipos TypeScript

**Ejemplo:**
```typescript
// modules/ventas/api/ventasService.ts
import { apiClient } from '@/core/api/axios';
import { Venta, CreateVentaDto } from './types';

export const ventasService = {
  async crearVenta(data: CreateVentaDto): Promise<Venta> {
    const response = await apiClient.post<Venta>('/ventas', data);
    return response.data;
  },

  async obtenerVentas(): Promise<Venta[]> {
    const response = await apiClient.get<Venta[]>('/ventas');
    return response.data;
  },

  async obtenerVenta(id: string): Promise<Venta> {
    const response = await apiClient.get<Venta>(`/ventas/${id}`);
    return response.data;
  },

  async actualizarVenta(id: string, data: Partial<CreateVentaDto>): Promise<Venta> {
    const response = await apiClient.put<Venta>(`/ventas/${id}`, data);
    return response.data;
  },

  async eliminarVenta(id: string): Promise<void> {
    await apiClient.delete(`/ventas/${id}`);
  },
};
```

```typescript
// modules/ventas/api/types.ts
export interface Venta {
  id: string;
  cliente_id: string;
  usuario_id: string;
  tipo_venta: 'minorista' | 'mayorista' | 'supermayorista';
  forma_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  total: string;
  fecha: string;
  detalles: DetalleVenta[];
}

export interface CreateVentaDto {
  cliente_id: string;
  tipo_venta: string;
  forma_pago: string;
  detalles: {
    producto_id: string;
    cantidad: number;
    precio_unitario: string;
  }[];
}
```

### React Query Integration

**Hooks personalizados** encapsulan llamadas a React Query:

```typescript
// modules/ventas/hooks/useVentas.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ventasService } from '../api/ventasService';
import { toast } from 'sonner';
import { CreateVentaDto } from '../api/types';

// QUERY - Listar ventas
export const useListaVentas = () => {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: ventasService.obtenerVentas,
  });
};

// QUERY - Obtener venta individual
export const useVenta = (id: string) => {
  return useQuery({
    queryKey: ['venta', id],
    queryFn: () => ventasService.obtenerVenta(id),
    enabled: !!id,
  });
};

// MUTATION - Crear venta
export const useCrearVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVentaDto) => ventasService.crearVenta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta creada exitosamente');
    },
    onError: (error: any) => {
      const mensaje = error.response?.data?.message || 'Error al crear venta';
      toast.error(mensaje);
    },
  });
};

// MUTATION - Eliminar venta
export const useEliminarVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ventasService.eliminarVenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar venta');
    },
  });
};
```

**Uso en componentes:**
```typescript
// modules/ventas/pages/NuevaVentaPage.tsx
import { useCrearVenta } from '../hooks/useVentas';

export const NuevaVentaPage = () => {
  const { mutate: crearVenta, isPending } = useCrearVenta();

  const handleSubmit = (formData: CreateVentaDto) => {
    crearVenta(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear Venta'}
      </button>
    </form>
  );
};
```

### Manejo de Errores

**Backend:**
- Respuestas HTTP estándar (200, 201, 400, 401, 404, 500)
- Mensajes descriptivos en `message`

**Frontend:**
- Interceptor axios: 401 → redirect login
- React Query: 1 retry automático (configurado en QueryClient)
- Toasts con `sonner` para feedback al usuario

---

## Configuraciones Globales

### Backend - main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global /api
  app.setGlobalPrefix('api');

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true,   // Lanza error si hay props extra
      transform: true,              // Transforma payloads a instancias de DTO
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // Sessions
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // BigInt serialization
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('ERP Los Hermanos API')
    .setDescription('API para sistema ERP')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

### Frontend - Axios Config

```typescript
// core/api/axios.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:3000/api
  withCredentials: true,                  // Envía cookies automáticamente
  timeout: 10000,                        // 10 segundos
});

// Interceptor para errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
```

### Frontend - React Query Config

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                      // 1 retry automático
      refetchOnWindowFocus: false,   // No refetch al cambiar de pestaña
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App */}
    </QueryClientProvider>
  );
};
```

---

## Convenciones de Código

### Backend (NestJS)

#### DTOs con class-validator

```typescript
// dto/create-venta.dto.ts
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class DetalleVentaDto {
  @IsString()
  @IsNotEmpty()
  producto_id: string;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precio_unitario: number;
}

export class CreateVentaDto {
  @IsString()
  @IsNotEmpty()
  cliente_id: string;

  @IsString()
  @IsNotEmpty()
  tipo_venta: string;

  @IsString()
  @IsNotEmpty()
  forma_pago: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];
}
```

```typescript
// dto/update-venta.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDto } from './create-venta.dto';

export class UpdateVentaDto extends PartialType(CreateVentaDto) {}
```

#### Servicios vs Controllers

**Controllers:**
- Solo routing
- No lógica de negocio
- Decoradores: `@Controller`, `@Get`, `@Post`, `@UseGuards`, `@Body`, `@Param`, `@Query`

**Services:**
- Toda la lógica de negocio
- Validaciones adicionales
- Transformaciones
- Interacción con Prisma
- Emisión de eventos

#### Decoradores Custom

```typescript
// shared/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Asume que user fue establecido por Guard
  },
);
```

**Uso:**
```typescript
@Get('profile')
@UseGuards(AuthenticatedGuard)
getProfile(@GetUser() user: User) {
  return user;
}
```

### Frontend (React)

#### Hooks Personalizados

- Prefijo `use`
- Ejemplos: `useVentas`, `useAuth`, `usePrecios`

#### Stores Zustand

```typescript
// core/stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  logout: () => set({ user: null }),
}));
```

#### Servicios API

- Centralizados en `modules/[modulo]/api/`
- Un archivo `[modulo]Service.ts` por módulo
- Exporta objeto con métodos async

#### Componentes shadcn/ui

- Ubicados en `shared/components/ui/`
- Instalados con `npx shadcn-ui@latest add [component]`
- Ejemplos: Button, Input, Dialog, Table, Card

---

## Dependencias Clave

### Backend

```json
{
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-express": "^10.x",
    "@nestjs/swagger": "^7.x",
    "@nestjs/event-emitter": "^2.x",
    "@prisma/client": "^5.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x",
    "bcrypt": "^5.x",
    "express-session": "^1.x",
    "nodemailer": "^6.x"
  },
  "devDependencies": {
    "@types/express-session": "^1.x",
    "@types/bcrypt": "^5.x",
    "@types/nodemailer": "^6.x",
    "prisma": "^5.x",
    "jest": "^29.x",
    "@nestjs/testing": "^10.x"
  }
}
```

### Frontend

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "zustand": "^4.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@radix-ui/react-*": "^1.x",
    "jspdf": "^2.x",
    "xlsx": "^0.18.x",
    "sonner": "^1.x",
    "tailwindcss": "^3.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x"
  }
}
```

---

## Características Implementadas

### Módulo de Ventas

#### Funcionalidades Principales

- **CRUD completo:** Crear, leer, actualizar, eliminar ventas
- **Búsqueda de productos sin acentos:** Extension `unaccent` de PostgreSQL
- **Tipos de venta:** Minorista, Mayorista, Supermayorista (badge morado)
- **Formas de pago:** Efectivo, Tarjeta, Transferencia
- **Exportación:** PDF (jsPDF) y Excel (xlsx)
- **Detalle de venta:** Vista completa con historial

#### UX Optimizada

- **Modal de confirmación** al cambiar cliente durante creación de venta
- **Formulario permanece abierto** después de crear venta (ventas consecutivas)
- **Validación de cliente** antes de agregar productos
- **Sin IVA** (eliminado del sistema)
- **Tipo venta bloqueado** según cliente seleccionado automáticamente

### Módulo de Gestión de Precios

#### Funcionalidades Principales

- **Edición individual:** Modal con validación (Supermayorista ≤ Mayorista ≤ Minorista)
- **Ajuste masivo:** Por categoría con porcentaje o valor fijo
- **Historial completo:** Tabla `precios` con todos los cambios
- **Exportación Excel:** Lista completa de precios
- **Índice optimizado:** `ix_precios_producto_fecha` para consultas rápidas

#### Endpoints

- `GET /api/productos/precios/lista` - Lista completa de precios
- `PUT /api/productos/:id/precios` - Actualizar precio individual
- `PATCH /api/productos/precios/masivo` - Ajuste masivo por categoría

#### Hooks

- `usePrecios.ts` con React Query
- `useActualizarPrecio()`, `useAjusteMasivo()`, `useListaPrecios()`

#### Componentes

- `GestionPreciosPage` - Página principal
- `ModalEditarPrecio` - Edición individual
- `ModalAjusteMasivo` - Ajuste por categoría
- Navegación integrada en Sidebar (Ventas → Gestión Precios)

### Módulo de Autenticación

#### Funcionalidades

- **Login** con sesiones (express-session)
- **Registro** de usuarios
- **Recuperación de contraseña** por email (nodemailer)
- **Cambio de contraseña** desde login
- **Protección de rutas** (frontend y backend)

#### Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `POST /api/auth/recover`

### Componentes Compartidos

**`ConfirmacionModal.tsx`**
- Modal reutilizable de confirmación
- Ubicación: `frontend/src/shared/components/`
- Props: `open`, `onOpenChange`, `title`, `message`, `onConfirm`, `onCancel`

---

## Troubleshooting

### Errores de Prisma

#### Error: "Type does not exist"

**Causa:** Prisma Client no generado o desactualizado

**Solución:**
```bash
cd backend
npx prisma generate
# Reiniciar servidor dev
```

#### Error: Cambios en BD no reflejados

**Causa:** Schema de Prisma no sincronizado

**Solución:**
```bash
cd backend
npx prisma db pull      # Sincronizar desde PostgreSQL
npx prisma generate     # Regenerar client
# Reiniciar servidor dev
```

#### Error: Error de conexión a BD

**Causa:** `DATABASE_URL` incorrecta en `.env`

**Solución:**
1. Verificar `backend/.env`
2. Comprobar formato: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
3. Probar conexión con psql o Prisma Studio

### Errores de Autenticación

#### Error: 401 Unauthorized

**Causa:** Sesión expirada o no establecida

**Solución:**
- Hacer logout y login nuevamente
- Verificar que cookie `connect.sid` esté presente en navegador
- Comprobar que `SESSION_SECRET` esté configurado en backend

#### Error: CORS errors

**Causa:** Configuración CORS incorrecta

**Solución:**
1. Verificar `FRONTEND_URL` en `backend/.env`
2. Verificar `VITE_API_URL` en `frontend/.env`
3. Comprobar que `credentials: true` esté en config CORS (backend)
4. Comprobar que `withCredentials: true` esté en axios (frontend)

#### Error: Cookies no se envían

**Causa:** `withCredentials` no configurado

**Solución:**
- Verificar `core/api/axios.ts` tenga `withCredentials: true`
- Verificar CORS permite credenciales

### Problemas de Base de Datos

#### Error: Productos duplicados

**Solución:** Ejecutar script de limpieza
```bash
"/c/Program Files/PostgreSQL/18/bin/psql.exe" \
  "postgresql://USER:PASS@HOST:PORT/DB" \
  -f database/scripts/02-limpiar-duplicados.sql
```

#### Error: Precios incorrectos (jerarquía)

**Solución:** Validar integridad
```bash
"/c/Program Files/PostgreSQL/18/bin/psql.exe" \
  "postgresql://USER:PASS@HOST:PORT/DB" \
  -f database/scripts/03-validar-integridad.sql
```

#### Error: Performance lenta en precios

**Solución:** Verificar índice existe
```sql
SELECT * FROM pg_indexes WHERE indexname = 'ix_precios_producto_fecha';
```

Si no existe:
```sql
CREATE INDEX ix_precios_producto_fecha
ON precios (producto_id, ultima_modificacion DESC);
```

### Problemas de Desarrollo

#### Error: Puerto en uso

**Puertos usados:**
- Backend: 3000
- Frontend: 5173
- Prisma Studio: 5555

**Solución:** Verificar que estén libres
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

#### Error: TypeScript errors después de cambios en BD

**Solución:** Reiniciar TypeScript server
- VSCode: `Ctrl/Cmd+Shift+P` → "TypeScript: Restart TS Server"
- O reiniciar VSCode completamente

#### Error: node_modules desactualizados

**Solución:**
```bash
# Desde raíz
npm run install:all

# O individualmente
cd backend && npm install
cd ../frontend && npm install
```

---

## Escalabilidad

### Agregar Nuevo Módulo

#### 1. Backend

```bash
# Crear estructura
cd backend/src/modules
mkdir nuevo
cd nuevo
touch nuevo.module.ts nuevo.controller.ts nuevo.service.ts
mkdir dto
touch dto/create-nuevo.dto.ts dto/update-nuevo.dto.ts
```

**Implementar archivos siguiendo patrones establecidos**

**Registrar en `app.module.ts`:**
```typescript
import { NuevoModule } from './modules/nuevo/nuevo.module';

@Module({
  imports: [
    // ...
    NuevoModule,
  ],
})
export class AppModule {}
```

#### 2. Frontend

```bash
# Crear estructura
cd frontend/src/modules
mkdir nuevo
cd nuevo
mkdir pages components hooks api
touch api/nuevoService.ts api/types.ts
touch hooks/useNuevo.ts
```

**Implementar servicios, hooks, componentes**

**Agregar rutas en `App.tsx`:**
```typescript
<Route path="/nuevo" element={<ProtectedRoute><ListaNuevoPage /></ProtectedRoute>} />
<Route path="/nuevo/nuevo" element={<ProtectedRoute><NuevoNuevoPage /></ProtectedRoute>} />
```

#### 3. Base de Datos

**Si requiere nuevas tablas:**
1. Crear tablas en PostgreSQL (Supabase)
2. `cd backend && npx prisma db pull`
3. `npx prisma generate`
4. Reiniciar servidor

---

## Referencias

- **[CLAUDE.md](CLAUDE.md)** - Guía para desarrollo con Claude Code
- **[README.md](README.md)** - Instalación y uso básico
- **[ROADMAP.md](ROADMAP.md)** - Fases y progreso del proyecto
- **[NestJS Docs](https://docs.nestjs.com)**
- **[Prisma Docs](https://www.prisma.io/docs)**
- **[React Query Docs](https://tanstack.com/query/latest)**
- **[shadcn/ui Docs](https://ui.shadcn.com)**
