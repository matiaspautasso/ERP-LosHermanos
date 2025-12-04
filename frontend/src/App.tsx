import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import LoginPage from './modules/auth/pages/LoginPage';
import RegisterPage from './modules/auth/pages/RegisterPage';
import RecoverPage from './modules/auth/pages/RecoverPage';
import NuevaVentaPage from './modules/ventas/pages/NuevaVentaPage';
import ListaVentasPage from './modules/ventas/pages/ListaVentasPage';
import DetalleVentaPage from './modules/ventas/pages/DetalleVentaPage';
import { ProtectedRoute } from '@core/routes/ProtectedRoute';
import { useAuthStore } from '@core/store/authStore';

// Configuración de TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recover" element={<RecoverPage />} />

      {/* Rutas protegidas - Ventas */}
      <Route
        path="/ventas/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="nueva" element={<NuevaVentaPage />} />
              <Route path="lista" element={<ListaVentasPage />} />
              <Route path=":id" element={<DetalleVentaPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Ruta raíz - redirigir según autenticación */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/ventas/nueva" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
