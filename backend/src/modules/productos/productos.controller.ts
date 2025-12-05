import { Controller, Get, Param, Query, Put, Patch, Body, UseGuards, Session } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { UpdatePrecioDto, AjusteMasivoDto } from './dto';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { Session as ExpressSession } from 'express-session';

@ApiTags('productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de productos activos' })
  @ApiQuery({ name: 'nombre', required: false, description: 'Buscar por nombre' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría ID' })
  async findAll(
    @Query('nombre') nombre?: string,
    @Query('categoria') categoria?: string,
  ) {
    if (nombre || categoria) {
      return this.productosService.search(nombre, categoria);
    }
    return this.productosService.findAll();
  }

  @Get('categorias')
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  async findAllCategorias() {
    return this.productosService.findAllCategorias();
  }

  @Get('precios/lista')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener todos los productos con sus precios configurados' })
  async getProductosConPrecios() {
    return this.productosService.getProductosConPrecios();
  }

  @Patch('precios/masivo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Aplicar ajuste masivo de precios' })
  @ApiBody({ type: AjusteMasivoDto })
  async ajusteMasivo(
    @Body() ajusteMasivoDto: AjusteMasivoDto,
    @Session() session: ExpressSession & { user?: { id: bigint } },
  ) {
    return this.productosService.ajusteMasivo(ajusteMasivoDto, session.user!.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(BigInt(id));
  }

  @Put(':id/precios')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Actualizar precios de un producto' })
  @ApiBody({ type: UpdatePrecioDto })
  async updatePrecio(
    @Param('id') id: string,
    @Body() updatePrecioDto: UpdatePrecioDto,
    @Session() session: ExpressSession & { user?: { id: bigint } },
  ) {
    return this.productosService.updatePrecio(BigInt(id), updatePrecioDto, session.user!.id);
  }
}
