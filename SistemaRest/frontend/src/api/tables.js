import api from './index';

export const getTables = () => api.get('/tables');
export const createTable = (tableData) => api.post('/tables', tableData);
export const updateTable = (id, tableData) => api.put(`/tables/${id}`, tableData);
export const deleteTable = (id) => api.delete(`/tables/${id}`);
export const updateTableStatus = (id, status) => 
  api.patch(`/tables/${id}/status`, { status });