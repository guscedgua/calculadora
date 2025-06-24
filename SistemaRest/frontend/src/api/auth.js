import axios from 'axios';
import { showToast } from '../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    showToast('Credenciales incorrectas', 'error');
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    showToast('Registro exitoso! Por favor inicia sesión', 'success');
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    showToast('Error en el registro', 'error');
    throw error;
  }
};

// Luego crea los alias
export const login = loginUser;
export const register = registerUser;

// Resto de funciones
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`);
    showToast('Sesión cerrada correctamente', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error al cerrar sesión', 'error');
    throw error;
  }
};