import apiClient from '@/core/api/axios';
import {
  ProductoConPrecios,
  UpdatePrecioRequest,
  UpdatePrecioResponse,
  AjusteMasivoRequest,
  AjusteMasivoResponse,
  HistorialPrecio,
  HistorialPreciosParams,
} from './types';

export const preciosService = {
  async getProductosConPrecios(): Promise<ProductoConPrecios[]> {
    const response = await apiClient.get<ProductoConPrecios[]>('/productos/precios/lista');
    return response.data;
  },

  async updatePrecio(
    productoId: string,
    data: UpdatePrecioRequest
  ): Promise<UpdatePrecioResponse> {
    const response = await apiClient.put<UpdatePrecioResponse>(
      `/productos/${productoId}/precios`,
      data
    );
    return response.data;
  },

  async ajusteMasivo(data: AjusteMasivoRequest): Promise<AjusteMasivoResponse> {
    const response = await apiClient.patch<AjusteMasivoResponse>(
      '/productos/precios/masivo',
      data
    );
    return response.data;
  },

  async getHistorialPrecios(
    productoId: string,
    params?: HistorialPreciosParams
  ): Promise<HistorialPrecio[]> {
    const response = await apiClient.get<HistorialPrecio[]>(
      `/productos/${productoId}/precios/historial`,
      { params }
    );
    return response.data;
  },
};
