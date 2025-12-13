import { Decimal } from '@prisma/client/runtime/library';

/**
 * Helper para convertir números a Decimal de Prisma
 */
export const toDecimal = (value: number): Decimal => {
  return new Decimal(value);
};

/**
 * Mock de Usuario Vendedor
 */
export const mockUsuario = {
  id: BigInt(1),
  username: 'vendedor_test',
  email: 'vendedor@test.com',
  password_hash: 'hashed_password',
  activo: true,
  fecha_creacion: new Date('2024-01-01'),
};

/**
 * Mock de Cliente
 */
export const mockCliente = {
  id: BigInt(1),
  nombre: 'Juan',
  apellido: 'Pérez',
  telefono: '1234567890',
  correo: 'juan.perez@test.com',
  tipo: 'Minorista',
  activo: true,
  fecha_alta: new Date('2024-01-01'),
};

/**
 * Mock de Producto Normal con Precios Completos
 */
export const mockProductoNormal = {
  id: BigInt(1),
  nombre: 'Producto Test Normal',
  descripcion: 'Descripción de prueba',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(1000),
  stock_actual: toDecimal(100),
  stock_minimo: toDecimal(10),
  activo: true,
  precios: [
    {
      id: BigInt(1),
      producto_id: BigInt(1),
      precio_minorista: toDecimal(1500),
      precio_mayorista: toDecimal(1200),
      precio_supermayorista: toDecimal(1000),
      ultima_modificacion: new Date('2024-01-01'),
    },
  ],
};

/**
 * Mock de Producto Sin Precios (solo precio_lista)
 */
export const mockProductoSinPrecios = {
  id: BigInt(2),
  nombre: 'Producto Sin Precios',
  descripcion: 'Sin precios configurados',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(800),
  stock_actual: toDecimal(50),
  stock_minimo: toDecimal(5),
  activo: true,
  precios: [],
};

/**
 * Mock de Producto con Stock Bajo
 */
export const mockProductoStockBajo = {
  id: BigInt(3),
  nombre: 'Producto Stock Bajo',
  descripcion: 'Producto con stock limitado',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(500),
  stock_actual: toDecimal(2),
  stock_minimo: toDecimal(10),
  activo: true,
  precios: [
    {
      id: BigInt(3),
      producto_id: BigInt(3),
      precio_minorista: toDecimal(750),
      precio_mayorista: toDecimal(600),
      precio_supermayorista: toDecimal(500),
      ultima_modificacion: new Date('2024-01-01'),
    },
  ],
};

/**
 * Mock de Producto Inactivo
 */
export const mockProductoInactivo = {
  id: BigInt(4),
  nombre: 'Producto Inactivo',
  descripcion: 'Producto desactivado',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(1200),
  stock_actual: toDecimal(100),
  stock_minimo: toDecimal(10),
  activo: false,
  precios: [
    {
      id: BigInt(4),
      producto_id: BigInt(4),
      precio_minorista: toDecimal(1800),
      precio_mayorista: toDecimal(1500),
      precio_supermayorista: toDecimal(1200),
      ultima_modificacion: new Date('2024-01-01'),
    },
  ],
};

/**
 * Mock de Producto con Precio Minorista en 0
 */
export const mockProductoPrecioCero = {
  id: BigInt(5),
  nombre: 'Producto Precio Cero',
  descripcion: 'Precio minorista en 0',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(1000),
  stock_actual: toDecimal(50),
  stock_minimo: toDecimal(5),
  activo: true,
  precios: [
    {
      id: BigInt(5),
      producto_id: BigInt(5),
      precio_minorista: toDecimal(0),
      precio_mayorista: toDecimal(1000),
      precio_supermayorista: toDecimal(800),
      ultima_modificacion: new Date('2024-01-01'),
    },
  ],
};

/**
 * Mock de Producto con Precios Decimales
 */
export const mockProductoDecimal = {
  id: BigInt(6),
  nombre: 'Producto Decimal',
  descripcion: 'Producto con precios decimales',
  categoria_id: BigInt(1),
  unidad_id: BigInt(1),
  precio_lista: toDecimal(999.99),
  stock_actual: toDecimal(100),
  stock_minimo: toDecimal(10),
  activo: true,
  precios: [
    {
      id: BigInt(6),
      producto_id: BigInt(6),
      precio_minorista: toDecimal(1499.5),
      precio_mayorista: toDecimal(1199.75),
      precio_supermayorista: toDecimal(999.99),
      ultima_modificacion: new Date('2024-01-01'),
    },
  ],
};

/**
 * DTOs de Venta - Diferentes Escenarios
 */

// DTO 1: Venta Minorista Simple (1 producto)
export const mockDtoVentaMinorista = {
  cliente_id: '1',
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento_porcentaje: 0,
  items: [
    {
      producto_id: '1',
      cantidad: 2,
      precio_unitario: 1500,
    },
  ],
};

// DTO 2: Venta Mayorista (1 producto)
export const mockDtoVentaMayorista = {
  cliente_id: '1',
  tipo_venta: 'Mayorista',
  forma_pago: 'Tarjeta',
  descuento_porcentaje: 5,
  items: [
    {
      producto_id: '1',
      cantidad: 5,
      precio_unitario: 1200,
    },
  ],
};

// DTO 3: Venta Supermayorista (1 producto)
export const mockDtoVentaSupermayorista = {
  cliente_id: '1',
  tipo_venta: 'Supermayorista',
  forma_pago: 'Transferencia',
  descuento_porcentaje: 10,
  items: [
    {
      producto_id: '1',
      cantidad: 10,
      precio_unitario: 1000,
    },
  ],
};

// DTO 4: Venta con Múltiples Productos
export const mockDtoVentaMultiple = {
  cliente_id: '1',
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento_porcentaje: 0,
  items: [
    {
      producto_id: '1',
      cantidad: 2,
      precio_unitario: 1500,
    },
    {
      producto_id: '6',
      cantidad: 3,
      precio_unitario: 1499.5,
    },
  ],
};

// DTO 5: Venta con Stock Insuficiente
export const mockDtoVentaStockInsuficiente = {
  cliente_id: '1',
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento_porcentaje: 0,
  items: [
    {
      producto_id: '3',
      cantidad: 10,
      precio_unitario: 500,
    },
  ],
};

// DTO 6: Venta con Producto Sin Precios (fallback a precio_lista)
export const mockDtoVentaSinPrecios = {
  cliente_id: '1',
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento_porcentaje: 0,
  items: [
    {
      producto_id: '2',
      cantidad: 1,
      precio_unitario: 800,
    },
  ],
};

// DTO 7: Venta con Cantidad Decimal
export const mockDtoVentaCantidadDecimal = {
  cliente_id: '1',
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento_porcentaje: 0,
  items: [
    {
      producto_id: '1',
      cantidad: 2.5,
      precio_unitario: 1500,
    },
  ],
};

/**
 * Mock de Venta Creada (respuesta de la BD)
 */
export const mockVentaCreada = {
  id: BigInt(1),
  cliente_id: BigInt(1),
  usuario_id: BigInt(1),
  tipo_venta: 'Minorista',
  forma_pago: 'Efectivo',
  descuento: toDecimal(0),
  total: toDecimal(3000),
  fecha: new Date('2024-01-15'),
  clientes: {
    nombre: 'Juan',
    apellido: 'Pérez',
  },
  detalle_venta: [
    {
      id: BigInt(1),
      venta_id: BigInt(1),
      producto_id: BigInt(1),
      cantidad: toDecimal(2),
      precio_unitario: toDecimal(1500),
      subtotal: toDecimal(3000),
      productos: {
        nombre: 'Producto Test Normal',
      },
    },
  ],
  user: {
    username: 'vendedor_test',
  },
};

/**
 * Mock completo de PrismaService
 */
export const createMockPrismaService = () => {
  return {
    clientes: {
      findUnique: jest.fn(),
    },
    productos: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ventas: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    movimientos_stock: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
};
