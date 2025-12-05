import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useVentaDetalle } from '../hooks/useVentas';

export default function DetalleVentaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: venta, isLoading, error } = useVentaDetalle(id!);

  if (isLoading) {
    return (
      <DashboardLayout title="Detalle de Venta" subtitle="Cargando...">
        <div className="p-8 text-center" style={{ color: '#f1eef7' }}>
          Cargando detalle de venta...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !venta) {
    return (
      <DashboardLayout title="Detalle de Venta" subtitle="Error">
        <div className="p-8 text-center" style={{ color: '#FB6564' }}>
          Error al cargar el detalle de la venta
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Venta #${venta.id}`}
      subtitle={`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`}
    >
      <div className="p-8">
        {/* Botón volver */}
        <button
          onClick={() => navigate('/ventas/lista')}
          className="mb-6 px-4 py-2 rounded-lg border-[3px] bg-transparent transition-all flex items-center gap-2"
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
          <ArrowLeft size={18} />
          Volver a Lista
        </button>

        {/* Información de la venta */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            Información de la Venta
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm mb-1" style={{ color: '#afa2c3' }}>
                Cliente
              </p>
              <p style={{ color: '#f1eef7' }}>{venta.cliente.nombre}</p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: '#afa2c3' }}>
                Tipo Cliente
              </p>
              <p style={{ color: '#f1eef7' }}>{venta.cliente.tipo}</p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: '#afa2c3' }}>
                Tipo de Venta
              </p>
              <p style={{ color: '#f1eef7' }}>{venta.tipo_venta}</p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: '#afa2c3' }}>
                Forma de Pago
              </p>
              <p style={{ color: '#f1eef7' }}>{venta.forma_pago}</p>
            </div>
            <div>
              <p className="text-sm mb-1" style={{ color: '#afa2c3' }}>
                Usuario
              </p>
              <p style={{ color: '#f1eef7' }}>{venta.usuario}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6 mb-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            Productos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-[3px]" style={{ borderColor: '#000' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    Producto
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    Unidad
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    Cantidad
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    Precio Unit.
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    IVA %
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: '#fefbe4' }}>
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b-[2px]"
                    style={{ borderColor: 'rgba(175, 162, 195, 0.3)' }}
                  >
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      {item.producto}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      {item.unidad}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      {item.cantidad}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      ${Number(item.precio_unitario).toFixed(2)}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      {Number(item.iva_porcentaje)}%
                    </td>
                    <td className="py-3 px-4" style={{ color: '#f1eef7' }}>
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="bg-[rgba(44,91,45,0.5)] border-[5px] border-black rounded-lg p-6">
          <h3 className="mb-4" style={{ color: '#fefbe4' }}>
            Resumen
          </h3>

          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between">
              <span style={{ color: '#f1eef7' }}>Descuento:</span>
              <span style={{ color: '#f1eef7' }}>
                ${Number(venta.descuento).toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t-[3px]" style={{ borderColor: '#000' }}>
              <div className="flex justify-between items-center">
                <span className="text-xl" style={{ color: '#fefbe4' }}>
                  TOTAL:
                </span>
                <span
                  className="text-2xl"
                  style={{
                    color: '#4ade80',
                    textShadow: '0 2px 4px rgba(0,0,0,0.25)',
                  }}
                >
                  ${Number(venta.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
