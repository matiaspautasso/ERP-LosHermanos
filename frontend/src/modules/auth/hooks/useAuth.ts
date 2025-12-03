import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../api/authService';
import { useAuthStore } from '@/core/store/authStore';
import type { LoginRequest, RegisterRequest, RecoverRequest } from '../api/types';

/**
 * Hook personalizado para manejar autenticación con TanStack Query
 */
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearUser, isAuthenticated } = useAuthStore();

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      setUser(response.user);
      toast.success(response.message);
      // TODO: Redirigir a módulo Ventas
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      toast.success(response.message);
      // Redirigir a login después del registro
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(message);
    },
  });

  // Mutation para recuperar contraseña
  const recoverMutation = useMutation({
    mutationFn: (data: RecoverRequest) => authService.recover(data),
    onSuccess: (response) => {
      toast.success(response.message);
      // Mostrar contraseña temporal en desarrollo
      if (response.temporaryPassword) {
        console.log('Contraseña temporal:', response.temporaryPassword);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al recuperar contraseña';
      toast.error(message);
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: (response) => {
      clearUser();
      queryClient.clear(); // Limpiar todas las queries en caché
      toast.success(response.message);
      navigate('/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al cerrar sesión';
      toast.error(message);
    },
  });

  // Query para obtener perfil (opcional, solo si hay sesión activa)
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated, // Solo ejecutar si hay usuario autenticado
    retry: false,
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    recover: recoverMutation.mutate,
    recoverLoading: recoverMutation.isPending,
    logout: logoutMutation.mutate,
    logoutLoading: logoutMutation.isPending,
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
  };
}
