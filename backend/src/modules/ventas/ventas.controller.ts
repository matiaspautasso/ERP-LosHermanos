import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto, VentaFilterDto } from './dto';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { GetUser } from '@/shared/decorators/get-user.decorator';

@ApiTags('ventas')
@Controller('ventas')
@UseGuards(AuthGuard) // Proteger todas las rutas del controller
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  async create(
    @Body() createVentaDto: CreateVentaDto,
    @GetUser() user: any,
  ) {
    return this.ventasService.create(createVentaDto, BigInt(user.id));
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de ventas con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas obtenida exitosamente',
  })
  async findAll(@Query() filters: VentaFilterDto) {
    return this.ventasService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una venta' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de venta obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Venta no encontrada',
  })
  async findOne(@Param('id') id: string) {
    return this.ventasService.findOne(BigInt(id));
  }
}
