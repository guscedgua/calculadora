import api from './index';

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/products', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Buscar productos por categoría
export const getProductsByCategory = (category) => 
  api.get('/products', { params: { category } });