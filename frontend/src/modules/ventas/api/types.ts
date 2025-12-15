// ===== CLIENTES =====
export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  correo?: string;
  tipo: string;
  fecha_alta: string;
}

// ===== PRODUCTOS =====
export interface Producto {
  id: string;
  nombre: string;
  precio_minorista: number;
  precio_mayorista: number;
  precio_supermayorista: number;
  stock_actual: number;
  stock_minimo: number;
  iva_porcentaje: number;
  descripcion?: string;
  categorias: {
    id: string;
    nombre: string;
  };
  unidades: {
    id: string;
    nombre: string;
  };
}

export interface Categoria {
  id: string;
  nombre: string;
}

// ===== VENTAS =====
export interface VentaItem {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CreateVentaRequest {
  cliente_id: string;
  tipo_venta: 'minorista' | 'mayorista' | 'supermayorista';
  forma_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  descuento_porcentaje: number;
  items: VentaItem[];
}

export interface VentaResponse {
  message: string;
  venta: {
    id: string;
    fecha: string;
    cliente: string;
    tipo_venta: string;
    forma_pago: string;
    subtotal: string;
    descuento: string;
    total: string;
    items: {
      producto: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }[];
  };
}

export interface VentaListItem {
  id: string;
  fecha: string;
  cliente: string;
  tipo_venta: string;
  forma_pago: string;
  total: number;
  descuento: number;
}

export interface VentaDetalle {
  id: string;
  fecha: string;
  cliente: {
    nombre: string;
    tipo: string;
  };
  tipo_venta: string;
  forma_pago: string;
  descuento: number;
  total: number;
  usuario: string;
  items: {
    producto: string;
    unidad: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
}

export interface VentaFilters {
  desde?: string;
  hasta?: string;
  cliente_id?: string;
  tipo_venta?: string;
}

// ===== GESTIÓN DE PRECIOS =====
export interface ProductoConPrecios {
  id: string;
  nombre: string;
  categoria: string;
  categoria_id: string;
  precio_minorista: number;
  precio_mayorista: number;
  precio_supermayorista: number;
  ultima_modificacion?: string;
  tiene_precios_configurados: boolean;
}

export interface UpdatePrecioRequest {
  precio_minorista: number;
  precio_mayorista: number;
  precio_supermayorista: number;
}

export interface UpdatePrecioResponse {
  message: string;
  precio: {
    id: string;
    producto_id: string;
    precio_minorista: number;
    precio_mayorista: number;
    precio_supermayorista: number;
  };
}

export type TipoPrecio = 'minorista' | 'mayorista' | 'supermayorista' | 'todos';

export interface AjusteMasivoRequest {
  producto_ids: number[];
  porcentaje: number;
  tipo: TipoPrecio;
}

export interface AjusteMasivoResponse {
  message: string;
  productos_actualizados: number;
}

export interface HistorialPrecio {
  id: string;
  fecha: string;
  usuario: string;
  precio_minorista: number;
  precio_mayorista: number;
  precio_supermayorista: number;
}

export interface HistorialPreciosParams {
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
}
