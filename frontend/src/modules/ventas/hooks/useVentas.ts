import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ventasService } from '../api/ventasService';
import { clientesService } from '../api/clientesService';
import { productosService } from '../api/productosService';
import { CreateVentaRequest, VentaFilters, VentasListResponse } from '../api/types';

export function useVentas(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  // Mutation para crear venta
  const createVentaMutation = useMutation({
    mutationFn: (data: CreateVentaRequest) => ventasService.create(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear la venta';
      toast.error(message);
    },
  });

  return {
    createVenta: createVentaMutation.mutate,
    creandoVenta: createVentaMutation.isPending,
  };
}

export function useVentasList(filters?: VentaFilters) {
  return useQuery<VentasListResponse>({
    queryKey: ['ventas', filters],
    queryFn: () => ventasService.getAll(filters),
    // Mantiene datos anteriores mientras carga nueva página (React Query v5)
    placeholderData: (prev) => prev,
  });
}

export function useVentaDetalle(id: string) {
  return useQuery({
    queryKey: ['venta', id],
    queryFn: () => ventasService.getOne(id),
    enabled: !!id,
  });
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesService.getAll(),
  });
}

export function useProductos(nombre?: string, categoria?: string) {
  return useQuery({
    queryKey: ['productos', nombre, categoria],
    queryFn: () => productosService.search(nombre, categoria),
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => productosService.getCategorias(),
  });
}
