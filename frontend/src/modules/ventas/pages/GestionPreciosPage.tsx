import { useState, useMemo } from 'react';
import { DollarSign, Edit, FileDown, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useProductosConPrecios, useUpdatePrecio, useAjusteMasivo } from '../hooks/usePrecios';
import { useCategorias } from '../hooks/useVentas';
import { ModalEditarPrecio } from '../components/ModalEditarPrecio';
import { ModalAjusteMasivo } from '../components/ModalAjusteMasivo';
import ModalHistorialPrecios from '../components/ModalHistorialPrecios';
import { ProductoConPrecios } from '../api/types';

export default function GestionPreciosPage() {
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoria: '',
  });
  const [productosSeleccionados, setProductosSeleccionados] = useState<string[]>([]);
  const [productoEditando, setProductoEditando] = useState<ProductoConPrecios | null>(null);
  const [modalAjusteMasivoAbierto, setModalAjusteMasivoAbierto] = useState(false);
  const [productoHistorial, setProductoHistorial] = useState<ProductoConPrecios | null>(null);

  const { data: productos = [], isLoading } = useProductosConPrecios();
  const { data: categorias = [] } = useCategorias();
  const updatePrecioMutation = useUpdatePrecio();
  const ajusteMasivoMutation = useAjusteMasivo();

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

  // Guardar precio individual
  const handleGuardarPrecio = (productoId: string, precios: any) => {
    updatePrecioMutation.mutate(
      { productoId, data: precios },
      {
        onSuccess: () => {
          setProductoEditando(null);
        },
      }
    );
  };

  // Aplicar ajuste masivo
  const handleAjusteMasivo = (config: any) => {
    const productosIds = config.aplicarSoloSeleccionados
      ? productosSeleccionados.map((id) => parseInt(id))
      : productosFiltrados.map((p) => parseInt(p.id));

    ajusteMasivoMutation.mutate(
      {
        producto_ids: productosIds,
        porcentaje: config.porcentaje,
        tipo: config.tipo,
      },
      {
        onSuccess: () => {
          setModalAjusteMasivoAbierto(false);
          setProductosSeleccionados([]);
        },
      }
    );
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({ nombre: '', categoria: '' });
  };

  // Exportar a Excel
  const exportarAExcel = () => {
    if (productosFiltrados.length === 0) {
      console.warn('No hay productos para exportar');
      return;
    }

    // Preparar datos para Excel
    const datosExcel = productosFiltrados.map((producto) => ({
      Producto: producto.nombre,
      Categoría: producto.categoria,
      Minorista: `$${Number(producto.precio_minorista).toFixed(2)}`,
      Mayorista: `$${Number(producto.precio_mayorista).toFixed(2)}`,
      Supermayorista: `$${Number(producto.precio_supermayorista).toFixed(2)}`,
    }));

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Precios');

    // Generar nombre de archivo con fecha actual
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const año = fecha.getFullYear();
    const nombreArchivo = `precios_${dia}-${mes}-${año}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(workbook, nombreArchivo);
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
                onClick={exportarAExcel}
                disabled={productosFiltrados.length === 0}
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                style={{
                  background: productosFiltrados.length === 0
                    ? '#4a5568'
                    : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: '#fff',
                  opacity: productosFiltrados.length === 0 ? 0.6 : 1,
                  cursor: productosFiltrados.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (productosFiltrados.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (productosFiltrados.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                  }
                }}
              >
                <FileDown size={18} />
                Exportar Excel
              </button>

              <button
                onClick={() => setModalAjusteMasivoAbierto(true)}
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2"
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
                <DollarSign size={18} />
                Ajuste Masivo
                {productosSeleccionados.length > 0 && ` (${productosSeleccionados.length})`}
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
                    <th className="text-right py-3 px-4" style={{ color: '#fefbe4' }}>
                      Minorista
                    </th>
                    <th className="text-right py-3 px-4" style={{ color: '#fefbe4' }}>
                      Mayorista
                    </th>
                    <th className="text-right py-3 px-4" style={{ color: '#fefbe4' }}>
                      Supermayorista
                    </th>
                    <th className="text-center py-3 px-4" style={{ color: '#fefbe4' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => (
                    <tr
                      key={producto.id}
                      className="border-b-[2px] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
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
                      <td className="py-3 px-4" style={{ color: '#afa2c3' }}>
                        {producto.categoria}
                      </td>
                      <td className="py-3 px-4 text-right font-mono" style={{ color: '#4ade80' }}>
                        ${Number(producto.precio_minorista).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono" style={{ color: '#fb923c' }}>
                        ${Number(producto.precio_mayorista).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono" style={{ color: '#a78bfa' }}>
                        ${Number(producto.precio_supermayorista).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setProductoEditando(producto)}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              color: '#a03cea',
                              background: 'rgba(160, 60, 234, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(160, 60, 234, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(160, 60, 234, 0.1)';
                            }}
                            title="Editar precio"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setProductoHistorial(producto)}
                            className="p-2 rounded-lg transition-all"
                            style={{
                              color: '#48bb78',
                              background: 'rgba(72, 187, 120, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(72, 187, 120, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(72, 187, 120, 0.1)';
                            }}
                            title="Ver historial"
                          >
                            <History size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de edición individual */}
      {productoEditando && (
        <ModalEditarPrecio
          producto={productoEditando}
          onSave={handleGuardarPrecio}
          onCancel={() => setProductoEditando(null)}
        />
      )}

      {/* Modal de ajuste masivo */}
      {modalAjusteMasivoAbierto && (
        <ModalAjusteMasivo
          productosSeleccionados={productosSeleccionados}
          totalProductos={productosFiltrados.length}
          onAplicar={handleAjusteMasivo}
          onCancel={() => setModalAjusteMasivoAbierto(false)}
        />
      )}

      {/* Modal de historial de precios */}
      {productoHistorial && (
        <ModalHistorialPrecios
          producto={productoHistorial}
          onClose={() => setProductoHistorial(null)}
        />
      )}
    </DashboardLayout>
  );
}
