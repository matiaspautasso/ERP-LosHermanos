import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/modules/auth/api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

/**
 * Store de autenticación usando Zustand
 * Persiste el estado del usuario en localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // Nombre de la key en localStorage
    }
  )
);
