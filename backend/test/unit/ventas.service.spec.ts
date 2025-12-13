import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VentasService } from '@/modules/ventas/ventas.service';
import { PrismaService } from '@/core/prisma/prisma.service';
import {
  mockUsuario,
  mockCliente,
  mockProductoNormal,
  mockProductoSinPrecios,
  mockProductoStockBajo,
  mockProductoInactivo,
  mockProductoPrecioCero,
  mockProductoDecimal,
  mockDtoVentaMinorista,
  mockDtoVentaMayorista,
  mockDtoVentaSupermayorista,
  mockDtoVentaMultiple,
  mockDtoVentaStockInsuficiente,
  mockDtoVentaSinPrecios,
  mockDtoVentaCantidadDecimal,
  mockVentaCreada,
  createMockPrismaService,
  toDecimal,
} from '../helpers/mock-data';

describe('VentasService', () => {
  let service: VentasService;
  let prisma: any;

  beforeEach(async () => {
    // Crear mock de PrismaService
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VentasService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<VentasService>(VentasService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  /**
   * ========================================
   * GRUPO 1: LÓGICA DE PRECIOS (6 Tests)
   * ========================================
   */

  describe('Lógica de Precios', () => {
    it('Debe aplicar precio MINORISTA correctamente', async () => {
      // Setup: Mockear cliente y producto con precios
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      // Mock de la transacción
      prisma.$transaction.mockImplementation(async (callback) => {
        // Simular el contexto de prisma dentro de la transacción
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue(mockVentaCreada),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Crear venta minorista
      const resultado = await service.create(
        mockDtoVentaMinorista,
        mockUsuario.id,
      );

      // Validaciones
      expect(resultado).toBeDefined();
      expect(resultado.message).toBe('Venta registrada exitosamente');
      expect(resultado.venta.tipo_venta).toBe('Minorista');

      // Verificar que se usó el precio minorista (1500)
      expect(Number(resultado.venta.items[0].precio_unitario)).toBe(1500);

      // Verificar subtotal correcto: 1500 * 2 = 3000
      expect(Number(resultado.venta.items[0].subtotal)).toBe(3000);

      // Verificar que se llamó a la transacción
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Debe aplicar precio MAYORISTA correctamente', async () => {
      // Setup
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockImplementation((args) => {
              // Capturar los datos calculados por el servicio
              const { data } = args;
              return Promise.resolve({
                ...mockVentaCreada,
                tipo_venta: data.tipo_venta,
                detalle_venta: data.detalle_venta.create.map((item: any) => ({
                  id: BigInt(1),
                  venta_id: BigInt(1),
                  producto_id: item.producto_id,
                  cantidad: item.cantidad,
                  precio_unitario: item.precio_unitario,
                  subtotal: item.subtotal,
                  productos: {
                    nombre: 'Producto Test Normal',
                  },
                })),
              });
            }),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Crear venta mayorista
      const resultado = await service.create(
        mockDtoVentaMayorista,
        mockUsuario.id,
      );

      // Validaciones
      expect(resultado).toBeDefined();
      expect(resultado.venta.tipo_venta).toBe('Mayorista');

      // Verificar que se usó el precio mayorista (1200)
      expect(Number(resultado.venta.items[0].precio_unitario)).toBe(1200);

      // Verificar subtotal correcto: 1200 * 5 = 6000
      expect(Number(resultado.venta.items[0].subtotal)).toBe(6000);
    });

    it('Debe aplicar precio SUPERMAYORISTA correctamente', async () => {
      // Setup
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockImplementation((args) => {
              // Capturar los datos calculados por el servicio
              const { data } = args;
              return Promise.resolve({
                ...mockVentaCreada,
                tipo_venta: data.tipo_venta,
                detalle_venta: data.detalle_venta.create.map((item: any) => ({
                  id: BigInt(1),
                  venta_id: BigInt(1),
                  producto_id: item.producto_id,
                  cantidad: item.cantidad,
                  precio_unitario: item.precio_unitario,
                  subtotal: item.subtotal,
                  productos: {
                    nombre: 'Producto Test Normal',
                  },
                })),
              });
            }),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Crear venta supermayorista
      const resultado = await service.create(
        mockDtoVentaSupermayorista,
        mockUsuario.id,
      );

      // Validaciones
      expect(resultado).toBeDefined();
      expect(resultado.venta.tipo_venta).toBe('Supermayorista');

      // Verificar que se usó el precio supermayorista (1000)
      expect(Number(resultado.venta.items[0].precio_unitario)).toBe(1000);

      // Verificar subtotal correcto: 1000 * 10 = 10000
      expect(Number(resultado.venta.items[0].subtotal)).toBe(10000);
    });

    it('Debe hacer FALLBACK a precio_lista cuando no hay precios configurados', async () => {
      // Setup: Producto sin precios configurados
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoSinPrecios);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockImplementation((args) => {
              // Capturar los datos calculados por el servicio
              const { data } = args;
              return Promise.resolve({
                ...mockVentaCreada,
                tipo_venta: data.tipo_venta,
                detalle_venta: data.detalle_venta.create.map((item: any) => ({
                  id: BigInt(1),
                  venta_id: BigInt(1),
                  producto_id: item.producto_id,
                  cantidad: item.cantidad,
                  precio_unitario: item.precio_unitario,
                  subtotal: item.subtotal,
                  productos: {
                    nombre: 'Producto Sin Precios',
                  },
                })),
              });
            }),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar
      const resultado = await service.create(
        mockDtoVentaSinPrecios,
        mockUsuario.id,
      );

      // Validaciones
      expect(resultado).toBeDefined();

      // Verificar que se usó el precio_lista (800)
      expect(Number(resultado.venta.items[0].precio_unitario)).toBe(800);

      // NO debe lanzar BadRequestException
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('Debe RECHAZAR venta si precio es 0 o negativo', async () => {
      // Setup: Producto con precio minorista en 0
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoPrecioCero);

      // Ejecutar y validar que lanza excepción
      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow('Precio minorista no configurado');

      // NO se debe llamar a la transacción
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('Debe RECHAZAR venta si producto no existe', async () => {
      // Setup: Producto no encontrado
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(null);

      // Ejecutar y validar que lanza excepción
      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow('Producto con ID');

      // NO se debe crear ninguna venta
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  /**
   * ========================================
   * GRUPO 2: VALIDACIÓN DE STOCK (4 Tests)
   * ========================================
   */

  describe('Validación de Stock', () => {
    it('Debe VALIDAR stock suficiente antes de crear venta', async () => {
      // Setup: Producto con stock suficiente (100)
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue(mockVentaCreada),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Solicitar 2 unidades (hay 100 disponibles)
      const resultado = await service.create(
        mockDtoVentaMinorista,
        mockUsuario.id,
      );

      // Validaciones: La venta debe crearse exitosamente
      expect(resultado).toBeDefined();
      expect(resultado.message).toBe('Venta registrada exitosamente');
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('Debe RECHAZAR venta si stock es INSUFICIENTE', async () => {
      // Setup: Producto con stock bajo (2)
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoStockBajo);

      // Ejecutar: Solicitar 10 unidades (solo hay 2)
      await expect(
        service.create(mockDtoVentaStockInsuficiente, mockUsuario.id),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(mockDtoVentaStockInsuficiente, mockUsuario.id),
      ).rejects.toThrow('Stock insuficiente');

      // Verificar que el mensaje incluye información útil
      await expect(
        service.create(mockDtoVentaStockInsuficiente, mockUsuario.id),
      ).rejects.toThrow('Disponible: 2');

      // NO se debe crear la venta
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('Debe DESCONTAR stock correctamente en la transacción', async () => {
      // Setup
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      let updateSpy: jest.Mock;
      let createMovimientoSpy: jest.Mock;

      prisma.$transaction.mockImplementation(async (callback) => {
        updateSpy = jest.fn().mockResolvedValue({});
        createMovimientoSpy = jest.fn().mockResolvedValue({});

        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue(mockVentaCreada),
          },
          productos: {
            update: updateSpy,
          },
          movimientos_stock: {
            create: createMovimientoSpy,
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Venta de 2 unidades
      await service.create(mockDtoVentaMinorista, mockUsuario.id);

      // Validaciones: Verificar que se actualizó el stock
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: BigInt(1) },
          data: {
            stock_actual: {
              decrement: expect.any(Object), // Decimal
            },
          },
        }),
      );

      // Verificar que se registró el movimiento de stock
      expect(createMovimientoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo_operacion: 'Egreso',
            producto_id: BigInt(1),
          }),
        }),
      );

      // Debe llamarse exactamente 1 vez por producto
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(createMovimientoSpy).toHaveBeenCalledTimes(1);
    });

    it('Debe RECHAZAR venta si producto está INACTIVO', async () => {
      // Setup: Producto inactivo
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoInactivo);

      // Ejecutar
      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create(mockDtoVentaMinorista, mockUsuario.id),
      ).rejects.toThrow('no está activo');

      // NO se debe proceder con la venta
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  /**
   * ========================================
   * GRUPO 3: CÁLCULO DE TOTALES (3 Tests)
   * ========================================
   */

  describe('Cálculo de Totales', () => {
    it('Debe calcular TOTAL correctamente con 1 producto SIN descuento', async () => {
      // Setup
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue(mockVentaCreada),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: 1 producto, precio 1500, cantidad 2, sin descuento
      const resultado = await service.create(
        mockDtoVentaMinorista,
        mockUsuario.id,
      );

      // Validaciones
      expect(resultado.venta.subtotal).toBe('3000.00'); // 1500 * 2
      expect(resultado.venta.descuento).toBe('0.00');
      expect(resultado.venta.total).toBe('3000.00');
    });

    it('Debe calcular TOTAL correctamente con MÚLTIPLES productos', async () => {
      // Setup: Dos productos diferentes
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);

      // Mock para retornar productos diferentes según el ID
      prisma.productos.findUnique.mockImplementation((args) => {
        if (args.where.id === BigInt(1)) {
          return Promise.resolve(mockProductoNormal);
        }
        if (args.where.id === BigInt(6)) {
          return Promise.resolve(mockProductoDecimal);
        }
        return Promise.resolve(null);
      });

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue({
              ...mockVentaCreada,
              detalle_venta: [
                {
                  id: BigInt(1),
                  producto_id: BigInt(1),
                  cantidad: toDecimal(2),
                  precio_unitario: toDecimal(1500),
                  subtotal: toDecimal(3000),
                  productos: { nombre: 'Producto Test Normal' },
                },
                {
                  id: BigInt(2),
                  producto_id: BigInt(6),
                  cantidad: toDecimal(3),
                  precio_unitario: toDecimal(1499.5),
                  subtotal: toDecimal(4498.5),
                  productos: { nombre: 'Producto Decimal' },
                },
              ],
            }),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Venta con 2 productos
      const resultado = await service.create(
        mockDtoVentaMultiple,
        mockUsuario.id,
      );

      // Validaciones
      // Producto 1: 1500 * 2 = 3000
      // Producto 2: 1499.50 * 3 = 4498.50
      // Subtotal General: 3000 + 4498.50 = 7498.50
      expect(resultado.venta.subtotal).toBe('7498.50');
      expect(resultado.venta.total).toBe('7498.50');

      // Verificar subtotales individuales
      expect(Number(resultado.venta.items[0].subtotal)).toBe(3000);
      expect(Number(resultado.venta.items[1].subtotal)).toBe(4498.5);
    });

    it('Debe aplicar DESCUENTO porcentual correctamente', async () => {
      // Setup
      prisma.clientes.findUnique.mockResolvedValue(mockCliente);
      prisma.productos.findUnique.mockResolvedValue(mockProductoNormal);

      prisma.$transaction.mockImplementation(async (callback) => {
        const transactionPrisma = {
          ventas: {
            create: jest.fn().mockResolvedValue({
              ...mockVentaCreada,
              descuento: toDecimal(300), // 10% de 3000
              total: toDecimal(2700), // 3000 - 300
            }),
          },
          productos: {
            update: jest.fn().mockResolvedValue({}),
          },
          movimientos_stock: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(transactionPrisma);
      });

      // Ejecutar: Venta con 10% de descuento
      const dtoConDescuento = {
        ...mockDtoVentaSupermayorista,
        descuento_porcentaje: 10,
      };

      const resultado = await service.create(dtoConDescuento, mockUsuario.id);

      // Validaciones
      // Subtotal: 1000 * 10 = 10000
      // Descuento: 10000 * 0.10 = 1000
      // Total: 10000 - 1000 = 9000
      expect(Number(resultado.venta.descuento)).toBeGreaterThan(0);
      expect(Number(resultado.venta.total)).toBeLessThan(
        Number(resultado.venta.subtotal),
      );
    });
  });
});
