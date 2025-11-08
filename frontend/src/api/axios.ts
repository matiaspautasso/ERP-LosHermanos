import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cliente Axios configurado para la API
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para enviar y recibir cookies
});

// Interceptor de respuesta para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta:', error.response.data);

      // Manejar errores específicos
      if (error.response.status === 401) {
        // No autenticado - podríamos redirigir al login
        console.log('No autenticado');
      }
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('Error de red:', error.message);
    } else {
      // Algo sucedió al configurar la solicitud
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
