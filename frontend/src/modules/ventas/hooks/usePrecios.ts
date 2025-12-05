import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { preciosService } from '../api/preciosService';
import { UpdatePrecioRequest, AjusteMasivoRequest } from '../api/types';

export function useProductosConPrecios() {
  return useQuery({
    queryKey: ['productos-precios'],
    queryFn: () => preciosService.getProductosConPrecios(),
  });
}

export function useUpdatePrecio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productoId, data }: { productoId: string; data: UpdatePrecioRequest }) =>
      preciosService.updatePrecio(productoId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['productos-precios'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar precio';
      toast.error(message);
    },
  });
}

export function useAjusteMasivo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AjusteMasivoRequest) => preciosService.ajusteMasivo(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['productos-precios'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al realizar ajuste masivo';
      toast.error(message);
    },
  });
}
