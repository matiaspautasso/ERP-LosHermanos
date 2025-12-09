import { useState } from 'react';
import { Eye, FileDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useVentasList } from '../hooks/useVentas';
import * as XLSX from 'xlsx';

export default function ListaVentasPage() {
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    tipo_venta: '',
  });
  const [ordenFecha, setOrdenFecha] = useState<'asc' | 'desc'>('desc');

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
          background: 'rgba(255, 159, 28, 0.2)',
          color: '#ff9f1c',
          border: '#ff9f1c',
        };
      default:
        return {
          background: 'rgba(251, 101, 100, 0.2)',
          color: '#FB6564',
          border: '#FB6564',
        };
    }
  };

  const exportarAExcel = () => {
    if (!ventas || ventas.length === 0) return;

    const datosExcel = ventas.map((venta) => ({
      'N° Venta': `#${venta.id}`,
      'Fecha': new Date(venta.fecha).toLocaleDateString(),
      'Cliente': venta.cliente,
      'Total': `${Number(venta.total).toFixed(2)}`,
      'Tipo': venta.tipo_venta,
      'Pago': venta.forma_pago,
    }));

    // 1) Crear hoja y libro
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // 2) Escribir libro en binario (array buffer)
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // 3) Crear Blob con MIME de Excel
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 4) Crear URL temporal y disparar descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    link.download = `ventas_${dia}-${mes}-${anio}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ventasOrdenadas = [...ventas].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime();
    const fechaB = new Date(b.fecha).getTime();
    return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
  });

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
              <button
                onClick={exportarAExcel}
                disabled={ventas.length === 0}
                className="w-full mt-4 px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                style={{
                  background: ventas.length === 0
                    ? 'rgba(175, 162, 195, 0.3)'
                    : 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                  color: '#fff',
                  opacity: ventas.length === 0 ? 0.5 : 1,
                  cursor: ventas.length === 0 ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (ventas.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (ventas.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
                  }
                }}
              >
                <FileDown size={18} />
                Exportar
              </button>
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
                      <div className="flex items-center gap-2">
                        Fecha
                        <button
                          onClick={() => setOrdenFecha(ordenFecha === 'asc' ? 'desc' : 'asc')}
                          className="p-1 rounded hover:bg-[rgba(255,255,255,0.1)] transition-all"
                          style={{ color: '#afa2c3' }}
                          title={ordenFecha === 'asc' ? 'Ordenar descendente' : 'Ordenar ascendente'}
                        >
                          {ordenFecha === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </button>
                      </div>
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
                  {ventasOrdenadas.map((venta) => (
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
