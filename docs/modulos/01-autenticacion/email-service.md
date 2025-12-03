# 📧 Documentación del Servicio de Emails - ERP Los Hermanos

> **Última actualización:** 2025-12-03
> **Módulo:** Email Service para Recuperación de Contraseñas
> **Estado:** ✅ Funcionando en Desarrollo

---

## 📋 Índice

1. [Información General](#información-general)
2. [Configuración Actual](#configuración-actual)
3. [Arquitectura del Servicio](#arquitectura-del-servicio)
4. [Flujo de Recuperación de Contraseña](#flujo-de-recuperación-de-contraseña)
5. [Configuración Técnica](#configuración-técnica)
6. [Variables de Entorno](#variables-de-entorno)
7. [Cómo Configurar para Otro Email](#cómo-configurar-para-otro-email)
8. [Template del Email](#template-del-email)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Información General

### ¿Qué hace el Email Service?

El **Email Service** es un módulo de NestJS que se encarga de enviar emails automáticos cuando un usuario solicita recuperar su contraseña.

### ¿Cuándo se envía un email?

Se envía automáticamente cuando:
1. Un usuario ingresa su email en `/recover`
2. El backend genera una contraseña temporal
3. Se dispara el evento `user.password-recovery-requested`
4. El listener captura el evento y envía el email

---

## ⚙️ Configuración Actual

### Proveedor SMTP: **Gmail**

| Parámetro | Valor |
|-----------|-------|
| **Host SMTP** | `smtp.gmail.com` |
| **Puerto** | `587` (STARTTLS) |
| **Seguridad** | TLS/STARTTLS |
| **Email Remitente** | `matiaspautasso2@gmail.com` |
| **Nombre del Remitente** | `ERP Los Hermanos` |
| **Método de Autenticación** | App Password (Contraseña de Aplicación) |

### Credenciales de Gmail

- **Email:** `matiaspautasso2@gmail.com`
- **Autenticación:** Contraseña de aplicación de Google
- **Nombre de la App Password:** `adminAPI`
- **Contraseña generada:** `rutfdgyeeigj mxeu` (configurada en `.env`)

---

## 🏗️ Arquitectura del Servicio

### Estructura de Archivos

```
backend/src/modules/
├── email/
│   ├── email.module.ts          # Módulo de Email
│   └── email.service.ts         # Servicio que envía emails
│
└── auth/
    ├── auth.service.ts          # Genera contraseña temporal y emite evento
    ├── listeners/
    │   ├── index.ts
    │   └── password-recovery.listener.ts  # Escucha evento y envía email
    └── events/
        └── password-recovery-requested.event.ts  # Evento de dominio
```

### Componentes Clave

#### 1. **EmailService** (`email.service.ts`)
- **Responsabilidad:** Enviar emails usando Nodemailer
- **Método principal:** `sendPasswordRecoveryEmail(to, username, temporaryPassword)`
- **Inicialización:** Se conecta automáticamente con Gmail SMTP al iniciar el backend
- **Template:** Genera HTML con logo y formato profesional

#### 2. **PasswordRecoveryListener** (`password-recovery.listener.ts`)
- **Responsabilidad:** Escuchar eventos de recuperación de contraseña
- **Evento escuchado:** `user.password-recovery-requested`
- **Acción:** Obtiene el username de la BD y llama a EmailService

#### 3. **AuthService** (`auth.service.ts`)
- **Responsabilidad:** Gestionar la lógica de recuperación
- **Acción:** Genera contraseña temporal, actualiza BD, emite evento

---

## 🔄 Flujo de Recuperación de Contraseña

### Paso a Paso

```
1. Usuario ingresa email en /recover
                ↓
2. Frontend llama a POST /api/auth/recover
                ↓
3. AuthService verifica que el usuario existe
                ↓
4. AuthService genera contraseña temporal aleatoria (10 caracteres)
                ↓
5. AuthService actualiza la contraseña en la base de datos (hash bcrypt)
                ↓
6. AuthService emite evento: 'user.password-recovery-requested'
                ↓
7. PasswordRecoveryListener captura el evento
                ↓
8. Listener obtiene el username real desde la BD usando userId
                ↓
9. Listener llama a EmailService.sendPasswordRecoveryEmail()
                ↓
10. EmailService genera HTML del email con template
                ↓
11. Nodemailer envía el email a través de Gmail SMTP
                ↓
12. Usuario recibe email con contraseña temporal
                ↓
13. Usuario puede hacer login con la nueva contraseña
```

### Diagrama de Secuencia

```
Usuario          Frontend         Backend(Auth)      EventEmitter      Listener         EmailService      Gmail SMTP
  |                 |                   |                  |                |                  |               |
  |-- Ingresa email →                   |                  |                |                  |               |
  |                 |-- POST /recover →|                  |                |                  |               |
  |                 |                   |-- Genera pwd →  |                |                  |               |
  |                 |                   |-- Emite evento →|                |                  |               |
  |                 |                   |                  |-- Notifica →  |                  |               |
  |                 |                   |                  |                |-- Obtiene user →|               |
  |                 |                   |                  |                |-- Envía email →|               |
  |                 |                   |                  |                |                  |-- SMTP →     |
  |                 |                   |                  |                |                  |               |
  |←--------------- Email recibido ←------------------------------------------------------------←-------------|
```

---

## 🔧 Configuración Técnica

### Dependencias NPM

```json
{
  "dependencies": {
    "nodemailer": "^6.x.x"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.x.x"
  }
}
```

### Inicialización del Transporter (Nodemailer)

```typescript
// backend/src/modules/email/email.service.ts

private initializeTransporter() {
  this.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para puerto 465, false para otros
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}
```

### Configuración del Email

```typescript
await this.transporter.sendMail({
  from: '"ERP Los Hermanos" <matiaspautasso2@gmail.com>',
  to: 'usuario@example.com',
  subject: 'Recuperación de Contraseña - ERP Los Hermanos',
  html: '<!-- Template HTML -->'
});
```

---

## 📝 Variables de Entorno

### Archivo: `backend/.env`

```env
# Email (para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=matiaspautasso2@gmail.com
EMAIL_PASSWORD=rutfdgyeeigj mxeu
```

### Archivo: `backend/.env.example`

```env
# Email (para recuperación de contraseña)
# Para Gmail: Configurar autenticación de 2 factores y generar contraseña de aplicación
# Guía: https://support.google.com/accounts/answer/185833
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

---

## 🔐 Cómo Configurar para Otro Email

### Opción 1: Usar Otro Email de Gmail

1. **Habilitar autenticación de 2 factores:**
   - Ve a: https://myaccount.google.com/security
   - Habilita "Verificación en dos pasos"

2. **Generar contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona: "Correo" y "Windows"
   - Haz clic en "Generar"
   - Copia la contraseña de 16 dígitos

3. **Actualizar `.env`:**
   ```env
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

4. **Reiniciar backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

### Opción 2: Usar SendGrid (Recomendado para Producción)

1. **Crear cuenta en SendGrid:**
   - https://sendgrid.com/

2. **Obtener API Key:**
   - Dashboard → Settings → API Keys → Create API Key

3. **Modificar `email.service.ts`:**
   ```typescript
   // Usar SendGrid en lugar de Gmail
   import * as sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   await sgMail.send({
     to: email,
     from: 'noreply@erploshermanos.com',
     subject: 'Recuperación de Contraseña',
     html: template
   });
   ```

4. **Actualizar `.env`:**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxx
   ```

### Opción 3: Usar Otro Proveedor SMTP

Proveedores compatibles:
- **AWS SES** (Amazon Simple Email Service)
- **Mailgun**
- **Postmark**
- **Office365/Outlook**

**Ejemplo con Outlook:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu-email@outlook.com
EMAIL_PASSWORD=tu-contraseña
```

---

## 📧 Template del Email

### Características del Template HTML

- **Responsive:** Se adapta a móviles y desktop
- **Profesional:** Incluye logo y colores de la marca (#2c5b2d)
- **Seguro:** Contraseña en formato monospace destacado
- **Informativo:** Advertencia de contraseña temporal
- **Botón CTA:** Link directo al login

### Vista del Email

```
┌─────────────────────────────────────────────┐
│          ERP Los Hermanos                    │
│      Recuperación de Contraseña              │
├─────────────────────────────────────────────┤
│                                              │
│  Hola, testuser                              │
│                                              │
│  Hemos recibido una solicitud para           │
│  recuperar tu contraseña.                    │
│                                              │
│  Tu nueva contraseña temporal es:            │
│                                              │
│  ┌─────────────────────────────┐            │
│  │      C3PjMbuQyy              │            │
│  └─────────────────────────────┘            │
│                                              │
│  ⚠️ Importante: Esta es una contraseña      │
│  temporal. Te recomendamos cambiarla         │
│  después de iniciar sesión.                  │
│                                              │
│  [ Iniciar Sesión ]                          │
│                                              │
│  Si no solicitaste esta recuperación,        │
│  ignora este mensaje.                        │
│                                              │
├─────────────────────────────────────────────┤
│  © 2025 ERP Los Hermanos.                    │
│  Este es un correo automático.               │
└─────────────────────────────────────────────┘
```

### Personalización del Template

**Ubicación:** `backend/src/modules/email/email.service.ts:73-180`

Puedes personalizar:
- Colores (línea 93-107)
- Logo (línea 115)
- Texto del mensaje (línea 118-159)
- Footer (línea 161-165)

---

## 🐛 Troubleshooting

### Error: "Transporter no inicializado"

**Causa:** Variables `EMAIL_USER` o `EMAIL_PASSWORD` no configuradas en `.env`

**Solución:**
```bash
# Verificar que existan las variables
cat backend/.env | grep EMAIL

# Deben estar presentes:
# EMAIL_USER=matiaspautasso2@gmail.com
# EMAIL_PASSWORD=rutfdgyeeigj mxeu
```

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa:** Contraseña incorrecta o autenticación de 2 factores no configurada

**Soluciones:**
1. Verificar que la contraseña de aplicación sea correcta
2. Generar nueva contraseña de aplicación en Google
3. Verificar que la autenticación de 2 factores esté habilitada

### Error: "Connection timeout"

**Causa:** Puerto bloqueado o firewall

**Soluciones:**
1. Verificar que el puerto 587 esté abierto
2. Probar con puerto 465 (cambiar `secure: true`)
3. Verificar firewall/antivirus

### Email no llega al destinatario

**Posibles causas:**
1. **Spam:** Revisar carpeta de spam
2. **Email inválido:** Verificar que el email exista
3. **Límites de Gmail:** Gmail tiene límite de 500 emails/día

**Verificación en logs:**
```bash
# Buscar en logs del backend:
[EmailService] Email de recuperación enviado a test@example.com. MessageId: <...>
```

Si aparece el MessageId, el email se envió correctamente desde el servidor.

### Error: "ECONNREFUSED"

**Causa:** No hay conexión a Gmail SMTP

**Soluciones:**
1. Verificar conexión a internet
2. Verificar que `smtp.gmail.com` sea accesible
3. Probar ping: `ping smtp.gmail.com`

---

## 📊 Logs y Monitoreo

### Logs del EmailService

El servicio registra los siguientes eventos:

```
[EmailService] Email service inicializado con cuenta: matiaspautasso2@gmail.com
[PasswordRecoveryListener] Procesando recuperación de contraseña para: usuario@example.com
[EmailService] Email de recuperación enviado a usuario@example.com. MessageId: <id>
[PasswordRecoveryListener] Email de recuperación enviado exitosamente a: usuario@example.com
```

### Verificar que el servicio funciona

```bash
# Verificar logs en tiempo real
cd backend
npm run start:dev

# Buscar línea de inicialización:
# [EmailService] Email service inicializado con cuenta: matiaspautasso2@gmail.com
```

### Probar conexión SMTP manualmente

Puedes agregar un endpoint de testing:

```typescript
// En email.service.ts
async verifyConnection(): Promise<boolean> {
  try {
    await this.transporter.verify();
    this.logger.log('Conexión SMTP verificada exitosamente');
    return true;
  } catch (error) {
    this.logger.error('Error al verificar conexión SMTP:', error);
    return false;
  }
}
```

---

## 🚀 Mejoras Futuras

### Para Producción

1. **Usar SendGrid o AWS SES** en lugar de Gmail
2. **Plantillas HTML externas** con Handlebars/Pug
3. **Cola de emails** con Bull/BullMQ para mejor performance
4. **Reintentos automáticos** en caso de fallo
5. **Tracking de emails** (abiertos, clicks)
6. **Diferentes tipos de emails:**
   - Bienvenida
   - Verificación de email
   - Notificaciones
   - Reportes

### Seguridad

1. **Rate limiting** para evitar spam
2. **Tokens de recuperación** con expiración (en lugar de contraseña temporal)
3. **Logs de auditoría** de emails enviados
4. **Encriptación** de credenciales en .env

---

## 📚 Referencias

- **Nodemailer:** https://nodemailer.com/
- **Gmail SMTP:** https://support.google.com/mail/answer/7126229
- **App Passwords Google:** https://support.google.com/accounts/answer/185833
- **NestJS Events:** https://docs.nestjs.com/techniques/events

---

## ✅ Checklist de Configuración

- [x] Nodemailer instalado
- [x] Variables de entorno configuradas
- [x] EmailService creado
- [x] Event Listener implementado
- [x] Template HTML diseñado
- [x] Integración con AuthModule
- [x] Pruebas exitosas con Gmail
- [ ] Migrar a SendGrid para producción
- [ ] Implementar cola de emails
- [ ] Agregar más templates

---

**Documento generado:** 2025-12-03
**Autor:** Claude Code
**Versión:** 1.0
