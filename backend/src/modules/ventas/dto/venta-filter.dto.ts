import { IsOptional, IsString, IsDateString } from 'class-validator';
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
}
