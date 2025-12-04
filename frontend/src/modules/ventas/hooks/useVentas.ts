import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ventasService } from '../api/ventasService';
import { clientesService } from '../api/clientesService';
import { productosService } from '../api/productosService';
import { CreateVentaRequest, VentaFilters } from '../api/types';

export function useVentas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation para crear venta
  const createVentaMutation = useMutation({
    mutationFn: (data: CreateVentaRequest) => ventasService.create(data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      navigate('/ventas/lista');
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
  return useQuery({
    queryKey: ['ventas', filters],
    queryFn: () => ventasService.getAll(filters),
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
