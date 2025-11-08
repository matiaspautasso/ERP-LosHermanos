import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico o nombre de usuario',
    example: 'usuario@example.com',
  })
  @IsNotEmpty({ message: 'El correo/usuario es requerido' })
  @IsString()
  emailOrUsername: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Recordar sesión del usuario',
    example: false,
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}
