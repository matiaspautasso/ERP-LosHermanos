import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RegisterDto, RecoverDto } from './dto';
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
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Verificar si el username ya existe
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit(
      'user.registered',
      new UserRegisteredEvent(user.id, user.email, user.username),
    );

    this.logger.log(`Usuario registrado: ${user.email}`);

    return {
      message: 'Usuario registrado exitosamente',
      user,
    };
  }

  /**
   * Iniciar sesión
   */
  async login(loginDto: LoginDto) {
    const { emailOrUsername, password } = loginDto;

    // Buscar usuario por email o username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Actualizar último login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit('user.logged-in', new UserLoggedInEvent(user.id, user.email));

    this.logger.log(`Usuario autenticado: ${user.email}`);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Recuperar contraseña
   */
  async recoverPassword(recoverDto: RecoverDto) {
    const { email } = recoverDto;

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No se encontró un usuario con ese correo electrónico');
    }

    // Generar nueva contraseña temporal
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Actualizar contraseña
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Emitir evento de dominio (un listener podría enviar el email)
    this.eventEmitter.emit(
      'user.password-recovery-requested',
      new PasswordRecoveryRequestedEvent(user.id, user.email, temporaryPassword),
    );

    this.logger.log(`Recuperación de contraseña solicitada para: ${user.email}`);

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
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
