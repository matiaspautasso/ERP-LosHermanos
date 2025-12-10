import { useState } from 'react';
import { UpdatePrecioRequest } from '../api/types';

interface ModalEditarPrecioProps {
  producto: {
    id: string;
    nombre: string;
    precio_minorista: number;
    precio_mayorista: number;
    precio_supermayorista: number;
  };
  onSave: (productoId: string, precios: UpdatePrecioRequest) => void;
  onCancel: () => void;
}

export function ModalEditarPrecio({ producto, onSave, onCancel }: ModalEditarPrecioProps) {
  // Permitir valores string o number para manejar campos vacíos temporalmente
  const [precios, setPrecios] = useState<{
    precio_minorista: number | string;
    precio_mayorista: number | string;
    precio_supermayorista: number | string;
  }>({
    precio_minorista: producto.precio_minorista,
    precio_mayorista: producto.precio_mayorista,
    precio_supermayorista: producto.precio_supermayorista,
  });

  const handleGuardar = () => {
    // Convertir a números y validar
    const minorista = typeof precios.precio_minorista === 'string'
      ? parseFloat(precios.precio_minorista)
      : precios.precio_minorista;
    const mayorista = typeof precios.precio_mayorista === 'string'
      ? parseFloat(precios.precio_mayorista)
      : precios.precio_mayorista;
    const supermayorista = typeof precios.precio_supermayorista === 'string'
      ? parseFloat(precios.precio_supermayorista)
      : precios.precio_supermayorista;

    // Validar que todos los precios sean positivos
    if (
      isNaN(minorista) || minorista <= 0 ||
      isNaN(mayorista) || mayorista <= 0 ||
      isNaN(supermayorista) || supermayorista <= 0
    ) {
      alert('Todos los precios deben ser mayores a cero');
      return;
    }

    onSave(producto.id, {
      precio_minorista: minorista,
      precio_mayorista: mayorista,
      precio_supermayorista: supermayorista,
    });
  };

  // Manejar blur para validar y asignar valor por defecto si es necesario
  const handleBlur = (campo: 'precio_minorista' | 'precio_mayorista' | 'precio_supermayorista') => {
    const valor = precios[campo];
    if (valor === '' || valor === null || valor === undefined) {
      // Si está vacío, restaurar el precio original del producto
      setPrecios({
        ...precios,
        [campo]: producto[campo],
      });
    } else if (typeof valor === 'string') {
      // Convertir a número si es válido
      const numero = parseFloat(valor);
      if (!isNaN(numero)) {
        setPrecios({
          ...precios,
          [campo]: numero,
        });
      } else {
        // Si no es válido, restaurar el precio original
        setPrecios({
          ...precios,
          [campo]: producto[campo],
        });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="bg-[#2c5b2d] border-[5px] border-black rounded-lg p-6 w-full max-w-md mx-4"
        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Header */}
        <h2 className="text-xl mb-2" style={{ color: '#fefbe4' }}>
          Editar Precios
        </h2>

        {/* Nombre del producto */}
        <div className="mb-6 p-3 rounded border border-[#afa2c3]" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
          <p className="text-sm" style={{ color: '#afa2c3' }}>
            Producto
          </p>
          <p className="font-semibold" style={{ color: '#fefbe4' }}>
            {producto.nombre}
          </p>
        </div>

        {/* Inputs de precios */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#f1eef7' }}>
              Precio Minorista
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precios.precio_minorista}
              onChange={(e) =>
                setPrecios({ ...precios, precio_minorista: e.target.value })
              }
              onBlur={() => handleBlur('precio_minorista')}
              className="w-full px-4 py-2 rounded border-[2px]"
              style={{
                borderColor: '#afa2c3',
                background: '#1a3a1b',
                color: '#f1eef7',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#f1eef7' }}>
              Precio Mayorista
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precios.precio_mayorista}
              onChange={(e) =>
                setPrecios({ ...precios, precio_mayorista: e.target.value })
              }
              onBlur={() => handleBlur('precio_mayorista')}
              className="w-full px-4 py-2 rounded border-[2px]"
              style={{
                borderColor: '#afa2c3',
                background: '#1a3a1b',
                color: '#f1eef7',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#f1eef7' }}>
              Precio Supermayorista
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precios.precio_supermayorista}
              onChange={(e) =>
                setPrecios({ ...precios, precio_supermayorista: e.target.value })
              }
              onBlur={() => handleBlur('precio_supermayorista')}
              className="w-full px-4 py-2 rounded border-[2px]"
              style={{
                borderColor: '#afa2c3',
                background: '#1a3a1b',
                color: '#f1eef7',
              }}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border-[2px] transition-all"
            style={{
              borderColor: '#afa2c3',
              color: '#f1eef7',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#a03cea';
              e.currentTarget.style.background = 'rgba(160, 60, 234, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#afa2c3';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleGuardar}
            className="flex-1 px-4 py-2.5 rounded-lg transition-all"
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
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
