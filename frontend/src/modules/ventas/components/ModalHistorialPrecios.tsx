import { useState } from 'react';
import { X, FileDown, Calendar } from 'lucide-react';
import { useHistorialPrecios } from '../hooks/usePrecios';
import { ProductoConPrecios } from '../api/types';
import * as XLSX from 'xlsx';

interface ModalHistorialPreciosProps {
  producto: ProductoConPrecios;
  onClose: () => void;
}

export default function ModalHistorialPrecios({
  producto,
  onClose,
}: ModalHistorialPreciosProps) {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  const { data: historial, isLoading, error } = useHistorialPrecios(
    producto.id,
    {
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      limite: 100,
    }
  );

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(precio);
  };

  const exportarAExcel = () => {
    if (!historial || historial.length === 0) {
      return;
    }

    const datosExcel = historial.map((item) => ({
      Fecha: formatearFecha(item.fecha),
      Usuario: item.usuario,
      'Precio Minorista': Number(item.precio_minorista),
      'Precio Mayorista': Number(item.precio_mayorista),
      'Precio Supermayorista': Number(item.precio_supermayorista),
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Precios');

    // Ajustar anchos de columnas
    const columnWidths = [
      { wch: 18 }, // Fecha
      { wch: 25 }, // Usuario
      { wch: 18 }, // Precio Minorista
      { wch: 18 }, // Precio Mayorista
      { wch: 20 }, // Precio Supermayorista
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.writeFile(workbook, `Historial_Precios_${producto.nombre}.xlsx`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2c5b2d] border-[5px] border-black rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-[3px] border-black">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#fefbe4' }}>
              Historial de Precios
            </h2>
            <p className="text-lg mt-1" style={{ color: '#afa2c3' }}>
              {producto.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-black hover:bg-opacity-20"
            style={{ color: '#f1eef7' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b-[3px] border-black">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm mb-2" style={{ color: '#fefbe4' }}>
                <Calendar size={16} className="inline mr-2" />
                Desde
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-[3px] border-black bg-[#1a3a1b] text-white focus:outline-none focus:ring-2 focus:ring-[#fefbe4]"
                style={{ color: '#f1eef7' }}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm mb-2" style={{ color: '#fefbe4' }}>
                <Calendar size={16} className="inline mr-2" />
                Hasta
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-[3px] border-black bg-[#1a3a1b] text-white focus:outline-none focus:ring-2 focus:ring-[#fefbe4]"
                style={{ color: '#f1eef7' }}
              />
            </div>

            <button
              onClick={exportarAExcel}
              disabled={!historial || historial.length === 0}
              className="px-6 py-2 rounded-lg border-[3px] border-black flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
                color: '#fff',
              }}
            >
              <FileDown size={18} />
              Exportar a Excel
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading && (
            <div className="text-center py-12" style={{ color: '#f1eef7' }}>
              Cargando historial...
            </div>
          )}

          {error && (
            <div className="text-center py-12" style={{ color: '#FB6564' }}>
              Error al cargar el historial de precios
            </div>
          )}

          {!isLoading && !error && (!historial || historial.length === 0) && (
            <div className="text-center py-12" style={{ color: '#afa2c3' }}>
              No hay historial de cambios de precios para este producto
            </div>
          )}

          {!isLoading && !error && historial && historial.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[3px] border-black">
                    <th
                      className="text-left py-3 px-4"
                      style={{ color: '#fefbe4' }}
                    >
                      Fecha
                    </th>
                    <th
                      className="text-left py-3 px-4"
                      style={{ color: '#fefbe4' }}
                    >
                      Usuario
                    </th>
                    <th
                      className="text-right py-3 px-4"
                      style={{ color: '#fefbe4' }}
                    >
                      Precio Minorista
                    </th>
                    <th
                      className="text-right py-3 px-4"
                      style={{ color: '#fefbe4' }}
                    >
                      Precio Mayorista
                    </th>
                    <th
                      className="text-right py-3 px-4"
                      style={{ color: '#fefbe4' }}
                    >
                      Precio Supermayorista
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b-[2px] hover:bg-black hover:bg-opacity-10 transition-colors"
                      style={{
                        borderColor: 'rgba(175, 162, 195, 0.3)',
                      }}
                    >
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {formatearFecha(item.fecha)}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                        {item.usuario}
                      </td>
                      <td
                        className="py-3 px-4 text-right font-semibold"
                        style={{ color: '#4ade80' }}
                      >
                        {formatearPrecio(Number(item.precio_minorista))}
                      </td>
                      <td
                        className="py-3 px-4 text-right font-semibold"
                        style={{ color: '#4ade80' }}
                      >
                        {formatearPrecio(Number(item.precio_mayorista))}
                      </td>
                      <td
                        className="py-3 px-4 text-right font-semibold"
                        style={{ color: '#4ade80' }}
                      >
                        {formatearPrecio(Number(item.precio_supermayorista))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && historial && historial.length > 0 && (
          <div
            className="p-4 border-t-[3px] border-black text-sm text-center"
            style={{ color: '#afa2c3' }}
          >
            Mostrando {historial.length} registro{historial.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
