import { IsNotEmpty, IsArray, IsNumber, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoPrecio {
  MINORISTA = 'minorista',
  MAYORISTA = 'mayorista',
  SUPERMAYORISTA = 'supermayorista',
  TODOS = 'todos',
}

export class AjusteMasivoDto {
  @ApiProperty({
    description: 'Array de IDs de productos a ajustar',
    example: [1, 2, 3, 4],
    type: [Number],
  })
  @IsNotEmpty({ message: 'Los IDs de productos son requeridos' })
  @IsArray({ message: 'Los IDs de productos deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un producto' })
  producto_ids: number[];

  @ApiProperty({
    description: 'Porcentaje de ajuste (puede ser positivo o negativo)',
    example: 10.5,
  })
  @IsNotEmpty({ message: 'El porcentaje de ajuste es requerido' })
  @IsNumber({}, { message: 'El porcentaje de ajuste debe ser un número' })
  porcentaje: number;

  @ApiProperty({
    description: 'Tipo de precio a ajustar',
    enum: TipoPrecio,
    example: TipoPrecio.TODOS,
  })
  @IsNotEmpty({ message: 'El tipo de precio es requerido' })
  @IsEnum(TipoPrecio, { message: 'El tipo de precio debe ser: minorista, mayorista, supermayorista o todos' })
  tipo: TipoPrecio;
}
