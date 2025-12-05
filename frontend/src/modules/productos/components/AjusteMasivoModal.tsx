import React, { useState, useMemo } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useProductosConPrecios, useAjusteMasivo } from '@/modules/ventas/hooks/usePrecios';
import { TipoPrecio } from '@/modules/ventas/api/types';
import { toast } from 'sonner';

interface AjusteMasivoModalProps {
  productosSeleccionados: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const AjusteMasivoModal: React.FC<AjusteMasivoModalProps> = ({
  productosSeleccionados,
  onClose,
  onSuccess
}) => {
  const [tipoPrecio, setTipoPrecio] = useState<TipoPrecio>('ambos');
  const [porcentaje, setPorcentaje] = useState<string>('');

  const { data: todosLosProductos = [], isLoading } = useProductosConPrecios();
  const ajusteMasivoMutation = useAjusteMasivo();

  // Filtrar solo los productos seleccionados
  const productosAMostrar = useMemo(() => {
    return todosLosProductos.filter(p => productosSeleccionados.includes(p.id));
  }, [todosLosProductos, productosSeleccionados]);

  const calculateNewPrice = (currentPrice: number): number => {
    const value = parseFloat(porcentaje) || 0;
    return currentPrice + (currentPrice * value / 100);
  };

  const handleApplyAdjustment = async () => {
    if (!porcentaje || productosSeleccionados.length === 0) {
      toast.error('Define un valor de ajuste');
      return;
    }

    try {
      // Convertir IDs de string a number para el backend
      const productoIds = productosSeleccionados.map(id => parseInt(id, 10));

      await ajusteMasivoMutation.mutateAsync({
        producto_ids: productoIds,
        porcentaje: parseFloat(porcentaje),
        tipo: tipoPrecio,
      });

      // Reset form
      setPorcentaje('');

      onSuccess?.();
      onClose();
    } catch (error) {
      // El error ya se maneja en el hook con toast
      console.error('Error en ajuste masivo:', error);
    }
  };

  const handleClose = () => {
    setPorcentaje('');
    setTipoPrecio('ambos');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2c5b2d] border-[5px] border-black rounded-2xl p-8 w-full max-w-5xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#fefbe4]">
            Ajuste Masivo de Precios
          </h2>
          <button
            onClick={handleClose}
            className="text-[#f1eef7] hover:text-[#fefbe4] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Adjustment Configuration */}
        <div className="bg-[rgba(0,0,0,0.3)] backdrop-blur-sm rounded-xl border border-black p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#fefbe4] mb-4">
            Configuración del Ajuste
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Type */}
            <div className="space-y-3">
              <Label className="text-[#f1eef7] text-base">Tipo de Precio</Label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center text-[#f1eef7] cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPrecio"
                    value="minorista"
                    checked={tipoPrecio === 'minorista'}
                    onChange={(e) => setTipoPrecio(e.target.value as TipoPrecio)}
                    className="mr-3 w-4 h-4"
                  />
                  <DollarSign size={18} className="mr-2" />
                  Solo Minorista
                </label>
                <label className="flex items-center text-[#f1eef7] cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPrecio"
                    value="mayorista"
                    checked={tipoPrecio === 'mayorista'}
                    onChange={(e) => setTipoPrecio(e.target.value as TipoPrecio)}
                    className="mr-3 w-4 h-4"
                  />
                  <DollarSign size={18} className="mr-2" />
                  Solo Mayorista
                </label>
                <label className="flex items-center text-[#f1eef7] cursor-pointer">
                  <input
                    type="radio"
                    name="tipoPrecio"
                    value="ambos"
                    checked={tipoPrecio === 'ambos'}
                    onChange={(e) => setTipoPrecio(e.target.value as TipoPrecio)}
                    className="mr-3 w-4 h-4"
                  />
                  <DollarSign size={18} className="mr-2" />
                  Ambos Precios
                </label>
              </div>
            </div>

            {/* Percentage Value */}
            <div className="space-y-3">
              <Label className="text-[#f1eef7] text-base">
                Porcentaje de Ajuste (%)
              </Label>
              <Input
                type="number"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                placeholder="Ej: 10 (incremento) o -10 (descuento)"
                className="bg-transparent border-[#afa2c3] text-[#f1eef7] placeholder:text-[#afa2c3] h-12 text-lg"
                step="0.01"
              />
              <p className="text-xs text-[#afa2c3]">
                Usa valores positivos para aumentar o negativos para reducir precios
              </p>
            </div>
          </div>

          {/* Preview Summary */}
          {porcentaje && productosSeleccionados.length > 0 && (
            <div className="mt-4 p-4 bg-[rgba(160,60,234,0.1)] border border-[#a03cea] rounded-lg">
              <p className="text-[#fefbe4] font-medium">
                📊 Resumen: {productosSeleccionados.length} productos seleccionados
                {` con ${porcentaje}% de ajuste en precio ${
                  tipoPrecio === 'ambos' ? 'minorista y mayorista' : tipoPrecio
                }`}
              </p>
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="bg-[rgba(0,0,0,0.3)] backdrop-blur-sm rounded-xl border border-black p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#fefbe4]">
              Productos Seleccionados ({productosAMostrar.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center text-[#f1eef7] py-8">
              Cargando productos...
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {productosAMostrar.map((producto) => {
                const precioMinorista = Number(producto.precio_minorista);
                const precioMayorista = Number(producto.precio_mayorista);
                const nuevoPrecioMinorista = calculateNewPrice(precioMinorista);
                const nuevoPrecioMayorista = calculateNewPrice(precioMayorista);

                return (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-[#a03cea] bg-[rgba(160,60,234,0.2)]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[#f1eef7] font-medium text-base">
                        {producto.nombre}
                      </span>
                      <span className="text-[#afa2c3] text-sm">
                        {producto.categoria}
                      </span>
                    </div>

                    <div className="text-right">
                      {(tipoPrecio === 'minorista' || tipoPrecio === 'ambos') && (
                        <div className="mb-1">
                          <span className="text-[#afa2c3] text-xs">Minorista: </span>
                          <span className="text-[#f1eef7] font-mono text-base">
                            ${precioMinorista.toFixed(2)} → ${nuevoPrecioMinorista.toFixed(2)}
                          </span>
                          {porcentaje && (
                            <span className={`ml-2 text-sm font-medium ${parseFloat(porcentaje) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({porcentaje}%)
                            </span>
                          )}
                        </div>
                      )}
                      {(tipoPrecio === 'mayorista' || tipoPrecio === 'ambos') && (
                        <div>
                          <span className="text-[#afa2c3] text-xs">Mayorista: </span>
                          <span className="text-[#f1eef7] font-mono text-base">
                            ${precioMayorista.toFixed(2)} → ${nuevoPrecioMayorista.toFixed(2)}
                          </span>
                          {porcentaje && (
                            <span className={`ml-2 text-sm font-medium ${parseFloat(porcentaje) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ({porcentaje}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            onClick={handleClose}
            variant="outline"
            className="bg-transparent border-[#f1eef7] text-[#f1eef7] hover:bg-[#f1eef7] hover:text-[#2c5b2d] px-8 h-12"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyAdjustment}
            disabled={!porcentaje || productosSeleccionados.length === 0 || ajusteMasivoMutation.isPending}
            className="bg-gradient-to-r from-[#FB6564] to-[#A03CEA] hover:from-[#fa4a49] hover:to-[#8f2bd1] text-white px-8 h-12 disabled:opacity-50"
          >
            {ajusteMasivoMutation.isPending ? 'Aplicando...' : `Aplicar Ajuste (${productosSeleccionados.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};