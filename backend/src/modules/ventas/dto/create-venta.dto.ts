import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VentaItemDto } from './venta-item.dto';

export class CreateVentaDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: '1',
  })
  @IsNotEmpty({ message: 'El cliente es obligatorio' })
  cliente_id: string;

  @ApiProperty({
    description: 'Tipo de venta',
    example: 'Minorista',
    enum: ['Minorista', 'Mayorista'],
  })
  @IsString()
  @IsIn(['Minorista', 'Mayorista'], {
    message: 'El tipo de venta debe ser Minorista o Mayorista',
  })
  tipo_venta: string;

  @ApiProperty({
    description: 'Forma de pago',
    example: 'Efectivo',
    enum: ['Efectivo', 'Tarjeta'],
  })
  @IsString()
  @IsIn(['Efectivo', 'Tarjeta'], {
    message: 'La forma de pago debe ser Efectivo o Tarjeta',
  })
  forma_pago: string;

  @ApiProperty({
    description: 'Descuento en porcentaje',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  descuento_porcentaje: number;

  @ApiProperty({
    description: 'Items de la venta',
    type: [VentaItemDto],
  })
  @IsArray({ message: 'Los items deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos un item en la venta' })
  @ValidateNested({ each: true })
  @Type(() => VentaItemDto)
  items: VentaItemDto[];
}
