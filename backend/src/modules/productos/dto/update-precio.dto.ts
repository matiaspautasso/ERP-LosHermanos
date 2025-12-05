import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePrecioDto {
  @ApiProperty({
    description: 'Precio minorista del producto',
    example: 150.50,
  })
  @IsNotEmpty({ message: 'El precio minorista es requerido' })
  @IsNumber({}, { message: 'El precio minorista debe ser un número' })
  @IsPositive({ message: 'El precio minorista debe ser positivo' })
  precio_minorista: number;

  @ApiProperty({
    description: 'Precio mayorista del producto',
    example: 130.00,
  })
  @IsNotEmpty({ message: 'El precio mayorista es requerido' })
  @IsNumber({}, { message: 'El precio mayorista debe ser un número' })
  @IsPositive({ message: 'El precio mayorista debe ser positivo' })
  precio_mayorista: number;
}
