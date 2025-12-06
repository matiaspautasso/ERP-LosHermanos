import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { CreateVentaDto, VentaFilterDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);
  private readonly IVA_PORCENTAJE = 21; // IVA fijo del 21%

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva venta
   */
  async create(createVentaDto: CreateVentaDto, usuarioId: bigint) {
    const { cliente_id, tipo_venta, forma_pago, descuento_porcentaje, items } =
      createVentaDto;

    // 1. Validar que el cliente existe
    const cliente = await this.prisma.clientes.findUnique({
      where: { id: BigInt(cliente_id) },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${cliente_id} no encontrado`);
    }

    // 2. Validar stock y obtener información de productos
    const productosMap = new Map();
    for (const item of items) {
      const producto = await this.prisma.productos.findUnique({
        where: { id: BigInt(item.producto_id) },
        include: {
          precios: {
            orderBy: { ultima_modificacion: 'desc' },
            take: 1,
          },
        },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${item.producto_id} no encontrado`,
        );
      }

      if (!producto.activo) {
        throw new BadRequestException(
          `El producto "${producto.nombre}" no está activo`,
        );
      }

      // Validar stock disponible
      const stockDisponible = Number(producto.stock_actual);
      if (stockDisponible < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${producto.nombre}". Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}`,
        );
      }

      productosMap.set(item.producto_id, producto);
    }

    // 3. Calcular totales
    let subtotalGeneral = 0;
    const itemsConCalculos = items.map((item) => {
      const producto = productosMap.get(item.producto_id);

      // Obtener precio según tipo de venta
      let precioUnitario = Number(producto.precio_lista);

      // Si hay precios configurados (minorista/mayorista/supermayorista), usar esos
      if (producto.precios && producto.precios.length > 0) {
        const precio = producto.precios[0];
        if (tipo_venta === 'Supermayorista') {
          precioUnitario = Number(precio.precio_supermayorista || precio.precio_mayorista);
        } else if (tipo_venta === 'Mayorista') {
          precioUnitario = Number(precio.precio_mayorista);
        } else {
          precioUnitario = Number(precio.precio_minorista);
        }
      }

      const subtotal = precioUnitario * item.cantidad;
      subtotalGeneral += subtotal;

      return {
        producto_id: BigInt(item.producto_id),
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        iva_porcentaje: this.IVA_PORCENTAJE,
        subtotal: subtotal,
      };
    });

    // Calcular IVA y descuento
    const ivaTotal = (subtotalGeneral * this.IVA_PORCENTAJE) / 100;
    const subtotalConIva = subtotalGeneral + ivaTotal;
    const descuentoMonto = (subtotalConIva * descuento_porcentaje) / 100;
    const total = subtotalConIva - descuentoMonto;

    // 4. Crear venta con items en una transacción
    const venta = await this.prisma.$transaction(async (prisma) => {
      // Crear la venta
      const nuevaVenta = await prisma.ventas.create({
        data: {
          cliente_id: BigInt(cliente_id),
          tipo_venta,
          forma_pago,
          descuento: new Decimal(descuentoMonto),
          total: new Decimal(total),
          usuario_id: usuarioId,
          detalle_venta: {
            create: itemsConCalculos.map((item) => ({
              producto_id: item.producto_id,
              cantidad: new Decimal(item.cantidad),
              precio_unitario: new Decimal(item.precio_unitario),
              iva_porcentaje: new Decimal(item.iva_porcentaje),
              subtotal: new Decimal(item.subtotal),
            })),
          },
        },
        include: {
          detalle_venta: {
            include: {
              productos: {
                select: {
                  nombre: true,
                },
              },
            },
          },
          clientes: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      // Descontar stock de cada producto
      for (const item of itemsConCalculos) {
        await prisma.productos.update({
          where: { id: item.producto_id },
          data: {
            stock_actual: {
              decrement: new Decimal(item.cantidad),
            },
          },
        });

        // Registrar movimiento de stock
        await prisma.movimientos_stock.create({
          data: {
            producto_id: item.producto_id,
            tipo_operacion: 'Egreso',
            motivo: 'Otros',
            cantidad: new Decimal(item.cantidad),
            observaciones: `Venta #${nuevaVenta.id}`,
            usuario_id: usuarioId,
          },
        });
      }

      return nuevaVenta;
    });

    this.logger.log(`Venta #${venta.id} creada exitosamente`);

    return {
      message: 'Venta registrada exitosamente',
      venta: {
        id: venta.id.toString(),
        fecha: venta.fecha,
        cliente: `${venta.clientes.nombre} ${venta.clientes.apellido}`,
        tipo_venta: venta.tipo_venta,
        forma_pago: venta.forma_pago,
        subtotal: subtotalGeneral.toFixed(2),
        iva: ivaTotal.toFixed(2),
        descuento: descuentoMonto.toFixed(2),
        total: total.toFixed(2),
        items: venta.detalle_venta.map((detalle) => ({
          producto: detalle.productos.nombre,
          cantidad: Number(detalle.cantidad),
          precio_unitario: Number(detalle.precio_unitario),
          subtotal: Number(detalle.subtotal),
        })),
      },
    };
  }

  /**
   * Obtener todas las ventas con filtros
   */
  async findAll(filters: VentaFilterDto) {
    const { desde, hasta, cliente_id, tipo_venta } = filters;

    const where: any = {};

    if (desde || hasta) {
      where.fecha = {};
      if (desde) {
        where.fecha.gte = new Date(desde);
      }
      if (hasta) {
        where.fecha.lte = new Date(hasta);
      }
    }

    if (cliente_id) {
      where.cliente_id = BigInt(cliente_id);
    }

    if (tipo_venta) {
      where.tipo_venta = tipo_venta;
    }

    const ventas = await this.prisma.ventas.findMany({
      where,
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return ventas.map((venta) => ({
      id: venta.id.toString(),
      fecha: venta.fecha,
      cliente: `${venta.clientes.nombre} ${venta.clientes.apellido}`,
      tipo_venta: venta.tipo_venta,
      forma_pago: venta.forma_pago,
      total: Number(venta.total),
      descuento: Number(venta.descuento),
    }));
  }

  /**
   * Obtener detalle de una venta
   */
  async findOne(id: bigint) {
    const venta = await this.prisma.ventas.findUnique({
      where: { id },
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido: true,
            tipo: true,
          },
        },
        detalle_venta: {
          include: {
            productos: {
              select: {
                nombre: true,
                unidades: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!venta) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return {
      id: venta.id.toString(),
      fecha: venta.fecha,
      cliente: {
        nombre: `${venta.clientes.nombre} ${venta.clientes.apellido}`,
        tipo: venta.clientes.tipo,
      },
      tipo_venta: venta.tipo_venta,
      forma_pago: venta.forma_pago,
      descuento: Number(venta.descuento),
      total: Number(venta.total),
      usuario: venta.user.username,
      items: venta.detalle_venta.map((detalle) => ({
        producto: detalle.productos.nombre,
        unidad: detalle.productos.unidades.nombre,
        cantidad: Number(detalle.cantidad),
        precio_unitario: Number(detalle.precio_unitario),
        iva_porcentaje: Number(detalle.iva_porcentaje),
        subtotal: Number(detalle.subtotal),
      })),
    };
  }
}
