# AI Coding Instructions - ERP Los Hermanos

## Project Overview

Monorepo ERP system for mid-sized businesses using NestJS (backend) + React 18 (frontend) + Prisma + PostgreSQL (Supabase). 65% complete, active development on Ventas/Productos modules.

**Architecture:** Database-first approach with modular design. Backend and frontend in separate folders with shared conventions.

## Critical: Database-First Workflow

**NEVER use `prisma migrate`.** All schema changes happen in PostgreSQL first:

1. Modify schema directly in PostgreSQL (Supabase dashboard or psql)
2. Run `cd backend && npx prisma db pull` to sync
3. Run `npx prisma generate` to update Prisma Client
4. Restart dev server if running

Schema changes without this workflow will be rejected. See [ARQUITECTURA.md](../ARQUITECTURA.md#workflow-con-prisma) for details.

## Essential Commands

```bash
# Development (from root)
npm run dev              # Starts backend:3000 + frontend:5173 concurrently

# Backend only (from backend/)
npm run start:dev        # NestJS watch mode
npx prisma studio        # Database GUI (port 5555)
npm run test             # Jest unit tests
npm run test:cov         # Coverage report

# Frontend only (from frontend/)
npm run dev              # Vite dev server
npm run build            # Production build

# Database operations (Windows)
"/c/Program Files/PostgreSQL/18/bin/psql.exe" "postgresql://USER:PASS@HOST:PORT/DB" -f database/scripts/script.sql
```

## Module Pattern (NestJS Backend)

All modules follow this strict structure:

```
backend/src/modules/[modulo]/
├── [modulo].module.ts       # NestJS module (imports, providers)
├── [modulo].controller.ts   # HTTP routing ONLY - no business logic
├── [modulo].service.ts      # All business logic, Prisma queries, validation
├── dto/
│   ├── create-[modulo].dto.ts
│   └── update-[modulo].dto.ts
└── events/                  # Optional: domain events with @nestjs/event-emitter
```

**Controller Example (ventas.controller.ts):**
- Use `@UseGuards(AuthenticatedGuard)` for protected routes
- Extract user with `@GetUser()` decorator
- Delegate ALL logic to service layer
- Return service responses directly

**Service Example (ventas.service.ts):**
- Inject `PrismaService` via constructor
- Perform all validation before Prisma operations
- Use transactions for multi-step operations: `this.prisma.$transaction([...])`
- Throw appropriate NestJS exceptions: `NotFoundException`, `BadRequestException`

## Module Pattern (React Frontend)

```
frontend/src/modules/[modulo]/
├── pages/                   # Route components
├── components/             # Module-specific UI components
├── hooks/                  # React Query hooks (use[Modulo].ts)
└── api/
    ├── [modulo]Service.ts  # Axios calls to backend
    └── types.ts            # TypeScript interfaces
```

**API Service Pattern:**
```typescript
// modules/ventas/api/ventasService.ts
import { apiClient } from '@/core/api/axios';

export const ventasService = {
  async create(data: CreateVentaDto): Promise<Venta> {
    const response = await apiClient.post<Venta>('/ventas', data);
    return response.data;
  },
};
```

**React Query Hook Pattern:**
```typescript
// modules/ventas/hooks/useVentas.ts
export const useCrearVenta = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ventasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear venta');
    },
  });
};
```

## Authentication & Session Management

- **Backend:** `express-session` with PostgreSQL session store (NO JWT)
- **Frontend:** `axios` with `withCredentials: true` sends cookies automatically
- **Protected routes:** Use `@UseGuards(AuthenticatedGuard)` on controllers
- **User extraction:** `@GetUser()` decorator provides current user
- **401 handling:** Axios interceptor redirects to `/login` globally

Session config in [main.ts](../backend/src/main.ts). Never implement JWT-based auth.

## Data Flow & State Management

**Frontend State:**
- **Server state:** React Query (`@tanstack/react-query`) - cache, invalidation, refetch
- **Global UI state:** Zustand (minimal - only auth state in `useAuthStore`)
- **Form state:** Component-local or React Hook Form for complex forms

**Backend → Frontend Flow:**
1. User action → Hook calls mutation/query
2. Axios sends request with session cookie
3. Controller validates session + DTO
4. Service executes business logic + Prisma queries
5. Response returns through chain
6. React Query updates cache + triggers re-render
7. Toast notification via `sonner`

## Critical Business Rules

**Price Hierarchy (productos):**
- Supermayorista ≤ Mayorista ≤ Minorista (enforced by `chk_jerarquia_precios` constraint)
- All price changes logged to `precios` table with `ultima_modificacion` timestamp
- Index `ix_precios_producto_fecha` optimizes price history queries

**Sales Logic (ventas):**
- Validate stock before sale: `if (stock_actual < cantidad) throw BadRequestException`
- Cliente's `tipo` determines available `tipo_venta` (locked in UI)
- Transactions ensure atomicity: deduct stock + create sale + create details
- See [ventas.service.ts](../backend/src/modules/ventas/ventas.service.ts) for pricing logic

**Search without Accents:**
- Use `unaccent()` PostgreSQL extension for all text searches
- Example: `WHERE unaccent(nombre) ILIKE unaccent('%cafe%')` matches "Café", "cafe"

## TypeScript & Validation

**Backend DTOs:**
- Use `class-validator` decorators: `@IsString()`, `@IsNotEmpty()`, `@Min()`, etc.
- ValidationPipe configured globally with `whitelist: true`, `forbidNonWhitelisted: true`
- UpdateDTOs extend `PartialType(CreateDto)` from `@nestjs/mapped-types`

**BigInt Serialization:**
- PostgreSQL `BIGINT` becomes Prisma `BigInt` type
- Serialized to string via `BigInt.prototype.toJSON` in [main.ts](../backend/src/main.ts)
- Frontend receives IDs as strings: `"123456"` not `123456n`

## UI/UX Patterns

**shadcn/ui Components:** Use existing from `frontend/src/shared/components/ui/`

**Toast Notifications:** Import from `sonner`: `toast.success()`, `toast.error()`

**Modals:** Reusable `ConfirmacionModal` in `shared/components/` for confirmations

**Tables:** Include search, filters, pagination. Export to PDF (jsPDF) and Excel (xlsx)

## Testing

**Backend Tests (Jest):**
- Unit tests in `backend/test/unit/`
- Integration tests in `backend/test/integration/`
- Mock Prisma with `jest.fn()` patterns
- Example: [ventas.service.spec.ts](../backend/test/unit/ventas.service.spec.ts)

**Run tests:** `cd backend && npm run test` or `npm run test:cov` for coverage

## Modules NOT to Modify

**Stable - avoid changes without consultation:**
- `backend/src/modules/auth/` - Authentication system (100%)
- `backend/src/modules/ventas/` - Sales module (100%)
- `frontend/src/modules/auth/` - Auth UI (100%)
- `frontend/src/modules/ventas/` - Sales UI (100%)

**In Progress - safe to modify:**
- `backend/src/modules/productos/` - Products backend (70%)
- `backend/src/modules/clientes/` - Clients backend (50%)
- `frontend/src/modules/productos/` - Products UI (70%)
- `frontend/src/modules/clientes/` - Clients UI (needs implementation)

## Documentation References

- **[ARQUITECTURA.md](../ARQUITECTURA.md):** Complete technical stack, patterns, troubleshooting
- **[ROADMAP.md](../ROADMAP.md):** Feature progress, pending tasks
- **[CLAUDE.md](../CLAUDE.md):** Quick reference for active development
- **[database/scripts/GUIA-SISTEMA-PRECIOS.md](../database/scripts/GUIA-SISTEMA-PRECIOS.md):** Price management system guide

## Common Pitfalls

1. **Don't create Prisma migrations** - database-first only
2. **Don't put business logic in controllers** - use services
3. **Don't forget `withCredentials: true`** in axios calls
4. **Don't skip React Query invalidation** after mutations
5. **Always validate price hierarchy** before updating prices
6. **Run `npx prisma generate`** after schema changes or TypeScript will break
