import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { UpdatePrecioDto, AjusteMasivoDto, TipoPrecio } from './dto';

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
   * Buscar productos por nombre o categoría (insensible a acentos)
   */
  async search(nombre?: string, categoriaId?: string) {
    // Construir la consulta SQL con unaccent para búsqueda sin acentos
    let query = `
      SELECT
        p.id,
        p.nombre,
        p.precio_lista,
        p.stock_actual,
        p.stock_minimo,
        p.descripcion,
        jsonb_build_object('id', c.id, 'nombre', c.nombre) as categorias,
        jsonb_build_object('id', u.id, 'nombre', u.nombre) as unidades
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      INNER JOIN unidades u ON p.unidad_id = u.id
      WHERE p.activo = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por nombre usando unaccent
    if (nombre) {
      query += ` AND unaccent(p.nombre) ILIKE unaccent($${paramIndex})`;
      params.push(`%${nombre}%`);
      paramIndex++;
    }

    // Filtro por categoría
    if (categoriaId) {
      query += ` AND p.categoria_id = $${paramIndex}`;
      params.push(BigInt(categoriaId));
      paramIndex++;
    }

    query += ` ORDER BY p.nombre ASC`;

    // Ejecutar query raw
    const productos = await this.prisma.$queryRawUnsafe(query, ...params);

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

  /**
   * Obtener todos los productos con sus precios configurados
   */
  async getProductosConPrecios() {
    const productos = await this.prisma.productos.findMany({
      where: {
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        precio_lista: true,
        categorias: {
          select: {
            id: true,
            nombre: true,
          },
        },
        precios: {
          select: {
            id: true,
            precio_minorista: true,
            precio_mayorista: true,
            precio_supermayorista: true,
            ultima_modificacion: true,
          },
          orderBy: {
            ultima_modificacion: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return productos.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio_lista: producto.precio_lista,
      categoria: producto.categorias.nombre,
      categoria_id: producto.categorias.id,
      precio_minorista: producto.precios[0]?.precio_minorista || producto.precio_lista,
      precio_mayorista: producto.precios[0]?.precio_mayorista || producto.precio_lista,
      precio_supermayorista: producto.precios[0]?.precio_supermayorista || producto.precio_lista,
      ultima_modificacion: producto.precios[0]?.ultima_modificacion,
      tiene_precios_configurados: producto.precios.length > 0,
    }));
  }

  /**
   * Actualizar precios de un producto específico
   */
  async updatePrecio(productoId: bigint, updatePrecioDto: UpdatePrecioDto, usuarioId: bigint) {
    const producto = await this.prisma.productos.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    // Buscar si ya existe un registro de precios para este producto
    const precioExistente = await this.prisma.precios.findFirst({
      where: { producto_id: productoId },
    });

    let precio;
    if (precioExistente) {
      // Actualizar precio existente
      precio = await this.prisma.precios.update({
        where: { id: precioExistente.id },
        data: {
          precio_minorista: updatePrecioDto.precio_minorista,
          precio_mayorista: updatePrecioDto.precio_mayorista,
          precio_supermayorista: updatePrecioDto.precio_supermayorista,
          usuario_id: usuarioId,
          ultima_modificacion: new Date(),
        },
      });
    } else {
      // Crear nuevo registro de precios
      precio = await this.prisma.precios.create({
        data: {
          producto_id: productoId,
          precio_minorista: updatePrecioDto.precio_minorista,
          precio_mayorista: updatePrecioDto.precio_mayorista,
          precio_supermayorista: updatePrecioDto.precio_supermayorista,
          usuario_id: usuarioId,
        },
      });
    }

    return {
      message: 'Precios actualizados correctamente',
      precio,
    };
  }

  /**
   * Ajuste masivo de precios
   */
  async ajusteMasivo(ajusteMasivoDto: AjusteMasivoDto, usuarioId: bigint) {
    const { producto_ids, porcentaje, tipo } = ajusteMasivoDto;

    // Validar que todos los productos existen
    const productos = await this.prisma.productos.findMany({
      where: {
        id: { in: producto_ids.map((id) => BigInt(id)) },
        activo: true,
      },
      include: {
        precios: {
          orderBy: {
            ultima_modificacion: 'desc',
          },
          take: 1,
        },
      },
    });

    if (productos.length !== producto_ids.length) {
      throw new BadRequestException('Uno o más productos no fueron encontrados');
    }

    // Calcular factor de ajuste
    const factor = 1 + porcentaje / 100;

    // Realizar ajustes en transacción
    const resultados = await this.prisma.$transaction(
      productos.map((producto) => {
        const precioActual = producto.precios[0];

        // Calcular nuevos precios
        let nuevoMinorista: number;
        let nuevoMayorista: number;
        let nuevoSupermayorista: number;

        if (precioActual) {
          nuevoMinorista = Number(precioActual.precio_minorista) * factor;
          nuevoMayorista = Number(precioActual.precio_mayorista) * factor;
          nuevoSupermayorista = Number(precioActual.precio_supermayorista) * factor;
        } else {
          // Si no tiene precios configurados, usar precio_lista como base
          nuevoMinorista = Number(producto.precio_lista) * factor;
          nuevoMayorista = Number(producto.precio_lista) * factor;
          nuevoSupermayorista = Number(producto.precio_lista) * factor;
        }

        // Aplicar ajuste según el tipo
        const datosActualizacion: any = {
          usuario_id: usuarioId,
          ultima_modificacion: new Date(),
        };

        if (tipo === TipoPrecio.MINORISTA || tipo === TipoPrecio.TODOS) {
          datosActualizacion.precio_minorista = nuevoMinorista;
        }

        if (tipo === TipoPrecio.MAYORISTA || tipo === TipoPrecio.TODOS) {
          datosActualizacion.precio_mayorista = nuevoMayorista;
        }

        if (tipo === TipoPrecio.SUPERMAYORISTA || tipo === TipoPrecio.TODOS) {
          datosActualizacion.precio_supermayorista = nuevoSupermayorista;
        }

        // Actualizar o crear registro de precios
        if (precioActual) {
          return this.prisma.precios.update({
            where: { id: precioActual.id },
            data: datosActualizacion,
          });
        } else {
          return this.prisma.precios.create({
            data: {
              producto_id: producto.id,
              precio_minorista: nuevoMinorista,
              precio_mayorista: nuevoMayorista,
              precio_supermayorista: nuevoSupermayorista,
              usuario_id: usuarioId,
            },
          });
        }
      }),
    );

    return {
      message: `Se ajustaron ${resultados.length} productos correctamente`,
      productos_actualizados: resultados.length,
    };
  }
}
