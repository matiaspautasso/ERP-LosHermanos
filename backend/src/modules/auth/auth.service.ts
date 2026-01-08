import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../core/prisma/prisma.service';
import { LoginDto, RegisterDto, RecoverDto, ChangePasswordDto } from './dto';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  PasswordRecoveryRequestedEvent,
} from './events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Verificar si el email ya existe
    const existingEmail = await this.prisma.usuarios.findUnique({
      where: { correo: email },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.prisma.usuarios.findUnique({
      where: { usuario: username },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await this.prisma.usuarios.create({
      data: {
        correo: email,
        usuario: username,
        contrasena_hash: hashedPassword,
      },
      select: {
        id: true,
        correo: true,
        usuario: true,
        fecha_alta: true,
      },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(user.id, user.correo, user.usuario),
    );

    this.logger.log(`Usuario registrado: ${user.correo}`);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        email: user.correo,
        username: user.usuario,
        createdAt: user.fecha_alta,
      },
    };
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    // Buscar usuario por email o username
    const user = await this.prisma.usuarios.findFirst({
      where: {
        OR: [{ correo: emailOrUsername }, { usuario: emailOrUsername }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.contrasena_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Actualizar último login
    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { ultimo_acceso: new Date() },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit('user.logged-in', new UserLoggedInEvent(user.id, user.correo));

    this.logger.log(`Usuario autenticado: ${user.correo}`);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.correo,
        username: user.usuario,
        isActive: user.activo,
      },
    };
  }

  /**
   * Recuperar contraseña
   */
  async recoverPassword(recoverDto: RecoverDto) {
    const { email } = recoverDto;

    // Buscar usuario
    const user = await this.prisma.usuarios.findUnique({
      where: { correo: email },
    });

    if (!user) {
      throw new NotFoundException('No se encontró un usuario con ese correo electrónico');
    }

    // Generar nueva contraseña temporal
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Actualizar contraseña
    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { contrasena_hash: hashedPassword },
    });

    // Emitir evento de dominio (un listener podría enviar el email)
    this.eventEmitter.emit(
      'user.password-recovery-requested',
      new PasswordRecoveryRequestedEvent(user.id, user.correo, temporaryPassword),
    );

    this.logger.log(`Recuperación de contraseña solicitada para: ${user.correo}`);

    return {
      message: 'Se ha enviado un nuevo usuario y contraseña a tu correo electrónico',
      // En producción, NO devolver la contraseña temporal en la respuesta
      // Solo se enviaría por email
      ...(process.env.NODE_ENV === 'development' && {
        temporaryPassword, // Solo para desarrollo
      }),
    };
  }

  /**
   * Obtener perfil de usuario
   */
  async getProfile(userId: bigint) {
    const user = await this.prisma.usuarios.findUnique({
      where: { id: userId },
      select: {
        id: true,
        correo: true,
        usuario: true,
        activo: true,
        ultimo_acceso: true,
        fecha_alta: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.correo,
      username: user.usuario,
      isActive: user.activo,
      lastLogin: user.ultimo_acceso,
      createdAt: user.fecha_alta,
    };
  }

  /**
   * Cerrar sesión
   */
  async logout(userId: bigint) {
    this.logger.log(`Usuario cerró sesión: ${userId}`);

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { emailOrUsername, currentPassword, newPassword } = changePasswordDto;

    // Buscar usuario por email o username
    const user = await this.prisma.usuarios.findFirst({
      where: {
        OR: [{ correo: emailOrUsername }, { usuario: emailOrUsername }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.contrasena_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { contrasena_hash: hashedNewPassword },
    });

    this.logger.log(`Usuario ${user.usuario} cambió su contraseña`);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Generar contraseña temporal aleatoria
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
