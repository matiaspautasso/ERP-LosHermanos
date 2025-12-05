import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { BuscarProductoModal } from '../components/BuscarProductoModal';
import { useVentas, useClientes } from '../hooks/useVentas';
import { Producto } from '../api/types';

interface ProductoVenta {
  id: string;
  nombre: string;
  precio_lista: number;
  cantidad: number;
  stock_disponible: number;
}

type ListaPrecio = 'Minorista' | 'Mayorista' | 'Supermayorista';

export default function NuevaVentaPage() {
  const [showBuscarProducto, setShowBuscarProducto] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTipoVenta, setPendingTipoVenta] = useState<ListaPrecio | null>(null);
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [tipoVenta, setTipoVenta] = useState<ListaPrecio>('Minorista');
  const [listaPrecio, setListaPrecio] = useState<ListaPrecio>('Minorista');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Tarjeta'>('Efectivo');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number | string>(0);
  const [isMostrador, setIsMostrador] = useState(false);

  const { data: clientes = [], isLoading: loadingClientes } = useClientes();
  const { createVenta, creandoVenta } = useVentas();

  const IVA_PORCENTAJE = 21;

  // Sincronizar lista de precio con tipo de venta al inicio
  useEffect(() => {
    setListaPrecio(tipoVenta);
  }, [tipoVenta]);

  const calcularSubtotal = (producto: ProductoVenta) => {
    return producto.precio_lista * producto.cantidad;
  };

  const calcularIVA = (producto: ProductoVenta) => {
    const subtotal = calcularSubtotal(producto);
    return (subtotal * IVA_PORCENTAJE) / 100;
  };

  const calcularTotales = () => {
    const subtotal = productos.reduce(
      (sum, p) => sum + calcularSubtotal(p) + calcularIVA(p),
      0
    );
    const descuento = typeof descuentoPorcentaje === 'number' ? descuentoPorcentaje : parseFloat(descuentoPorcentaje) || 0;
    const descuentoMonto = (subtotal * descuento) / 100;
    const total = subtotal - descuentoMonto;

    return {
      subtotal: subtotal.toFixed(2),
      descuento: descuentoMonto.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const eliminarProducto = (id: string) => {
    setProductos(productos.filter((p) => p.id !== id));
  };

  const agregarProducto = (producto: Producto) => {
    const productoExistente = productos.find((p) => p.id === producto.id);

    if (productoExistente) {
      toast.warning('El producto ya está agregado. Puedes modificar la cantidad.');
      return;
    }

    setProductos([
      ...productos,
      {
        id: producto.id,
        nombre: producto.nombre,
        precio_lista: Number(producto.precio_lista),
        cantidad: 1,
        stock_disponible: Number(producto.stock_actual),
      },
    ]);
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    const producto = productos.find((p) => p.id === id);

    if (producto && cantidad > producto.stock_disponible) {
      toast.error(
        `Stock insuficiente. Disponible: ${producto.stock_disponible}`
      );
      return;
    }

    setProductos(
      productos.map((p) => (p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p))
    );
  };

  const handleClienteChange = (value: string) => {
    setClienteId(value);

    // Cliente especial "Mostrador"
    if (value === 'MOSTRADOR') {
      setTipoVenta('Minorista');
      setListaPrecio('Minorista');
      setIsMostrador(true);
      return;
    }

    setIsMostrador(false);

    // Autocompletar tipo de venta si el cliente incluye "minorista" en el nombre
    if (value !== '') {
      const clienteSeleccionado = clientes.find((c) => c.id === value);
      if (clienteSeleccionado) {
        const nombreCompleto = `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.toLowerCase();
        if (nombreCompleto.includes('minorista')) {
          setTipoVenta('Minorista');
          setListaPrecio('Minorista');
        }
      }
    }
  };

  const handleTipoVentaChange = (newTipo: ListaPrecio) => {
    // Si hay productos agregados, mostrar modal de confirmación
    if (productos.length > 0) {
      setPendingTipoVenta(newTipo);
      setShowConfirmModal(true);
    } else {
      setTipoVenta(newTipo);
      setListaPrecio(newTipo);
    }
  };

  const confirmarCambioTipoVenta = () => {
    if (pendingTipoVenta) {
      setProductos([]);
      setTipoVenta(pendingTipoVenta);
      setListaPrecio(pendingTipoVenta);
      setPendingTipoVenta(null);
    }
    setShowConfirmModal(false);
  };

  const cancelarCambioTipoVenta = () => {
    setPendingTipoVenta(null);
    setShowConfirmModal(false);
  };

  const handleDescuentoChange = (value: string) => {
    if (value === '') {
      setDescuentoPorcentaje('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setDescuentoPorcentaje(num);
    }
  };

  const handleConfirmarVenta = () => {
    if (!clienteId) {
      toast.error('Debes seleccionar un cliente');
      return;
    }

    if (productos.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    const descuento = typeof descuentoPorcentaje === 'number' ? descuentoPorcentaje : parseFloat(descuentoPorcentaje) || 0;

    createVenta({
      cliente_id: clienteId === 'MOSTRADOR' ? '0' : clienteId,
      tipo_venta: listaPrecio,
      forma_pago: formaPago,
      descuento_porcentaje: descuento,
      items: productos.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: p.precio_lista,
      })),
    });
  };

  const totales = calcularTotales();

  return (
    <DashboardLayout title="Nueva Venta" subtitle="Punto de Venta">
      <div className="p-8">
        {/* Filtros iniciales */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            <span className="md:hidden">Datos Venta</span>
            <span className="hidden md:inline">Datos de la Venta</span>
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                <span className="md:hidden">Cte</span>
                <span className="hidden md:inline">Cliente</span>
              </label>
              <select
                value={clienteId}
                onChange={(e) => handleClienteChange(e.target.value)}
                disabled={loadingClientes}
                className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                style={{
                  borderColor: '#afa2c3',
                  color: '#f1eef7',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a03cea';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 60, 234, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#afa2c3';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ background: '#2c5b2d' }}>
                  Seleccionar cliente...
                </option>
                <option value="MOSTRADOR" style={{ background: '#2c5b2d', fontWeight: 'bold' }}>
                  Mostrador
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id} style={{ background: '#2c5b2d' }}>
                    {cliente.nombre} {cliente.apellido} - {cliente.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                <span className="md:hidden">Lista</span>
                <span className="hidden md:inline">Lista de Precios</span>
              </label>
              <select
                value={listaPrecio}
                onChange={(e) => handleTipoVentaChange(e.target.value as ListaPrecio)}
                disabled={isMostrador}
                className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                style={{
                  borderColor: '#afa2c3',
                  color: '#f1eef7',
                  opacity: isMostrador ? 0.6 : 1,
                  cursor: isMostrador ? 'not-allowed' : 'pointer',
                }}
                onFocus={(e) => {
                  if (!isMostrador) {
                    e.currentTarget.style.borderColor = '#a03cea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 60, 234, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#afa2c3';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="Minorista" style={{ background: '#2c5b2d' }}>
                  Min. (Minorista)
                </option>
                <option value="Mayorista" style={{ background: '#2c5b2d' }}>
                  May. (Mayorista)
                </option>
                <option value="Supermayorista" style={{ background: '#2c5b2d' }}>
                  Supmay. (Supermayorista)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3
              className="pl-2"
              style={{
                color: '#fefbe4',
                borderLeft: '4px solid rgb(136, 21, 19)',
                paddingLeft: '8px'
              }}
            >
              <span className="md:hidden">Productos</span>
              <span className="hidden md:inline">Productos de la Venta</span>
            </h3>
            <button
              onClick={() => setShowBuscarProducto(true)}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              style={{
                background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                color: '#fff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
              }}
            >
              <Plus size={18} />
              <span className="md:hidden">+ Prod</span>
              <span className="hidden md:inline">Agregar Producto</span>
            </button>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              No hay productos agregados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid rgb(136, 21, 19)' }}>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Prod</span>
                      <span className="hidden md:inline">Producto</span>
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Prec</span>
                      <span className="hidden md:inline">Precio</span>
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Cant</span>
                      <span className="hidden md:inline">Cantidad</span>
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Subt</span>
                      <span className="hidden md:inline">Subtotal</span>
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      IVA
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Acc</span>
                      <span className="hidden md:inline">Acción</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr
                      key={producto.id}
                      style={{ borderBottom: '1px solid rgba(136, 21, 19, 0.15)' }}
                    >
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${Number(producto.precio_lista).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(producto.id, parseInt(e.target.value) || 1)
                          }
                          min="1"
                          max={producto.stock_disponible}
                          className="w-20 px-2 py-1 rounded bg-transparent border outline-none transition-all"
                          style={{
                            borderColor: '#afa2c3',
                            color: '#f1eef7',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(136, 21, 19, 0.5)';
                            e.currentTarget.style.boxShadow = '0 0 6px rgba(136, 21, 19, 0.4)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = '1px solid #afa2c3';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${calcularSubtotal(producto).toFixed(2)}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${calcularIVA(producto).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="p-2 rounded hover:bg-[rgba(255,0,0,0.2)] transition-all"
                          style={{ color: '#FB6564' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totales y forma de pago */}
        <div className="grid grid-cols-2 gap-6">
          {/* Totales */}
          <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6">
            <h3 className="mb-4" style={{ color: '#fefbe4' }}>
              <span className="md:hidden">Resumen</span>
              <span className="hidden md:inline">Resumen de Venta</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: '#f1eef7' }}>
                  <span className="md:hidden">Desc (%)</span>
                  <span className="hidden md:inline">Descuento (%)</span>
                </label>
                <input
                  type="number"
                  value={descuentoPorcentaje}
                  onChange={(e) => handleDescuentoChange(e.target.value)}
                  min="0"
                  max="100"
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                  style={{
                    borderColor: '#afa2c3',
                    color: '#f1eef7',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#a03cea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 60, 234, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#afa2c3';
                    e.currentTarget.style.boxShadow = 'none';
                    if (e.target.value === '') {
                      setDescuentoPorcentaje(0);
                    }
                  }}
                />
              </div>

              <div className="pt-4 border-t-[3px]" style={{ borderColor: '#000' }}>
                <div className="flex flex-col gap-2 items-center">
                  <span style={{ color: '#fefbe4' }}>TOTAL</span>
                  <span
                    className="text-lg md:text-xl"
                    style={{
                      color: '#fefbe4',
                      textShadow: '0 2px 4px rgba(0,0,0,0.25)',
                    }}
                  >
                    ${totales.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Forma de pago */}
          <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6">
            <h3 className="mb-4" style={{ color: '#fefbe4' }}>
              <span className="md:hidden">Pago</span>
              <span className="hidden md:inline">Forma de Pago</span>
            </h3>

            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="tipoPago"
                    value="Efectivo"
                    checked={formaPago === 'Efectivo'}
                    onChange={(e) => setFormaPago(e.target.value as 'Efectivo' | 'Tarjeta')}
                    className="w-5 h-5 appearance-none rounded-full border-[2px] checked:border-[3px] outline-none cursor-pointer"
                    style={{
                      borderColor: formaPago === 'Efectivo' ? '#a03cea' : '#afa2c3',
                      background:
                        formaPago === 'Efectivo'
                          ? 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)'
                          : 'transparent',
                    }}
                  />
                </div>
                <span style={{ color: '#f1eef7' }}>
                  <span className="md:hidden">Efec</span>
                  <span className="hidden md:inline">Efectivo</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="tipoPago"
                    value="Tarjeta"
                    checked={formaPago === 'Tarjeta'}
                    onChange={(e) => setFormaPago(e.target.value as 'Efectivo' | 'Tarjeta')}
                    className="w-5 h-5 appearance-none rounded-full border-[2px] checked:border-[3px] outline-none cursor-pointer"
                    style={{
                      borderColor: formaPago === 'Tarjeta' ? '#a03cea' : '#afa2c3',
                      background:
                        formaPago === 'Tarjeta'
                          ? 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)'
                          : 'transparent',
                    }}
                  />
                </div>
                <span style={{ color: '#f1eef7' }}>
                  <span className="md:hidden">Tarj</span>
                  <span className="hidden md:inline">Tarjeta</span>
                </span>
              </label>
            </div>

            <button
              onClick={handleConfirmarVenta}
              disabled={creandoVenta}
              className="w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
              }}
              onMouseEnter={(e) => {
                if (!creandoVenta) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <DollarSign size={20} />
              <span className="md:hidden">{creandoVenta ? 'Procesando...' : 'Confirmar'}</span>
              <span className="hidden md:inline">
                {creandoVenta ? 'Procesando venta...' : 'Confirmar Venta'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Buscar Producto */}
        {showBuscarProducto && (
          <BuscarProductoModal
            onClose={() => setShowBuscarProducto(false)}
            onSelect={(producto) => {
              agregarProducto(producto);
              setShowBuscarProducto(false);
            }}
          />
        )}

        {/* Modal de Confirmación de Cambio de Tipo de Venta */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2c5b2d] border-4 border-black rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={32} style={{ color: '#FB6564' }} />
                <h3 className="text-xl font-bold" style={{ color: '#fefbe4' }}>
                  Advertencia
                </h3>
              </div>
              <p className="mb-6" style={{ color: '#f1eef7' }}>
                Cambiar la lista de precios eliminará los artículos cargados. ¿Confirmar?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelarCambioTipoVenta}
                  className="flex-1 px-4 py-2 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: '#afa2c3',
                    color: '#f1eef7',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#a03cea';
                    e.currentTarget.style.backgroundColor = 'rgba(160, 60, 234, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#afa2c3';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCambioTipoVenta}
                  className="flex-1 px-4 py-2 rounded-lg transition-all text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
