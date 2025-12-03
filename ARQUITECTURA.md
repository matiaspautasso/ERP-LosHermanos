# ARQUITECTURA - ERP Los Hermanos

> Documentacion de la arquitectura general del sistema

**Version**: 1.0
**Fecha**: 2025-12-03

---

## Introduccion

ERP Los Hermanos esta construido con una **arquitectura modular escalable** que separa el backend y frontend en monorepos independientes, organizados por modulos de negocio.

## Principios de Diseno

### 1. Modularidad
- Cada modulo de negocio es independiente
- Codigo compartido centralizado
- Facil agregar nuevos modulos

### 2. Separacion de Responsabilidades
- Backend: Logica de negocio y acceso a datos
- Frontend: Presentacion e interaccion con el usuario
- Base de Datos: Persistencia de datos

### 3. Escalabilidad
- Arquitectura preparada para crecimiento
- Codigo reutilizable
- Testing por modulo

### 4. Mantenibilidad
- Codigo organizado y documentado
- Patrones consistentes
- Facil de entender y modificar

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Modulos de Negocio                               │  │
│  │  ├── auth/     (Autenticacion)                    │  │
│  │  ├── clientes/ (Gestion de Clientes)             │  │
│  │  ├── productos/(Catalogo de Productos)           │  │
│  │  └── ...                                          │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Shared (Componentes Reutilizables)               │  │
│  │  ├── components/ (UI components)                  │  │
│  │  └── layouts/    (Layouts)                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Core (Servicios Centrales)                       │  │
│  │  ├── store/  (Estado global - Zustand)            │  │
│  │  ├── api/    (Cliente HTTP - Axios)               │  │
│  │  └── config/ (Configuracion)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │ (JSON)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (NestJS + Prisma)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Modulos de Negocio                               │  │
│  │  ├── auth/        (Autenticacion + JWT)          │  │
│  │  ├── email/       (Servicio de Emails)           │  │
│  │  ├── clientes/    (API de Clientes)              │  │
│  │  ├── productos/   (API de Productos)             │  │
│  │  └── ...                                          │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Shared (Codigo Compartido)                       │  │
│  │  ├── decorators/    (Custom decorators)           │  │
│  │  ├── guards/        (Auth guards)                 │  │
│  │  ├── interceptors/  (HTTP interceptors)           │  │
│  │  └── utils/         (Utilidades)                  │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Core (Servicios Fundamentales)                   │  │
│  │  └── prisma/    (ORM y BD)                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Config (Configuracion Global)                     │  │
│  │  ├── database.config                              │  │
│  │  ├── jwt.config                                   │  │
│  │  └── email.config                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS (PostgreSQL)                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tablas:                                          │  │
│  │  ├── users         (Usuarios del sistema)         │  │
│  │  ├── clientes      (Clientes)                     │  │
│  │  ├── productos     (Productos)                    │  │
│  │  ├── ventas        (Ventas)                       │  │
│  │  ├── compras       (Compras)                      │  │
│  │  └── ...                                          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Backend - Arquitectura Detallada

### Tecnologias
- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Autenticacion**: JWT (JSON Web Tokens)
- **Validacion**: class-validator + class-transformer
- **Eventos**: EventEmitter2

### Estructura de Carpetas

```
backend/src/
├── modules/              # Modulos de negocio
│   ├── auth/             # Autenticacion
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── events/       # Eventos del modulo
│   │   ├── listeners/    # Escuchadores de eventos
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── email/            # Servicio de emails
│   └── .../              # Otros modulos
│
├── shared/               # Codigo compartido
│   ├── decorators/       # Decorators personalizados
│   ├── guards/           # Guards de autorizacion
│   ├── interceptors/     # Interceptors HTTP
│   └── utils/            # Funciones utilitarias
│
├── core/                 # Servicios fundamentales
│   └── prisma/           # Servicio de Prisma
│
├── config/               # Configuracion
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── email.config.ts
│
├── app.module.ts         # Modulo raiz
└── main.ts               # Punto de entrada
```

### Patrones de Diseno

#### 1. Modulos
Cada funcionalidad esta encapsulada en un modulo de NestJS:

```typescript
@Module({
  imports: [OtrosModulos],
  controllers: [MiController],
  providers: [MiService],
  exports: [MiService] // Exportar para uso en otros modulos
})
export class MiModule {}
```

#### 2. DTOs (Data Transfer Objects)
Validacion de datos de entrada:

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

#### 3. Sistema de Eventos
Desacoplamiento mediante eventos:

```typescript
// Emitir evento
this.eventEmitter.emit('user.registered', new UserRegisteredEvent(user));

// Escuchar evento
@OnEvent('user.registered')
handleUserRegistered(event: UserRegisteredEvent) {
  // Enviar email de bienvenida
}
```

#### 4. Guards
Proteccion de rutas:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@GetUser() user: User) {
  return user;
}
```

---

## Frontend - Arquitectura Detallada

### Tecnologias
- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Build Tool**: Vite
- **Router**: React Router DOM v6
- **Estado Global**: Zustand
- **HTTP Client**: Axios
- **Estilos**: TailwindCSS
- **Componentes UI**: shadcn/ui

### Estructura de Carpetas

```
frontend/src/
├── modules/              # Modulos de negocio
│   ├── auth/             # Modulo de autenticacion
│   │   ├── pages/        # Paginas (LoginPage, RegisterPage)
│   │   ├── hooks/        # Hooks personalizados (useAuth)
│   │   └── api/          # Servicios de API (authService)
│   ├── clientes/         # Modulo de clientes
│   └── .../              # Otros modulos
│
├── shared/               # Codigo compartido
│   ├── components/       # Componentes reutilizables
│   │   └── ui/           # Componentes shadcn/ui
│   ├── layouts/          # Layouts
│   └── utils/            # Funciones utilitarias
│
├── core/                 # Servicios centrales
│   ├── store/            # Estado global (Zustand)
│   ├── api/              # Cliente HTTP (Axios)
│   └── config/           # Configuracion
│
├── assets/               # Assets estaticos
├── App.tsx               # Componente raiz
└── main.tsx              # Punto de entrada
```

### Patrones de Diseno

#### 1. Custom Hooks
Encapsulacion de logica:

```typescript
export const useAuth = () => {
  const { user, login, logout } = useAuthStore();

  const handleLogin = async (credentials) => {
    const response = await authService.login(credentials);
    login(response.user, response.token);
  };

  return { user, handleLogin, logout };
};
```

#### 2. Zustand Store
Estado global simple y performante:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

#### 3. Axios Interceptors
Manejo centralizado de HTTP:

```typescript
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 4. Componentes de Presentacion
Componentes reutilizables y accesibles:

```typescript
export const Button = ({ children, variant, ...props }) => {
  return (
    <button className={cn(buttonVariants({ variant }))} {...props}>
      {children}
    </button>
  );
};
```

---

## Flujo de Datos

### Autenticacion

```
1. Usuario ingresa credenciales
   ↓
2. Frontend: authService.login(credentials)
   ↓
3. Backend: AuthController recibe request
   ↓
4. Backend: AuthService valida credenciales
   ↓
5. Backend: Genera JWT token
   ↓
6. Backend: Retorna { user, token }
   ↓
7. Frontend: Guarda en Zustand store
   ↓
8. Frontend: Guarda token en localStorage
   ↓
9. Frontend: Redirige a dashboard
```

### Comunicacion con API

```
Frontend                    Backend                   Database
   │                          │                          │
   ├──HTTP Request────────────>                          │
   │  (GET/POST/PUT/DELETE)   │                          │
   │                          │                          │
   │                          ├──Prisma Query───────────>
   │                          │                          │
   │                          <─────Data─────────────────┤
   │                          │                          │
   <────HTTP Response─────────┤                          │
   │  (JSON)                  │                          │
```

---

## Seguridad

### Backend
- **Autenticacion**: JWT tokens con expiracion
- **Autorizacion**: Guards de NestJS
- **Validacion**: DTOs con class-validator
- **CORS**: Configurado para frontend
- **Rate Limiting**: Proteccion contra ataques
- **Sanitizacion**: Prisma previene SQL injection

### Frontend
- **Token Storage**: localStorage (considerar httpOnly cookies)
- **HTTPS**: En produccion
- **Input Validation**: Validacion en formularios
- **XSS Protection**: React escapa automaticamente

---

## Performance

### Backend
- **Caching**: Redis para sesiones (futuro)
- **Database Indexes**: En campos frecuentes
- **Pagination**: En listados grandes
- **Lazy Loading**: Relaciones bajo demanda

### Frontend
- **Code Splitting**: Por modulos
- **Lazy Loading**: Rutas y componentes
- **Memoization**: React.memo y useMemo
- **Image Optimization**: Vite optimiza assets

---

## Testing

### Backend
```
backend/
└── src/
    └── modules/
        └── auth/
            ├── auth.service.spec.ts      # Unit tests
            └── auth.controller.spec.ts   # Integration tests
```

### Frontend
```
frontend/
└── src/
    └── modules/
        └── auth/
            ├── __tests__/
            │   ├── LoginPage.test.tsx
            │   └── useAuth.test.ts
            └── ...
```

---

## Deployment

### Backend
- **Plataforma**: Railway / Render / DigitalOcean
- **Base de Datos**: PostgreSQL managed
- **Variables de Entorno**: .env en plataforma
- **Build**: `npm run build` genera dist/

### Frontend
- **Plataforma**: Vercel / Netlify
- **Build**: `npm run build` genera dist/
- **Variables de Entorno**: VITE_* en plataforma
- **CDN**: Assets servidos via CDN

---

## Proximas Mejoras

### Corto Plazo
- [ ] Implementar refresh tokens
- [ ] Agregar rate limiting
- [ ] Mejorar manejo de errores
- [ ] Tests unitarios e2e

### Mediano Plazo
- [ ] Implementar caching con Redis
- [ ] Agregar logging centralizado
- [ ] Monitoring y alertas
- [ ] CI/CD pipelines

### Largo Plazo
- [ ] Microservicios (si escala)
- [ ] GraphQL (opcional)
- [ ] Mobile app (React Native)
- [ ] Multi-tenancy

---

**Mantenido por**: Matias
**Ultima Revision**: 2025-12-03
