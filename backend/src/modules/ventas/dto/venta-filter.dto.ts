import { IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VentaFilterDto {
  @ApiProperty({
    description: 'Fecha desde (formato ISO)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  desde?: string;

  @ApiProperty({
    description: 'Fecha hasta (formato ISO)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  hasta?: string;

  @ApiProperty({
    description: 'ID del cliente',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  cliente_id?: string;

  @ApiProperty({
    description: 'Tipo de venta',
    example: 'Minorista',
    required: false,
  })
  @IsOptional()
  @IsString()
  tipo_venta?: string;

  @ApiProperty({
    description: 'Número de página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  page?: number;

  @ApiProperty({
    description: 'Cantidad de registros por página',
    example: 50,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  limit?: number;
}
