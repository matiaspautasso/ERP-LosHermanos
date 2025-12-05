import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Simulación de datos de productos para desarrollo
const mockProductos = [
  {
    id: 1,
    nombre: 'Producto A',
    precio_lista: 100,
    categoria: { nombre: 'Categoría 1' },
    stock_actual: 10,
  },
  {
    id: 2,
    nombre: 'Producto B', 
    precio_lista: 200,
    categoria: { nombre: 'Categoría 2' },
    stock_actual: 5,
  },
  {
    id: 3,
    nombre: 'Producto C',
    precio_lista: 300,
    categoria: { nombre: 'Categoría 1' },
    stock_actual: 0,
  }
];

interface UpdatePriceRequest {
  id: number;
  precio: number;
}

export function useProductos() {
  const queryClient = useQueryClient();

  // Query para obtener productos
  const productosQuery = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockProductos;
    },
  });

  // Mutation para actualizar precio individual
  const updatePrice = useMutation({
    mutationFn: async ({ id, precio }: UpdatePriceRequest) => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`Actualizando producto ${id} a precio ${precio}`);
      return { message: `Precio actualizado para producto ${id}` };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Precio actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar precio');
    },
  });

  // Mutation para ajuste masivo de precios
  const massUpdatePrices = useMutation({
    mutationFn: async (updates: UpdatePriceRequest[]) => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Actualizando precios masivamente:', updates);
      return { message: `${updates.length} precios actualizados` };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success(data.message);
    },
    onError: () => {
      toast.error('Error en ajuste masivo');
    },
  });

  return {
    productos: productosQuery.data || [],
    isLoading: productosQuery.isLoading,
    isError: productosQuery.isError,
    updatePrice,
    massUpdatePrices,
    isUpdating: updatePrice.isPending || massUpdatePrices.isPending,
  };
}