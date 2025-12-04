import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';

@ApiTags('clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista de clientes activos' })
  @ApiQuery({ name: 'query', required: false, description: 'Buscar por nombre o apellido' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo (minorista/mayorista)' })
  async findAll(
    @Query('query') query?: string,
    @Query('tipo') tipo?: string,
  ) {
    if (query || tipo) {
      return this.clientesService.search(query, tipo);
    }
    return this.clientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(BigInt(id));
  }
}
