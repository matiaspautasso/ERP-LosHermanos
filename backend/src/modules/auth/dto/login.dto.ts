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
    example: 'pass',
    minLength: 4,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Recordar sesión del usuario',
    example: false,
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}
