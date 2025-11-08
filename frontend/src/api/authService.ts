import apiClient from './axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RecoverRequest,
  RecoverResponse,
  User,
} from './types';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Recuperar contraseña
   */
  async recover(data: RecoverRequest): Promise<RecoverResponse> {
    const response = await apiClient.post<RecoverResponse>('/auth/recover', data);
    return response.data;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },
};
