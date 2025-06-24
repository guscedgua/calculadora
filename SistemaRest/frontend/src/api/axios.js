import axios from 'axios';

// Configuración inicial
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Estado para manejar refresco de token run
let isRefreshing = false;
let failedRequests = [];

// Función para limpiar tokens y redirigir
const clearTokensAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Guardar ruta actual para redirección post-login
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/login') {
    sessionStorage.setItem('redirectPath', currentPath);
  }
  
  // Redirigir forzando recarga completa
  window.location.href = '/login';
};

// Interceptor de solicitudes
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Verificar si es error de autenticación
    const isAuthError = error.response?.status === 401;
    
    // Solo manejar errores 401 que no sean del endpoint de refresh
    if (!isAuthError || originalRequest.url.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    // Evitar bucles infinitos
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Manejar cola de solicitudes durante refresco
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequests.push({ 
          resolve: () => resolve(axiosInstance(originalRequest)),
          reject
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Solicitar nuevo token
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      // Actualizar almacenamiento
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Actualizar headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Reprocesar solicitudes en cola
      failedRequests.forEach(pending => pending.resolve());
      
      // Reintentar solicitud original
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Manejar error crítico
      console.error('Refresh token error:', refreshError);
      
      // Limpiar tokens y redirigir
      clearTokensAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      failedRequests = [];
    }
  }
);

export default axiosInstance;