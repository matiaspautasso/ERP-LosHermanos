import { useState, useEffect } from 'react';
import { TipoPrecio } from '../api/types';

interface ModalAjusteMasivoProps {
  productosSeleccionados: string[];
  totalProductos: number;
  onAplicar: (config: AjusteMasivoConfig) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface AjusteMasivoConfig {
  porcentaje: number;
  tipo: TipoPrecio;
  aplicarSoloSeleccionados: boolean;
}

export function ModalAjusteMasivo({
  productosSeleccionados,
  totalProductos,
  onAplicar,
  onCancel,
  isLoading = false,
}: ModalAjusteMasivoProps) {
  const [config, setConfig] = useState<AjusteMasivoConfig>({
    porcentaje: 0,
    tipo: 'todos',
    aplicarSoloSeleccionados: productosSeleccionados.length > 0,
  });
  const [porcentajeInput, setPorcentajeInput] = useState<string>('0');
  const [aplicando, setAplicando] = useState(false);

  const productosAfectados = config.aplicarSoloSeleccionados
    ? productosSeleccionados.length
    : totalProductos;

  // Sincronizar estado aplicando cuando termina la carga externa
  useEffect(() => {
    if (!isLoading && aplicando) {
      setAplicando(false);
    }
  }, [isLoading, aplicando]);

  const handleAplicar = () => {
    if (config.porcentaje === 0) {
      alert('El porcentaje no puede ser cero');
      return;
    }

    if (productosAfectados === 0) {
      alert('No hay productos para aplicar el ajuste');
      return;
    }

    setAplicando(true);
    onAplicar(config);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="bg-[#2c5b2d] border-[5px] border-black rounded-lg p-6 w-full max-w-lg mx-4"
        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Header */}
        <h2 className="text-xl mb-2" style={{ color: '#fefbe4' }}>
          Ajuste Masivo de Precios
        </h2>

        <p className="mb-6 text-sm" style={{ color: '#afa2c3' }}>
          Aplica un ajuste porcentual a los precios de los productos seleccionados
        </p>

        {/* Configuración */}
        <div className="space-y-4 mb-6">
          {/* Tipo de Precio */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#f1eef7' }}>
              Aplicar a:
            </label>
            <select
              value={config.tipo}
              onChange={(e) => setConfig({ ...config, tipo: e.target.value as TipoPrecio })}
              className="w-full px-4 py-2 rounded border-[2px]"
              style={{
                borderColor: '#afa2c3',
                background: '#1a3a1b',
                color: '#f1eef7',
              }}
            >
              <option value="minorista">Precios Minoristas</option>
              <option value="mayorista">Precios Mayoristas</option>
              <option value="supermayorista">Precios Supermayoristas</option>
              <option value="todos">Todos los Precios</option>
            </select>
          </div>

          {/* Porcentaje */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#f1eef7' }}>
              Porcentaje de Ajuste (%) {config.porcentaje > 0 ? '↑ Aumento' : config.porcentaje < 0 ? '↓ Descuento' : ''}
            </label>
            <input
              type="number"
              step="0.1"
              value={porcentajeInput}
              onChange={(e) => {
                const value = e.target.value;
                setPorcentajeInput(value);
                setConfig({ ...config, porcentaje: parseFloat(value) || 0 });
              }}
              placeholder="Ej: 10 o -5"
              className="w-full px-4 py-2 rounded border-[2px]"
              style={{
                borderColor: '#afa2c3',
                background: '#1a3a1b',
                color: '#f1eef7',
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#afa2c3' }}>
              Valores positivos aumentan, negativos reducen (Ej: 10 = +10%, -5 = -5%)
            </p>
          </div>

          {/* Solo Seleccionados */}
          {productosSeleccionados.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded border border-[#afa2c3]" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
              <input
                type="checkbox"
                id="soloSeleccionados"
                checked={config.aplicarSoloSeleccionados}
                onChange={(e) =>
                  setConfig({ ...config, aplicarSoloSeleccionados: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="soloSeleccionados" className="text-sm cursor-pointer" style={{ color: '#f1eef7' }}>
                Aplicar solo a productos seleccionados ({productosSeleccionados.length})
              </label>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 rounded border-[2px]" style={{ borderColor: '#FB6564', background: 'rgba(251, 101, 100, 0.1)' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#fefbe4' }}>
            Vista Previa del Ajuste
          </p>
          <p className="text-sm" style={{ color: '#f1eef7' }}>
            Se aplicará un ajuste del <strong>{config.porcentaje}%</strong> a{' '}
            <strong>{productosAfectados} producto{productosAfectados !== 1 ? 's' : ''}</strong>
          </p>
          <p className="text-xs mt-2" style={{ color: '#afa2c3' }}>
            Ejemplo: Un producto de $100 quedará en ${(100 * (1 + config.porcentaje / 100)).toFixed(2)}
          </p>
        </div>

        {/* Warning de procesamiento */}
        {(aplicando || isLoading) && (
          <div className="mb-4 p-3 rounded border-[2px]" style={{ borderColor: '#fb923c', background: 'rgba(251, 146, 60, 0.1)' }}>
            <p className="text-sm" style={{ color: '#fb923c' }}>
              ⚠️ Aplicando ajuste masivo... Por favor, espere.
            </p>
          </div>
        )}

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
            onClick={handleAplicar}
            disabled={aplicando || isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)',
              color: '#fff',
            }}
            onMouseEnter={(e) => {
              if (!aplicando && !isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #fa4a49 0%, #8f2bd1 100%)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FB6564 0%, #A03CEA 100%)';
            }}
          >
            {aplicando || isLoading ? 'Aplicando...' : 'Aplicar Ajuste'}
          </button>
        </div>
      </div>
    </div>
  );
}
