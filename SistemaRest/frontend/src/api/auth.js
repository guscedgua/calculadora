// frontend/src/api/auth.js
// Funciones para interactuar con la API de Autenticación.

import axios from 'axios'; // Se usará axios directamente para la configuración inicial
import axiosInstance from '../api/axios'; // Importa tu instancia de axios configurada con interceptores
import { showToast } from '../components/ui/Toast'; // Asume que tienes un componente Toast para notificaciones

// La URL base para el backend, sin el prefijo /api/
// Asegúrate de que en tu .env.local tengas VITE_API_URL=http://localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL; 

/**
 * @desc Inicia sesión de un usuario.
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (credentials) => {
  try {
    // CORRECCIÓN CLAVE: Usar axiosInstance y añadir explícitamente '/api/auth/login'
    // Esto asegura que la URL final sea http://localhost:5000/api/auth/login
    const response = await axiosInstance.post(`/api/auth/login`, credentials);
    showToast('Inicio de sesión exitoso', 'success');
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
    showToast(errorMessage, 'error');
    throw error;
  }
};

/**
 * @desc Registra un nuevo usuario.
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (userData) => {
  try {
    // CORRECCIÓN CLAVE: Usar axiosInstance y añadir explícitamente '/api/auth/register'
    const response = await axiosInstance.post(`/api/auth/register`, userData);
    showToast('Registro exitoso! Por favor inicia sesión', 'success');
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.message || 'Error en el registro';
    showToast(errorMessage, 'error');
    throw error;
  }
};

// Alias para simplificar el uso en otros componentes
export const login = loginUser;
export const register = registerUser;

/**
 * @desc Solicita un nuevo access token usando el refresh token.
 * @route POST /api/auth/refresh-token
 * @access Private (gestionado por interceptor de Axios)
 * @remarks Este endpoint es llamado por el interceptor de Axios, no directamente por el frontend.
 * El cuerpo de la petición podría no necesitar el 'refreshToken' explícitamente
 * si el backend lo espera en una cookie HTTP-only (que es lo ideal).
 * Aquí lo mantenemos en el body por si tu backend tiene esa lógica de respaldo.
 */
export const refreshToken = async (incomingRefreshToken) => { // Aceptar el refresh token como argumento
  try {
    // Usar axios directamente aquí si el interceptor lo llama,
    // o axiosInstance si el refresh token se pasa en el body y necesitas el interceptor para otras cosas.
    // Si el backend espera la cookie, el body podría ser vacío.
    const response = await axios.post(
        `${API_BASE_URL}/api/auth/refresh-token`, // CORRECCIÓN CLAVE: Añadir /api/
        { refreshToken: incomingRefreshToken }, // Pasar el refresh token explícitamente si es necesario
        { withCredentials: true } // Importante para enviar cookies
    );
    return response.data;
  } catch (error) {
    console.error('Token refresh error (client-side):', error);
    // No mostrar toast aquí, el interceptor o el AuthContext deberían manejar la redirección.
    throw error;
  }
};

/**
 * @desc Cierra la sesión del usuario.
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = async () => {
  try {
    // CORRECCIÓN CLAVE: Usar axiosInstance y añadir explícitamente '/api/auth/logout'
    await axiosInstance.post(`/api/auth/logout`);
    showToast('Sesión cerrada correctamente', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    const errorMessage = error.response?.data?.message || 'Error al cerrar sesión';
    showToast(errorMessage, 'error');
    throw error;
  }
};