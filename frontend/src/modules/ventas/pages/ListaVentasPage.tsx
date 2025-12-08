import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useVentasList } from '../hooks/useVentas';

export default function ListaVentasPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    tipo_venta: '',
  });

  const { data: ventas = [], isLoading } = useVentasList(filtros);

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'minorista':
        return {
          background: 'rgba(66, 153, 225, 0.2)',
          color: '#4299e1',
          border: '#4299e1',
        };
      case 'mayorista':
        return {
          background: 'rgba(72, 187, 120, 0.2)',
          color: '#48bb78',
          border: '#48bb78',
        };
      case 'supermayorista':
        return {
          background: 'rgba(160, 60, 234, 0.2)',
          color: '#a03cea',
          border: '#a03cea',
        };
      default:
        return {
          background: 'rgba(251, 101, 100, 0.2)',
          color: '#FB6564',
          border: '#FB6564',
        };
    }
  };

  return (
    <DashboardLayout title="Lista de Ventas" subtitle="Historial de ventas realizadas">
      <div className="p-8">
        {/* Filtros */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            <span className="md:hidden">Filtros</span>
            <span className="hidden md:inline">Filtros de Búsqueda</span>
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                Desde
              </label>
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                style={{
                  borderColor: '#afa2c3',
                  color: '#f1eef7',
                  colorScheme: 'dark',
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

            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                Hasta
              </label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-transparent border-[2px] outline-none transition-all"
                style={{
                  borderColor: '#afa2c3',
                  color: '#f1eef7',
                  colorScheme: 'dark',
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

            <div>
              <label className="block mb-2" style={{ color: '#f1eef7' }}>
                Tipo
              </label>
              <select
                value={filtros.tipo_venta}
                onChange={(e) => setFiltros({ ...filtros, tipo_venta: e.target.value })}
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
                  Todos
                </option>
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

        {/* Tabla de ventas */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ color: '#fefbe4' }}>
              <span className="md:hidden">Ventas</span>
              <span className="hidden md:inline">Listado de Ventas</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              Cargando ventas...
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#f1eef7' }}>
              No se encontraron ventas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[3px]" style={{ borderColor: '#000' }}>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">N° V</span>
                      <span className="hidden md:inline">N° Venta</span>
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      Fecha
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Cte</span>
                      <span className="hidden md:inline">Cliente</span>
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      Total
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      Tipo
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      Pago
                    </th>
                    <th className="text-left py-3 px-8" style={{ color: '#fefbe4' }}>
                      <span className="md:hidden">Acc</span>
                      <span className="hidden md:inline">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr
                      key={venta.id}
                      className="border-b-[2px] hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ borderColor: 'rgba(175, 162, 195, 0.3)' }}
                    >
                      <td className="py-3 px-8" style={{ color: '#fefbe4' }}>
                        #{venta.id}
                      </td>
                      <td className="py-3 px-8" style={{ color: '#f1eef7' }}>
                        {new Date(venta.fecha).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-8" style={{ color: '#f1eef7' }}>
                        {venta.cliente}
                      </td>
                      <td className="py-3 px-8" style={{ color: '#4ade80' }}>
                        ${Number(venta.total).toFixed(2)}
                      </td>
                      <td className="py-3 px-8">
                        <span
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            background: getTipoBadgeColor(venta.tipo_venta).background,
                            color: getTipoBadgeColor(venta.tipo_venta).color,
                            border: `2px solid ${getTipoBadgeColor(venta.tipo_venta).border}`,
                          }}
                        >
                          {venta.tipo_venta}
                        </span>
                      </td>
                      <td className="py-3 px-8" style={{ color: '#f1eef7' }}>
                        {venta.forma_pago}
                      </td>
                      <td className="py-3 px-8">
                        <button
                          onClick={() => navigate(`/ventas/${venta.id}`)}
                          className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
                          style={{ color: '#B2A6C5' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#f1eef7')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#B2A6C5')}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
