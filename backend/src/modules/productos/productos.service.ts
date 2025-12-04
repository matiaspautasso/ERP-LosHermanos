import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener todos los productos activos con stock
   */
  async findAll() {
    const productos = await this.prisma.productos.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        precio_lista: true,
        stock_actual: true,
        stock_minimo: true,
        iva_porcentaje: true,
        descripcion: true,
        categorias: {
          select: {
            id: true,
            nombre: true,
          },
        },
        unidades: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return productos;
  }

  /**
   * Obtener un producto por ID
   */
  async findOne(id: bigint) {
    const producto = await this.prisma.productos.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        precio_lista: true,
        costo: true,
        stock_actual: true,
        stock_minimo: true,
        iva_porcentaje: true,
        descripcion: true,
        activo: true,
        categorias: {
          select: {
            id: true,
            nombre: true,
          },
        },
        unidades: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  /**
   * Buscar productos por nombre o categoría
   */
  async search(nombre?: string, categoriaId?: string) {
    const where: any = {
      activo: true,
    };

    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: 'insensitive',
      };
    }

    if (categoriaId) {
      where.categoria_id = BigInt(categoriaId);
    }

    const productos = await this.prisma.productos.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        precio_lista: true,
        stock_actual: true,
        stock_minimo: true,
        iva_porcentaje: true,
        descripcion: true,
        categorias: {
          select: {
            id: true,
            nombre: true,
          },
        },
        unidades: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return productos;
  }

  /**
   * Verificar disponibilidad de stock
   */
  async checkStockAvailability(productoId: bigint, cantidadRequerida: number): Promise<boolean> {
    const producto = await this.prisma.productos.findUnique({
      where: { id: productoId },
      select: {
        stock_actual: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    return Number(producto.stock_actual) >= cantidadRequerida;
  }

  /**
   * Obtener todas las categorías activas
   */
  async findAllCategorias() {
    return this.prisma.categorias.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}
