import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Inicializar el transporter de nodemailer con credenciales SMTP de Gmail
   */
  private initializeTransporter() {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (!emailUser || !emailPassword) {
      this.logger.warn(
        'Variables de entorno EMAIL_USER o EMAIL_PASSWORD no configuradas. El servicio de email no funcionará.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para puerto 465, false para otros puertos
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    this.logger.log(`Email service inicializado con cuenta: ${emailUser}`);
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordRecoveryEmail(
    to: string,
    username: string,
    temporaryPassword: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Transporter no inicializado. Verifica las variables de entorno.');
      throw new Error('Servicio de email no configurado');
    }

    const subject = 'Recuperación de Contraseña - ERP Los Hermanos';
    const html = this.generatePasswordRecoveryTemplate(username, temporaryPassword);

    try {
      const info = await this.transporter.sendMail({
        from: `"ERP Los Hermanos" <${this.configService.get<string>('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email de recuperación enviado a ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}:`, error);
      throw new Error('Error al enviar email de recuperación');
    }
  }

  /**
   * Template HTML para email de recuperación de contraseña
   */
  private generatePasswordRecoveryTemplate(
    username: string,
    temporaryPassword: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #2c5b2d;
            color: #fefbe4;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
            color: #333333;
          }
          .password-box {
            background-color: #f8f8f8;
            border: 2px dashed #2c5b2d;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .password {
            font-size: 24px;
            font-weight: bold;
            color: #2c5b2d;
            letter-spacing: 2px;
            font-family: monospace;
          }
          .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777777;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            margin: 20px 0;
            background-color: #2c5b2d;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ERP Los Hermanos</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          <div class="content">
            <h2>Hola, ${username}</h2>
            <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
            <p>Tu nueva contraseña temporal es:</p>

            <div class="password-box">
              <div class="password">${temporaryPassword}</div>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Esta es una contraseña temporal.
              Te recomendamos cambiarla después de iniciar sesión.
            </div>

            <p>Puedes usar esta contraseña para acceder a tu cuenta:</p>

            <center>
              <a href="${this.configService.get<string>('FRONTEND_URL')}/login" class="button">
                Iniciar Sesión
              </a>
            </center>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Si no solicitaste esta recuperación, ignora este mensaje.
              Tu cuenta permanece segura.
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2025 ERP Los Hermanos. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verificar conexión SMTP (útil para testing)
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Transporter no inicializado');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      this.logger.error('Error al verificar conexión SMTP:', error);
      return false;
    }
  }
}
