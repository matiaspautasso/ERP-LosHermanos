import { useState, useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useProductosConPrecios, useUpdatePrecio } from '../hooks/usePrecios';
import { useCategorias } from '../hooks/useVentas';
import { AjusteMasivoModal } from '@/modules/productos/components/AjusteMasivoModal';
import { ProductoConPrecios } from '../api/types';

export default function GestionPreciosPage() {
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoria: '',
  });
  const [productosSeleccionados, setProductosSeleccionados] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<Record<string, { minorista: number; mayorista: number }>>({});
  const [modalAjusteMasivoAbierto, setModalAjusteMasivoAbierto] = useState(false);

  const { data: productos = [], isLoading } = useProductosConPrecios();
  const { data: categorias = [] } = useCategorias();
  const updatePrecioMutation = useUpdatePrecio();

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const matchNombre = producto.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      const matchCategoria = !filtros.categoria || producto.categoria_id === filtros.categoria;
      return matchNombre && matchCategoria;
    });
  }, [productos, filtros]);

  // Manejar selección de producto
  const handleToggleSeleccion = (productoId: string) => {
    setProductosSeleccionados((prev) =>
      prev.includes(productoId) ? prev.filter((id) => id !== productoId) : [...prev, productoId]
    );
  };

  // Seleccionar/deseleccionar todos
  const handleToggleSeleccionarTodos = () => {
    if (productosSeleccionados.length === productosFiltrados.length) {
      setProductosSeleccionados([]);
    } else {
      setProductosSeleccionados(productosFiltrados.map((p) => p.id));
    }
  };

  // Manejar cambio en precio
  const handlePrecioChange = (productoId: string, tipo: 'minorista' | 'mayorista', valor: string) => {
    const valorNumerico = parseFloat(valor) || 0;
    setPreciosEditados((prev) => ({
      ...prev,
      [productoId]: {
        minorista: tipo === 'minorista' ? valorNumerico : prev[productoId]?.minorista || 0,
        mayorista: tipo === 'mayorista' ? valorNumerico : prev[productoId]?.mayorista || 0,
      },
    }));
  };

  // Obtener precio actual (editado o original)
  const getPrecioActual = (producto: ProductoConPrecios, tipo: 'minorista' | 'mayorista') => {
    return preciosEditados[producto.id]?.[tipo] ?? producto[`precio_${tipo}`];
  };

  // Verificar si hay cambios pendientes
  const hayCambiosPendientes = Object.keys(preciosEditados).length > 0;

  // Guardar cambios individuales
  const handleGuardarCambios = async () => {
    for (const [productoId, precios] of Object.entries(preciosEditados)) {
      await updatePrecioMutation.mutateAsync({
        productoId,
        data: {
          precio_minorista: precios.minorista,
          precio_mayorista: precios.mayorista,
        },
      });
    }
    setPreciosEditados({});
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ nombre: '', categoria: '' });
  };

  return (
    <DashboardLayout title="Gestión de Precios" subtitle="Configurar precios y realizar ajustes masivos">
      <div className="p-8">
        {/* Filtros */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            Filtros de Búsqueda
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
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
                  Todas
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ background: '#2c5b2d' }}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                Nombre
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
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
          </div>

          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 rounded-lg border-[3px] bg-transparent transition-all"
            style={{
              borderColor: '#f1eef7',
              color: '#f1eef7',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1eef7';
              e.currentTarget.style.color = '#2c5b2d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#f1eef7';
            }}
          >
            Limpiar
          </button>
        </div>

        {/* Tabla de precios */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: '#fefbe4' }}>
              Productos ({productosFiltrados.length})
            </h3>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAjusteMasivoAbierto(true)}
                disabled={productosSeleccionados.length === 0}
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                style={{
                  background:
                    productosSeleccionados.length > 0
                      ? 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)'
                      : 'rgba(175, 162, 195, 0.3)',
                  color: '#fff',
                  opacity: productosSeleccionados.length > 0 ? 1 : 0.5,
                  cursor: productosSeleccionados.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                <DollarSign size={18} />
                Ajuste Masivo ({productosSeleccionados.length})
              </button>

              <button
                onClick={handleGuardarCambios}
                disabled={!hayCambiosPendientes || updatePrecioMutation.isPending}
                className="px-4 py-2 rounded-lg border-[3px] bg-transparent transition-all"
                style={{
                  borderColor: hayCambiosPendientes ? '#4ade80' : '#afa2c3',
                  color: hayCambiosPendientes ? '#4ade80' : '#afa2c3',
                  opacity: hayCambiosPendientes ? 1 : 0.5,
                  cursor: hayCambiosPendientes ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={(e) => {
                  if (hayCambiosPendientes) {
                    e.currentTarget.style.backgroundColor = '#4ade80';
                    e.currentTarget.style.color = '#2c5b2d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hayCambiosPendientes) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4ade80';
                  }
                }}
              >
                {updatePrecioMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              Cargando productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              No se encontraron productos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[3px]" style={{ borderColor: '#000' }}>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      <input
                        type="checkbox"
                        checked={productosSeleccionados.length === productosFiltrados.length}
                        onChange={handleToggleSeleccionarTodos}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Producto
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Categoría
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Precio Lista
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Precio Minorista
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Precio Mayorista
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="border-b-[2px] hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ borderColor: 'rgba(175, 162, 195, 0.3)' }}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={productosSeleccionados.includes(producto.id)}
                          onChange={() => handleToggleSeleccion(producto.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.categoria}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#afa2c3' }}>
                        ${Number(producto.precio_lista).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={getPrecioActual(producto, 'minorista')}
                          onChange={(e) => handlePrecioChange(producto.id, 'minorista', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                          style={{
                            borderColor: preciosEditados[producto.id]?.minorista ? '#4ade80' : '#afa2c3',
                            color: '#f1eef7',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#a03cea';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 60, 234, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = preciosEditados[producto.id]?.minorista
                              ? '#4ade80'
                              : '#afa2c3';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={getPrecioActual(producto, 'mayorista')}
                          onChange={(e) => handlePrecioChange(producto.id, 'mayorista', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                          style={{
                            borderColor: preciosEditados[producto.id]?.mayorista ? '#4ade80' : '#afa2c3',
                            color: '#f1eef7',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#a03cea';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(160, 60, 234, 0.2)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = preciosEditados[producto.id]?.mayorista
                              ? '#4ade80'
                              : '#afa2c3';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de ajuste masivo */}
      {modalAjusteMasivoAbierto && (
        <AjusteMasivoModal
          productosSeleccionados={productosSeleccionados}
          onClose={() => {
            setModalAjusteMasivoAbierto(false);
            setProductosSeleccionados([]);
          }}
          onSuccess={() => {
            // Los datos se recargan automáticamente por el hook useAjusteMasivo
            setProductosSeleccionados([]);
          }}
        />
      )}
    </DashboardLayout>
  );
}
