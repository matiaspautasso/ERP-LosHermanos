# ERP Los Hermanos

Sistema de Planificacion de Recursos Empresariales (ERP) modular y escalable para la gestion integral de negocios.

## Descripcion

ERP Los Hermanos es un sistema completo de gestion empresarial que incluye modulos para:

- **Autenticacion y Usuarios**: Sistema completo de registro, login, recuperacion de contrasena y verificacion por email
- **Clientes**: Gestion de clientes y relaciones (En desarrollo)
- **Productos**: Catalogo de productos e inventario (En desarrollo)
- **Ventas**: Gestion de ventas y facturacion (En desarrollo)
- **Compras**: Gestion de compras y proveedores (En desarrollo)
- **Reportes**: Analisis y reportes del negocio (En desarrollo)

## Tecnologias

### Backend
- **NestJS**: Framework progresivo de Node.js
- **Prisma**: ORM para TypeScript y Node.js
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticacion basada en tokens
- **Nodemailer**: Servicio de envio de emails
- **Event Emitter**: Sistema de eventos para arquitectura desacoplada

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estatico
- **Vite**: Build tool rapido
- **React Router DOM**: Enrutamiento
- **Zustand**: Estado global
- **TailwindCSS**: Framework de estilos
- **shadcn/ui**: Componentes UI accesibles
- **Axios**: Cliente HTTP

## Estructura del Proyecto

```
ERP-LosHermanos/
├── backend/          # API NestJS
├── frontend/         # Aplicacion React
├── database/         # Scripts y migraciones de BD
├── docs/             # Documentacion del proyecto
│   ├── modulos/      # Documentacion por modulo
│   └── guias/        # Guias de desarrollo
└── infraestructura/  # Configuracion de infraestructura
```

## Estado del Proyecto

### Modulos Completados
- **Autenticacion** (100%)
  - Registro de usuarios
  - Login con JWT
  - Recuperacion de contrasena
  - Verificacion por email
  - Sistema de sesiones

### Modulos En Desarrollo
- Clientes (0%)
- Productos (0%)
- Ventas (0%)
- Compras (0%)
- Reportes (0%)

Ver [ROADMAP.md](./ROADMAP.md) para mas detalles del progreso.

## Instalacion

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurar variables de entorno en .env
npm run dev
```

## Configuracion

### Variables de Entorno - Backend

```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
JWT_SECRET="tu-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"
FRONTEND_URL="http://localhost:5173"
```

### Variables de Entorno - Frontend

```env
VITE_API_URL="http://localhost:3000"
```

## Uso

1. Iniciar el backend: `cd backend && npm run start:dev`
2. Iniciar el frontend: `cd frontend && npm run dev`
3. Abrir navegador en `http://localhost:5173`

## Arquitectura

Este proyecto sigue una arquitectura modular escalable:

- **Backend**: Arquitectura por modulos con NestJS
- **Frontend**: Arquitectura por features/modulos
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Comunicacion**: API REST con autenticacion JWT

Ver [ARQUITECTURA.md](./ARQUITECTURA.md) para mas detalles.

## Documentacion

La documentacion completa esta organizada en la carpeta `docs/`:

- [Modulo de Autenticacion](./docs/modulos/01-autenticacion/README.md)
- [Guia de Desarrollo](./docs/guias/desarrollo.md)
- [Guia de Deployment](./docs/guias/deployment.md)

## Contribuir

Ver [docs/guias/contributing.md](./docs/guias/contributing.md)

## Licencia

Este proyecto es privado y confidencial.

## Autor

Matias - ERP Los Hermanos

---

**Version**: 0.1.0
**Ultima Actualizacion**: 2025-12-03
