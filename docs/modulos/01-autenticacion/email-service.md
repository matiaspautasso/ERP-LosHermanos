# 📧 EMAIL SERVICE - CONFIGURACIÓN

> **Estado:** ✅ Funcionando | **Actualizado:** Dic 2025

## 🎯 Funcionalidad

Servicio de email para recuperación automática de contraseñas usando Nodemailer + Gmail.

## ⚙️ Configuración Actual

### Variables de Entorno
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=matiaspautasso2@gmail.com
SMTP_PASS=tu-app-password-aqui
FRONTEND_URL=http://localhost:5173
```

### Configuración del Servicio
```typescript
// backend/src/modules/email/email.service.ts
@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password de Gmail
      },
    });
  }
}
```

## 🔄 Flujo de Recuperación

1. Usuario ingresa email en frontend (`RecoverPage.tsx`)
2. Frontend llama a `POST /api/auth/recover`
3. Backend genera nueva contraseña temporal
4. Backend actualiza contraseña en BD (hasheada)
5. Backend envía email con contraseña temporal
6. Usuario recibe email y puede hacer login

## 📧 Template de Email

```html
<h1>Recuperación de Contraseña - ERP Los Hermanos</h1>
<p>Tu nueva contraseña temporal es: <strong>[PASSWORD]</strong></p>
<p>Te recomendamos cambiarla después del login.</p>
<a href="http://localhost:5173/auth/login">Ir al Login</a>
```

## 🔧 Configurar Otro Email

### Para Gmail:
1. Activar autenticación de 2 factores
2. Generar "App Password" en configuración de Google
3. Usar el App Password (no la contraseña normal)
4. Actualizar variables `SMTP_USER` y `SMTP_PASS`

### Para otros proveedores:
```typescript
// Outlook/Hotmail
host: 'smtp-mail.outlook.com'
port: 587

// Yahoo
host: 'smtp.mail.yahoo.com' 
port: 587
```