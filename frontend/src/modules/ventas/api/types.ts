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
  precio_lista: number;
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
  tipo_venta: 'Minorista' | 'Mayorista';
  forma_pago: 'Efectivo' | 'Tarjeta';
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
    iva: string;
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
    iva_porcentaje: number;
    subtotal: number;
  }[];
}

export interface VentaFilters {
  desde?: string;
  hasta?: string;
  cliente_id?: string;
  tipo_venta?: string;
}
