import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todos los clientes activos
   */
  async findAll() {
    const clientes = await this.prisma.clientes.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        tipo: true,
        fecha_alta: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return clientes;
  }

  /**
   * Obtener un cliente por ID
   */
  async findOne(id: bigint) {
    const cliente = await this.prisma.clientes.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        tipo: true,
        activo: true,
        fecha_alta: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  /**
   * Buscar clientes por nombre, apellido o tipo
   */
  async search(query?: string, tipo?: string) {
    const where: any = {
      activo: true,
    };

    if (query) {
      where.OR = [
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const clientes = await this.prisma.clientes.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        correo: true,
        tipo: true,
        fecha_alta: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });

    return clientes;
  }
}
