import {
  Controller,
  Post,
  Get,
  Body,
  Session,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RecoverDto } from './dto';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        message: 'Usuario registrado exitosamente',
        user: {
          id: 'uuid',
          email: 'usuario@example.com',
          username: 'usuario123',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email o username ya existe' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        message: 'Inicio de sesión exitoso',
        user: {
          id: 'uuid',
          email: 'usuario@example.com',
          username: 'usuario123',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas o usuario inactivo' })
  async login(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
    const result = await this.authService.login(loginDto);

    // Guardar usuario en la sesión
    session.user = result.user;

    // Si recordarme está activo, extender la duración de la cookie
    if (loginDto.rememberMe) {
      session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 días
    }

    return result;
  }

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperar contraseña' })
  @ApiBody({ type: RecoverDto })
  @ApiResponse({
    status: 200,
    description: 'Contraseña temporal enviada al correo',
    schema: {
      example: {
        message: 'Se ha enviado un nuevo usuario y contraseña a tu correo electrónico',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async recover(@Body() recoverDto: RecoverDto) {
    return this.authService.recoverPassword(recoverDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesión cerrada exitosamente',
      },
    },
  })
  async logout(@Session() session: Record<string, any>) {
    const userId = session.user?.id;

    if (userId) {
      await this.authService.logout(userId);
    }

    // Destruir la sesión
    session.destroy();

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: 'uuid',
        email: 'usuario@example.com',
        username: 'usuario123',
        isActive: true,
        lastLogin: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@GetUser() user: any) {
    if (!user?.id) {
      throw new UnauthorizedException('No autenticado');
    }

    return this.authService.getProfile(user.id);
  }
}
