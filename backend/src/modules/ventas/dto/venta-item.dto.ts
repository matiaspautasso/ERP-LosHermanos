import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VentaItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '1',
  })
  @IsNotEmpty({ message: 'El producto es obligatorio' })
  producto_id: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 0.001,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @Min(0.001, { message: 'La cantidad mínima es 0.001' })
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 1200.0,
  })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @IsPositive({ message: 'El precio unitario debe ser mayor a 0' })
  precio_unitario: number;
}
