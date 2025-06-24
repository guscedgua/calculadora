import api from './index';

export const getSalesReport = (startDate, endDate) => 
  api.get('/reports/sales', { params: { startDate, endDate } });
  
export const getInventoryReport = () => api.get('/reports/inventory');