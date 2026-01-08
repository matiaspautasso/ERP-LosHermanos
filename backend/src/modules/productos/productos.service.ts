import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { UpdatePrecioDto, AjusteMasivoDto, TipoPrecio, HistorialPreciosQueryDto } from './dto';

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
        precios: {
          select: {
            precio_minorista: true,
            precio_mayorista: true,
            precio_supermayorista: true,
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

    // Mapear para aplanar la estructura de precios
    return productos.map((p) => {
      // Validación: todos los productos deben tener precios configurados
      if (!p.precios || p.precios.length === 0) {
        throw new BadRequestException(
          `El producto "${p.nombre}" (ID: ${p.id}) no tiene precios configurados. ` +
          `Por favor, configure los precios antes de continuar.`
        );
      }

      const precioActual = p.precios[0];

      return {
        id: p.id,
        nombre: p.nombre,
        stock_actual: p.stock_actual,
        stock_minimo: p.stock_minimo,
        descripcion: p.descripcion,
        categorias: p.categorias,
        unidades: p.unidades,
        precio_minorista: precioActual.precio_minorista,
        precio_mayorista: precioActual.precio_mayorista,
        precio_supermayorista: precioActual.precio_supermayorista,
      };
    });
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
        p.stock_actual,
        p.stock_minimo,
        p.descripcion,
        jsonb_build_object('id', c.id, 'nombre', c.nombre) as categorias,
        jsonb_build_object('id', u.id, 'nombre', u.nombre) as unidades,
        (SELECT precio_minorista FROM precios
         WHERE producto_id = p.id
         ORDER BY ultima_modificacion DESC LIMIT 1) as precio_minorista,
        (SELECT precio_mayorista FROM precios
         WHERE producto_id = p.id
         ORDER BY ultima_modificacion DESC LIMIT 1) as precio_mayorista,
        (SELECT precio_supermayorista FROM precios
         WHERE producto_id = p.id
         ORDER BY ultima_modificacion DESC LIMIT 1) as precio_supermayorista
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

    return productos.map((producto) => {
      // Validación: todos los productos deben tener precios configurados
      if (!producto.precios || producto.precios.length === 0) {
        throw new BadRequestException(
          `El producto "${producto.nombre}" (ID: ${producto.id}) no tiene precios configurados. ` +
          `Por favor, configure los precios antes de continuar.`
        );
      }

      const precioActual = producto.precios[0];

      return {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categorias.nombre,
        categoria_id: producto.categorias.id,
        precio_minorista: precioActual.precio_minorista,
        precio_mayorista: precioActual.precio_mayorista,
        precio_supermayorista: precioActual.precio_supermayorista,
        ultima_modificacion: precioActual.ultima_modificacion,
        tiene_precios_configurados: true,
      };
    });
  }

  /**
   * Actualizar precios de un producto específico
   * MODELO INMUTABLE: Siempre crea un nuevo registro en lugar de actualizar
   */
  async updatePrecio(productoId: bigint, updatePrecioDto: UpdatePrecioDto, usuarioId: bigint) {
    const producto = await this.prisma.productos.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    // MODELO INMUTABLE: Siempre crear nuevo registro
    // Esto genera historial automático en la tabla precios
    const precio = await this.prisma.precios.create({
      data: {
        producto_id: productoId,
        precio_minorista: updatePrecioDto.precio_minorista,
        precio_mayorista: updatePrecioDto.precio_mayorista,
        precio_supermayorista: updatePrecioDto.precio_supermayorista,
        usuario_id: usuarioId,
      },
    });

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

    // MODELO INMUTABLE: Realizar ajustes en transacción
    // Cada ajuste crea un nuevo registro en lugar de actualizar
    const resultados = await this.prisma.$transaction(
      productos.map((producto) => {
        const precioActual = producto.precios[0];

        // Validación: el producto debe tener precios configurados
        if (!precioActual) {
          throw new BadRequestException(
            `El producto "${producto.nombre}" (ID: ${producto.id}) no tiene precios configurados. ` +
            `Por favor, configure los precios antes de realizar ajustes masivos.`
          );
        }

        // Calcular precios base actuales
        const baseMinorista = Number(precioActual.precio_minorista);
        const baseMayorista = Number(precioActual.precio_mayorista);
        const baseSupermayorista = Number(precioActual.precio_supermayorista);

        // Aplicar ajuste según el tipo solicitado
        let nuevoMinorista = baseMinorista;
        let nuevoMayorista = baseMayorista;
        let nuevoSupermayorista = baseSupermayorista;

        if (tipo === TipoPrecio.MINORISTA || tipo === TipoPrecio.TODOS) {
          nuevoMinorista = baseMinorista * factor;
        }

        if (tipo === TipoPrecio.MAYORISTA || tipo === TipoPrecio.TODOS) {
          nuevoMayorista = baseMayorista * factor;
        }

        if (tipo === TipoPrecio.SUPERMAYORISTA || tipo === TipoPrecio.TODOS) {
          nuevoSupermayorista = baseSupermayorista * factor;
        }

        // MODELO INMUTABLE: Siempre crear nuevo registro
        return this.prisma.precios.create({
          data: {
            producto_id: producto.id,
            precio_minorista: nuevoMinorista,
            precio_mayorista: nuevoMayorista,
            precio_supermayorista: nuevoSupermayorista,
            usuario_id: usuarioId,
          },
        });
      }),
    );

    return {
      message: `Se ajustaron ${resultados.length} productos correctamente`,
      productos_actualizados: resultados.length,
    };
  }

  /**
   * Obtener historial de cambios de precios de un producto
   */
  async getHistorialPrecios(productoId: bigint, query: HistorialPreciosQueryDto) {
    // Verificar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id: productoId },
      select: { id: true, nombre: true },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    // Construir filtros de fecha
    const whereConditions: any = {
      producto_id: productoId,
    };

    if (query.fechaInicio || query.fechaFin) {
      whereConditions.ultima_modificacion = {};

      if (query.fechaInicio) {
        whereConditions.ultima_modificacion.gte = new Date(query.fechaInicio);
      }

      if (query.fechaFin) {
        whereConditions.ultima_modificacion.lte = new Date(query.fechaFin);
      }
    }

    // Obtener historial de precios
    const historial = await this.prisma.precios.findMany({
      where: whereConditions,
      include: {
        usuarios: {
          select: {
            usuario: true,
          },
        },
      },
      orderBy: {
        ultima_modificacion: 'desc',
      },
      take: query.limite || 50,
    });

    // Formatear respuesta
    return historial.map((precio) => ({
      id: precio.id,
      fecha: precio.ultima_modificacion,
      usuario: precio.usuarios.usuario,
      precio_minorista: precio.precio_minorista,
      precio_mayorista: precio.precio_mayorista,
      precio_supermayorista: precio.precio_supermayorista,
    }));
  }
}
