import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverDto {
  @ApiProperty({
    description: 'Correo electrónico registrado',
    example: 'usuario@example.com',
  })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  email: string;
}
