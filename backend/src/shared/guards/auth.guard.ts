import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const session = request.session;

    // Verificar que existe sesión y usuario
    if (!session || !session.user) {
      throw new UnauthorizedException(
        'No estás autenticado. Por favor inicia sesión.',
      );
    }

    // Verificar que el usuario está activo
    if (!session.user.isActive) {
      throw new UnauthorizedException('Tu cuenta está inactiva');
    }

    return true;
  }
}
