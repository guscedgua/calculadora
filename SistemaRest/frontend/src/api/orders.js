// src/api/orders.js
import api from './axios';
import { showToast } from '../components/ui/Toast';

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    showToast('Orden creada correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.response?.status === 401) {
      showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
    } else {
      showToast('Error al crear la orden', 'error');
    }
    
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    
    if (error.response?.status === 401) {
      showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
    } else {
      showToast('Error al cargar la orden', 'error');
    }
    
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    showToast('Estado actualizado correctamente', 'success');
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    
    if (error.response?.status === 401) {
      showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
    } else {
      showToast('Error al actualizar el estado', 'error');
    }
    
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    await api.delete(`/orders/${orderId}`);
    showToast('Orden eliminada correctamente', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    
    if (error.response?.status === 401) {
      showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
    } else {
      showToast('Error al eliminar la orden', 'error');
    }
    
    throw error;
  }
};

export const getOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    if (error.response?.status === 401) {
      showToast('Sesión expirada. Por favor inicie sesión nuevamente', 'error');
    } else {
      showToast('Error al cargar las órdenes', 'error');
    }
    
    throw error;
  }
};