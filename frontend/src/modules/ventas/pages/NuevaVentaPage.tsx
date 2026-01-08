import { useState, useMemo } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { BuscarProductoModal } from '../components/BuscarProductoModal';
import { ConfirmacionModal } from '../components/ConfirmacionModal';
import { useVentas, useClientes } from '../hooks/useVentas';
import { Producto } from '../api/types';

interface ProductoVenta {
  id: string;
  nombre: string;
  precio_unitario: number;
  cantidad: number | string;
  stock_disponible: number;
}

export default function NuevaVentaPage() {
  const [showBuscarProducto, setShowBuscarProducto] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nuevoClienteId, setNuevoClienteId] = useState('');
  const [productos, setProductos] = useState<ProductoVenta[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [tipoVenta, setTipoVenta] = useState<'Minorista' | 'Mayorista' | 'Supermayorista'>('Minorista');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number | ''>('');

  const { data: clientes = [], isLoading: loadingClientes } = useClientes();

  // Filtrar clientes según el tipo de venta
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.tipo.toLowerCase() === tipoVenta.toLowerCase()
    );
  }, [clientes, tipoVenta]);

  const limpiarFormulario = () => {
    setProductos([]);
    setClienteId('');
    setTipoVenta('Minorista');
    setDescuentoPorcentaje('');
    setFormaPago('Efectivo');
  };

  const { createVenta, creandoVenta } = useVentas(limpiarFormulario);

  // Función para obtener el precio correcto según el tipo de venta
  const obtenerPrecioSegunTipo = (producto: Producto): number => {
    const tipoNormalizado = tipoVenta.toLowerCase();

    let precio: number;

    switch (tipoNormalizado) {
      case 'supermayorista':
        precio = Number(producto.precio_supermayorista);
        break;
      case 'mayorista':
        precio = Number(producto.precio_mayorista);
        break;
      case 'minorista':
      default:
        precio = Number(producto.precio_minorista);
    }

    // Validar que el precio sea válido y esté configurado
    if (Number.isNaN(precio) || precio <= 0) {
      console.error(`Precio no configurado para producto ${producto.nombre}:`, precio);
      toast.error(`El producto "${producto.nombre}" no tiene precios configurados. Por favor, configure los precios antes de vender.`);
      return 0;
    }

    return precio;
  };

  const handleClienteChange = (selectedId: string) => {
    if (productos.length > 0) {
      setNuevoClienteId(selectedId);
      setShowConfirmModal(true);
    } else {
      setClienteId(selectedId);

      // Auto-asignar tipo de venta según el tipo de cliente
      if (selectedId) {
        const cliente = clientes.find(c => c.id === selectedId);
        if (cliente) {
          setTipoVenta(cliente.tipo as 'Minorista' | 'Mayorista' | 'Supermayorista');
        }
      }
    }
  };

  const confirmarCambioCliente = () => {
    limpiarFormulario();
    setClienteId(nuevoClienteId);

    // Auto-asignar tipo de venta según el tipo de cliente
    if (nuevoClienteId) {
      const cliente = clientes.find(c => c.id === nuevoClienteId);
      if (cliente) {
        setTipoVenta(cliente.tipo as 'Minorista' | 'Mayorista' | 'Supermayorista');
      }
    }

    setShowConfirmModal(false);
    setNuevoClienteId('');
  };

  const calcularSubtotal = (producto: ProductoVenta) => {
    const cantidad = typeof producto.cantidad === 'number' ? producto.cantidad : parseFloat(producto.cantidad) || 0;
    return producto.precio_unitario * cantidad;
  };

  const calcularTotales = () => {
    const subtotal = productos.reduce(
      (sum, p) => sum + calcularSubtotal(p),
      0
    );
    const descuento = typeof descuentoPorcentaje === 'number' ? descuentoPorcentaje : 0;
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

  const handleAbrirBuscarProducto = () => {
    if (!clienteId) {
      toast.error('Debes seleccionar un cliente antes de agregar productos');
      return;
    }
    setShowBuscarProducto(true);
  };

  const agregarProducto = (producto: Producto) => {
    // Verificar cliente seleccionado
    if (!clienteId) {
      toast.error('Debes seleccionar un cliente antes de agregar productos');
      return;
    }

    // Verificar si el producto ya está en la lista
    const productoExistente = productos.find((p) => p.id === producto.id);

    if (productoExistente) {
      toast.warning('El producto ya está agregado. Puedes modificar la cantidad.');
      return;
    }

    // Calcular precio correcto según tipo de venta
    const precioUnitario = obtenerPrecioSegunTipo(producto);

    setProductos([
      ...productos,
      {
        id: producto.id,
        nombre: producto.nombre,
        precio_unitario: precioUnitario,
        cantidad: 1,
        stock_disponible: Number(producto.stock_actual),
      },
    ]);
  };

  const actualizarCantidad = (id: string, cantidad: number | string) => {
    const producto = productos.find((p) => p.id === id);

    // Permitir string vacío durante edición
    if (cantidad === '') {
      setProductos(
        productos.map((p) => (p.id === id ? { ...p, cantidad: '' } : p))
      );
      return;
    }

    // Validar stock solo si hay número válido
    const cantidadNum = typeof cantidad === 'number' ? cantidad : parseFloat(cantidad);
    if (producto && cantidadNum > producto.stock_disponible) {
      toast.error(
        `Stock insuficiente. Disponible: ${producto.stock_disponible}`
      );
      return;
    }

    setProductos(
      productos.map((p) => (p.id === id ? { ...p, cantidad } : p))
    );
  };

  const handleConfirmarVenta = () => {
    // Validaciones
    if (!clienteId) {
      toast.error('Debes seleccionar un cliente');
      return;
    }

    if (productos.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    // Validar que ningún producto tenga cantidad vacía o cero
    const productosInvalidos = productos.filter(
      p => p.cantidad === '' || p.cantidad === 0 || Number.isNaN(Number(p.cantidad))
    );

    if (productosInvalidos.length > 0) {
      toast.error('Todos los productos deben tener una cantidad válida mayor a 0');
      return;
    }

    // Crear la venta
    createVenta({
      cliente_id: clienteId,
      tipo_venta: tipoVenta,
      forma_pago: formaPago,
      descuento_porcentaje: typeof descuentoPorcentaje === 'number' ? descuentoPorcentaje : 0,
      items: productos.map((p) => ({
        producto_id: p.id,
        cantidad: typeof p.cantidad === 'number' ? p.cantidad : parseFloat(p.cantidad),
        precio_unitario: p.precio_unitario,
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
                {clientesFiltrados.map((cliente) => (
                  <option key={cliente.id} value={cliente.id} style={{ background: '#2c5b2d' }}>
                    {cliente.nombre} {cliente.apellido} - {cliente.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                <span className="md:hidden">Tipo</span>
                <span className="hidden md:inline">Tipo de Venta</span>
              </label>
              <select
                value={tipoVenta}
                onChange={(e) => setTipoVenta(e.target.value as 'Minorista' | 'Mayorista' | 'Supermayorista')}
                disabled={!!clienteId}
                className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                style={{
                  borderColor: '#afa2c3',
                  color: '#f1eef7',
                  opacity: clienteId ? 0.5 : 1,
                  cursor: clienteId ? 'not-allowed' : 'pointer',
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
                <option value="Minorista" style={{ background: '#2c5b2d' }}>
                  Minorista
                </option>
                <option value="Mayorista" style={{ background: '#2c5b2d' }}>
                  Mayorista
                </option>
                <option value="Supermayorista" style={{ background: '#2c5b2d' }}>
                  Supermayorista
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: '#fefbe4' }}>
              <span className="md:hidden">Productos</span>
              <span className="hidden md:inline">Productos de la Venta</span>
            </h3>
            <button
              onClick={handleAbrirBuscarProducto}
              disabled={!clienteId}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              style={{
                background: !clienteId
                  ? 'rgba(175, 162, 195, 0.3)'
                  : 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                color: '#fff',
                opacity: !clienteId ? 0.5 : 1,
                cursor: !clienteId ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (clienteId) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (clienteId) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
                }
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
                  <tr className="border-b-[3px]" style={{ borderColor: '#000' }}>
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
                      <span className="md:hidden">Acc</span>
                      <span className="hidden md:inline">Acción</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr
                      key={producto.id}
                      className="border-b-[2px]"
                      style={{ borderColor: 'rgba(175, 162, 195, 0.3)' }}
                    >
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${Number(producto.precio_unitario).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => {
                            const value = e.target.value;
                            actualizarCantidad(producto.id, value === '' ? '' : parseFloat(value));
                          }}
                          placeholder="1"
                          min="1"
                          max={producto.stock_disponible}
                          className="w-20 px-2 py-1 rounded bg-transparent border-[2px] outline-none"
                          style={{
                            borderColor: '#afa2c3',
                            color: '#f1eef7',
                          }}
                        />
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${calcularSubtotal(producto).toFixed(2)}
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setDescuentoPorcentaje(value === '' ? '' : parseFloat(value));
                  }}
                  min="0"
                  max="100"
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
                    onChange={(e) => setFormaPago(e.target.value as 'Efectivo' | 'Tarjeta' | 'Transferencia')}
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
                    onChange={(e) => setFormaPago(e.target.value as 'Efectivo' | 'Tarjeta' | 'Transferencia')}
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

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="radio"
                    name="tipoPago"
                    value="Transferencia"
                    checked={formaPago === 'Transferencia'}
                    onChange={(e) => setFormaPago(e.target.value as 'Efectivo' | 'Tarjeta' | 'Transferencia')}
                    className="w-5 h-5 appearance-none rounded-full border-[2px] checked:border-[3px] outline-none cursor-pointer"
                    style={{
                      borderColor: formaPago === 'Transferencia' ? '#a03cea' : '#afa2c3',
                      background:
                        formaPago === 'Transferencia'
                          ? 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)'
                          : 'transparent',
                    }}
                  />
                </div>
                <span style={{ color: '#f1eef7' }}>
                  <span className="md:hidden">Transf</span>
                  <span className="hidden md:inline">Transferencia</span>
                </span>
              </label>
            </div>

            <button
              onClick={handleConfirmarVenta}
              disabled={creandoVenta || productos.length === 0 || !clienteId}
              className="w-full px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
              }}
              onMouseEnter={(e) => {
                if (!creandoVenta && productos.length > 0 && clienteId) {
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
            }}
            tipoVenta={tipoVenta}
          />
        )}

        {/* Modal Confirmación Cambio Cliente */}
        {showConfirmModal && (
          <ConfirmacionModal
            mensaje="Cambiar cliente borrará todos los productos. ¿Desea continuar?"
            onConfirm={confirmarCambioCliente}
            onCancel={() => {
              setShowConfirmModal(false);
              setNuevoClienteId('');
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
