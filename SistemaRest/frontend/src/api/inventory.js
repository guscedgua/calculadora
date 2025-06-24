import axios from 'axios';
import { showToast } from '../components/ui/Toast';
import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Obtener items de inventario
export const getInventoryItems = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_URL}/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    showToast('Error al cargar el inventario', 'error');
    throw error;
  }
};

// Añadir más funciones según sea necesario
export const updateInventoryItem = async (itemId, data) => {
  try {
    const token = getToken();
    const response = await axios.put(`${API_URL}/inventory/${itemId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    showToast('Ítem actualizado correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    showToast('Error al actualizar el ítem', 'error');
    throw error;
  }
};