import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../../email/email.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PasswordRecoveryRequestedEvent } from '../events';

@Injectable()
export class PasswordRecoveryListener {
  private readonly logger = new Logger(PasswordRecoveryListener.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Escuchar evento de recuperación de contraseña
   * Cuando se dispara, enviar email con contraseña temporal
   */
  @OnEvent('user.password-recovery-requested')
  async handlePasswordRecoveryRequested(event: PasswordRecoveryRequestedEvent) {
    this.logger.log(`Procesando recuperación de contraseña para: ${event.email}`);

    try {
      // Obtener el username real desde la base de datos
      const user = await this.prisma.usuarios.findUnique({
        where: { id: event.userId },
        select: { usuario: true },
      });

      const username = user?.usuario || event.email.split('@')[0];

      // Enviar email con contraseña temporal
      await this.emailService.sendPasswordRecoveryEmail(
        event.email,
        username,
        event.temporaryPassword,
      );

      this.logger.log(`Email de recuperación enviado exitosamente a: ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Error al procesar recuperación de contraseña para ${event.email}:`,
        error,
      );
      // No lanzar error para no bloquear el flujo principal
      // El usuario ya recibió confirmación, aunque el email falle
    }
  }
}
