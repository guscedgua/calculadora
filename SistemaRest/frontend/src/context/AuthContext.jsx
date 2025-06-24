// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Obtener el estado inicial del usuario y el token del localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!token);
  const [isLoading, setIsLoading] = useState(true); // Para manejar el estado de carga inicial si es necesario

  const API_URL = import.meta.env.VITE_API_URL; // Asegúrate de que esta variable de entorno esté disponible

  useEffect(() => {
    // Cuando user o token cambian, actualiza isAuthenticated
    setIsAuthenticated(!!user && !!token);
    // Podrías añadir lógica para verificar el token en el backend aquí si es necesario
    // Por ejemplo, para refrescar el token o validar si sigue siendo válido al cargar la app
    setIsLoading(false); // Una vez que el estado inicial se ha cargado, deja de cargar
  }, [user, token]);

  // Función de inicio de sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // IMPORTANTE para manejar cookies de sesión
        }
      );

      const responseData = response.data;

      // Verificar si la respuesta tiene la estructura esperada
      if (!responseData.success) {
        throw new Error(responseData.message || 'Error desconocido en el inicio de sesión');
      }

      const accessToken = responseData.accessToken || responseData.token;
      const userData = responseData.user || {
        id: responseData.id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role
      };

      if (!accessToken || !userData) {
        throw new Error('Faltan datos esenciales en la respuesta del servidor');
      }

      // Actualizar el estado del contexto
      setUser(userData);
      setToken(accessToken);

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);

      // Puedes retornar algo si el componente que llama necesita saber el éxito
      return { success: true, message: 'Inicio de sesión exitoso' };

    } catch (err) {
      // Manejo de errores detallado
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';

      if (axios.isAxiosError(err)) { // Verifica si es un error de Axios
        if (err.response) {
          // El servidor respondió con un estado fuera del rango 2xx
          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.status === 401) {
            errorMessage = 'Credenciales inválidas. Por favor, verifica.';
          } else if (err.response.status === 400 && err.response.data.errors) {
            errorMessage = err.response.data.errors.join(', ');
          } else {
            errorMessage = `Error del servidor: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err.request) {
          // La solicitud fue hecha pero no se recibió respuesta
          errorMessage = 'No se recibió respuesta del servidor. Verifica tu conexión a internet o la disponibilidad del backend.';
        } else {
          // Algo más causó el error
          errorMessage = `Error en la configuración de la solicitud: ${err.message}`;
        }
      } else {
        // Error no relacionado con Axios
        errorMessage = err.message || 'Ocurrió un error inesperado.';
      }
      
      console.error('Error en login (AuthContext):', err);
      // Propagar el error para que el componente que llama lo pueda manejar
      throw new Error(errorMessage);
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Si usas cookies de sesión, podrías necesitar una llamada al backend para invalidarlas
    // axios.post(`${API_URL}/auth/logout`); // Ejemplo
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading, // Incluir el estado de carga si lo usas para mostrar un spinner global
    login,
    logout,
  };

  // Asegúrate de que isLoading se use correctamente. Podrías renderizar un spinner
  // aquí en el proveedor si quieres que toda la aplicación espere a que se cargue
  // el estado de autenticación inicial.
  // if (isLoading) {
  //   return <Spinner />; // Necesitarías importar o definir Spinner aquí
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};