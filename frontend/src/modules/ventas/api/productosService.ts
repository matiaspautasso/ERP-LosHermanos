import apiClient from '@/core/api/axios';
import { Producto, Categoria } from './types';

export const productosService = {
  async getAll(): Promise<Producto[]> {
    const response = await apiClient.get<Producto[]>('/productos');
    return response.data;
  },

  async getOne(id: string): Promise<Producto> {
    const response = await apiClient.get<Producto>(`/productos/${id}`);
    return response.data;
  },

  async search(nombre?: string, categoria?: string): Promise<Producto[]> {
    const params = new URLSearchParams();
    if (nombre) params.append('nombre', nombre);
    if (categoria) params.append('categoria', categoria);

    const response = await apiClient.get<Producto[]>(`/productos?${params.toString()}`);
    return response.data;
  },

  async getCategorias(): Promise<Categoria[]> {
    const response = await apiClient.get<Categoria[]>('/productos/categorias');
    return response.data;
  },
};
