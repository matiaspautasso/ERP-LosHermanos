import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class HistorialPreciosQueryDto {
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @IsOptional()
  @IsString()
  fechaFin?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number = 50;
}
