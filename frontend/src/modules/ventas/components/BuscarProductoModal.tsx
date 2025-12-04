import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useProductos, useCategorias } from '../hooks/useVentas';
import { Producto } from '../api/types';

interface BuscarProductoModalProps {
  onClose: () => void;
  onSelect: (producto: Producto) => void;
}

export function BuscarProductoModal({ onClose, onSelect }: BuscarProductoModalProps) {
  const [filtros, setFiltros] = useState({
    nombre: '',
    categoria: '',
  });

  const { data: productos = [], isLoading: loadingProductos } = useProductos(
    filtros.nombre,
    filtros.categoria
  );
  const { data: categorias = [] } = useCategorias();

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', categoria: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-8">
      <div className="bg-[#2c5b2d] border-[5px] border-black rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b-[3px] border-black">
          <h2 style={{ color: '#fefbe4' }}>Buscar Producto</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
            style={{ color: '#B2A6C5' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f1eef7')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#B2A6C5')}
          >
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b-[3px] border-black">
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

        {/* Tabla */}
        <div className="p-6">
          {loadingProductos ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              Cargando productos...
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              No se encontraron productos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[3px]" style={{ borderColor: '#000' }}>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Producto
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Categoría
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Unidad
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Precio
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Stock
                    </th>
                    <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr
                      key={producto.id}
                      className="border-b-[2px] hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ borderColor: 'rgba(175, 162, 195, 0.3)' }}
                    >
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.categorias.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {producto.unidades.nombre}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        ${producto.precio_lista.toFixed(2)}
                      </td>
                      <td
                        className="py-3 px-4"
                        style={{
                          color: producto.stock_actual > producto.stock_minimo ? '#4ade80' : '#FB6564',
                        }}
                      >
                        {producto.stock_actual}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelect(producto)}
                          className="px-3 py-1.5 rounded-lg transition-all text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                            color: '#fff',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
                          }}
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-[3px] border-black flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-[3px] bg-transparent transition-all"
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
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
