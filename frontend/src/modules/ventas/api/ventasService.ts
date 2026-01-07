import apiClient from '@/core/api/axios';
import {
  CreateVentaRequest,
  VentaResponse,
  VentasListResponse,
  VentaDetalle,
  VentaFilters,
} from './types';

export const ventasService = {
  async create(data: CreateVentaRequest): Promise<VentaResponse> {
    const response = await apiClient.post<VentaResponse>('/ventas', data);
    return response.data;
  },

  async getAll(filters?: VentaFilters): Promise<VentasListResponse> {
    const params = new URLSearchParams();
    if (filters?.desde) params.append('desde', filters.desde);
    if (filters?.hasta) params.append('hasta', filters.hasta);
    if (filters?.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters?.tipo_venta) params.append('tipo_venta', filters.tipo_venta);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<VentasListResponse>(
      `/ventas?${params.toString()}`
    );
    return response.data;
  },

  async getOne(id: string): Promise<VentaDetalle> {
    const response = await apiClient.get<VentaDetalle>(`/ventas/${id}`);
    return response.data;
  },
};
