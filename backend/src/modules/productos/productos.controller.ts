import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductosService } from './productos.service';

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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(BigInt(id));
  }
}
