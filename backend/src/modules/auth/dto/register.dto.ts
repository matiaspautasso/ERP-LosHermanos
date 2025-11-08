import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'nuevo@example.com',
  })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario único',
    example: 'usuario123',
  })
  @IsNotEmpty({ message: 'El nombre de usuario es requerido' })
  @IsString()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El usuario solo puede contener letras, números y guiones bajos',
  })
  username: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 4 caracteres)',
    example: 'pass',
    minLength: 4,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password: string;
}
