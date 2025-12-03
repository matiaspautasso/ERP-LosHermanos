// Tipos de datos para la API

export interface User {
  id: string;
  email: string;
  username: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface RecoverRequest {
  email: string;
}

export interface RecoverResponse {
  message: string;
  temporaryPassword?: string; // Solo en desarrollo
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
