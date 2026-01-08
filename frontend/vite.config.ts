import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@core': path.resolve(__dirname, './src/core'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 5173,
    open: true,
    // Pre-cargar archivos críticos para arranque más rápido
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx', './src/core/router/AppRouter.tsx'],
    },
  },
  // Optimización de dependencias - pre-bundle de librerías pesadas
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
      '@tanstack/react-query',
      'lucide-react',
    ],
    // Forzar re-optimización en cada cambio (útil en desarrollo)
    force: false,
  },
  // Configuración de build para chunks optimizados
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-label'],
          'data-vendor': ['@tanstack/react-query', 'axios', 'zustand'],
        },
      },
    },
    // Aumentar límite de chunk warning (opcional)
    chunkSizeWarningLimit: 1000,
  },
  // Habilitar caché persistente para rebuilds más rápidos
  cacheDir: 'node_modules/.vite',
});
