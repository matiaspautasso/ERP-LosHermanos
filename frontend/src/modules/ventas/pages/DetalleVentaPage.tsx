import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useVentaDetalle } from '../hooks/useVentas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo-los-hermanos.png';

export default function DetalleVentaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: venta, isLoading, error } = useVentaDetalle(id!);

  const exportarAPDF = () => {
    if (!venta) {
      console.error('No hay datos de venta para exportar');
      return;
    }

    // 📄 Crear PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 🎨 Colores institucionales
    const colorVerde: [number, number, number] = [44, 91, 45]; // #2C5B2D
    const colorCrema: [number, number, number] = [254, 251, 228]; // #FEFBE4
    const colorRojo: [number, number, number] = [136, 21, 19]; // #881513

    const pageWidth = 210;
    const pageHeight = 297;

    // 🟩 MARCO PERIMETRAL VERDE
    doc.setDrawColor(...colorVerde);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // 🔴 LEYENDA SUPERIOR "NO VÁLIDO COMO COMPROBANTE FISCAL"
    doc.setFontSize(12);
    doc.setTextColor(...colorRojo);
    doc.setFont('helvetica', 'bold');
    const leyenda = 'NO VÁLIDO COMO COMPROBANTE FISCAL';
    const leyendaWidth = doc.getTextWidth(leyenda);
    doc.text(leyenda, (pageWidth - leyendaWidth) / 2, 12);

    // ❌ RECUADRO CON X GRANDE AL CENTRO
    const xBoxSize = 30;
    const xBoxX = (pageWidth - xBoxSize) / 2;
    const xBoxY = 18;

    // Borde del recuadro X
    doc.setDrawColor(...colorVerde);
    doc.setLineWidth(0.8);
    doc.rect(xBoxX, xBoxY, xBoxSize, xBoxSize);

    // X gigante centrada
    doc.setFontSize(60);
    doc.setTextColor(...colorRojo);
    doc.setFont('helvetica', 'bold');
    const xText = 'X';
    const xTextWidth = doc.getTextWidth(xText);
    doc.text(xText, xBoxX + (xBoxSize - xTextWidth) / 2, xBoxY + 22);

    // 🖼️ LOGO CON MINI BORDE (arriba derecha)
    const logoWidth = 40;
    const logoHeight = 20;
    const logoX = pageWidth - logoWidth - 14;
    const logoY = 10;

    doc.setDrawColor(...colorVerde);
    doc.setLineWidth(0.5);
    doc.rect(logoX - 2, logoY - 2, logoWidth + 4, logoHeight + 4);
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // 📌 Título (Venta #ID)
    doc.setFontSize(18);
    doc.setTextColor(...colorVerde);
    doc.setFont('helvetica', 'bold');
    doc.text(`Venta #${venta.id}`, 14, 58);

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 14, 65);

    // 📋 1. Información de la Venta
    doc.setFontSize(14);
    doc.setTextColor(...colorVerde);
    doc.setFont('helvetica', 'bold');
    doc.text('Información de la Venta', 14, 76);

    const infoData = [
      ['Cliente:', venta.cliente.nombre],
      ['Tipo de Cliente:', venta.cliente.tipo],
      ['Tipo de Venta:', venta.tipo_venta],
      ['Forma de Pago:', venta.forma_pago],
      ['Usuario:', venta.usuario],
    ];

    autoTable(doc, {
      startY: 81,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      body: infoData,
    });

    // 📦 2. Productos
    doc.setFontSize(14);
    doc.setTextColor(...colorVerde);
    doc.setFont('helvetica', 'bold');
    doc.text('Productos', 14, (doc as any).lastAutoTable.finalY + 12);

    const productosData = venta.items.map((item) => [
      item.producto,
      item.unidad,
      item.cantidad,
      `$${Number(item.precio_unitario).toFixed(2)}`,
      `$${Number(item.subtotal).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 17,
      head: [['Producto', 'Unidad', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: productosData,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: colorVerde,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // 💰 3. Resumen
    doc.setFontSize(14);
    doc.setTextColor(...colorVerde);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 14, (doc as any).lastAutoTable.finalY + 12);

    const resumenY = (doc as any).lastAutoTable.finalY + 17;

    // Descuento (normal)
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Descuento:', 14, resumenY);
    doc.setFont('helvetica', 'normal');
    doc.text(`$${Number(venta.descuento).toFixed(2)}`, 70, resumenY);

    // 💰 TOTAL CON FONDO CREMA Y BORDE VERDE
    const totalY = resumenY + 10;
    const totalBoxX = 14;
    const totalBoxWidth = 100;
    const totalBoxHeight = 12;

    // Fondo crema
    doc.setFillColor(...colorCrema);
    doc.rect(totalBoxX, totalY - 8, totalBoxWidth, totalBoxHeight, 'F');

    // Borde verde
    doc.setDrawColor(...colorVerde);
    doc.setLineWidth(0.8);
    doc.rect(totalBoxX, totalY - 8, totalBoxWidth, totalBoxHeight);

    // Texto TOTAL en rojo
    doc.setFontSize(14);
    doc.setTextColor(...colorRojo);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', totalBoxX + 5, totalY);

    doc.setFontSize(16);
    doc.text(`$${Number(venta.total).toFixed(2)}`, totalBoxX + 50, totalY);

    // 💾 Guardar PDF
    doc.save(`venta_${venta.id}.pdf`);
  };

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
      <div id="detalle-venta-container" className="p-8">
        {/* Botones de acción */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => navigate('/ventas/lista')}
            className="px-4 py-2 rounded-lg border-[3px] bg-transparent transition-all flex items-center gap-2"
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

          <button
            id="btn-exportar-pdf"
            onClick={exportarAPDF}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
              color: '#fff',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
            }}
          >
            <FileDown size={20} />
            Exportar PDF
          </button>
        </div>

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
