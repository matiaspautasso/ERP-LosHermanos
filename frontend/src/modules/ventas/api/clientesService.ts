import apiClient from '@/core/api/axios';
import { Cliente } from './types';

export const clientesService = {
  async getAll(): Promise<Cliente[]> {
    const response = await apiClient.get<Cliente[]>('/clientes');
    return response.data;
  },

  async getOne(id: string): Promise<Cliente> {
    const response = await apiClient.get<Cliente>(`/clientes/${id}`);
    return response.data;
  },

  async search(query?: string, tipo?: string): Promise<Cliente[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (tipo) params.append('tipo', tipo);

    const response = await apiClient.get<Cliente[]>(`/clientes?${params.toString()}`);
    return response.data;
  },
};
