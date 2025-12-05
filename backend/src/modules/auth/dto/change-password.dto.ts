import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Email o username del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsString()
  @IsNotEmpty({ message: 'El email o username es requerido' })
  emailOrUsername: string;

  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 6 caracteres)',
    example: 'newpassword456',
  })
  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
