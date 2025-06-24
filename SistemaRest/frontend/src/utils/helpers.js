// src/utils/helpers.js

// Definición de estados
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  UNAVAILABLE: 'unavailable'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

/**
 * Ordena un array de objetos por una clave específica
 * @param {Array} array - Array a ordenar
 * @param {string} key - Clave por la que ordenar
 * @param {string} [direction='asc'] - Dirección de ordenamiento ('asc' o 'desc')
 * @returns {Array} - Nuevo array ordenado (no muta el original)
 */
export const sortByKey = (array, key, direction = 'asc') => {
  // Crear copia para no mutar el array original
  return [...array].sort((a, b) => {
    let valueA = a[key];
    let valueB = b[key];
    
    // Manejo de valores nulos/undefined
    if (valueA === null || valueA === undefined) valueA = '';
    if (valueB === null || valueB === undefined) valueB = '';
    
    // Normalizar strings
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();
    
    // Comparación numérica para números
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    // Comparación para otros tipos
    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Obtiene el nombre legible del estado de una mesa
 * @param {string} status - Estado de la mesa
 * @returns {string} - Nombre legible del estado
 */
export const getTableStatusName = (status) => {
  const statusNames = {
    [TABLE_STATUS.AVAILABLE]: 'Disponible',
    [TABLE_STATUS.OCCUPIED]: 'Ocupada',
    [TABLE_STATUS.RESERVED]: 'Reservada',
    [TABLE_STATUS.CLEANING]: 'En limpieza',
    [TABLE_STATUS.UNAVAILABLE]: 'No disponible'
  };
  
  return statusNames[status] || status;
};

/**
 * Obtiene el nombre legible del estado de un pedido
 * @param {string} status - Estado del pedido
 * @returns {string} - Nombre legible del estado
 */
export const getOrderStatusName = (status) => {
  const statusNames = {
    [ORDER_STATUS.PENDING]: 'Pendiente',
    [ORDER_STATUS.PREPARING]: 'En preparación',
    [ORDER_STATUS.READY]: 'Listo para servir',
    [ORDER_STATUS.DELIVERED]: 'Entregado',
    [ORDER_STATUS.PAID]: 'Pagado',
    [ORDER_STATUS.CANCELLED]: 'Cancelado'
  };
  
  return statusNames[status] || status;
};

/**
 * Genera un número de orden único basado en fecha y número aleatorio
 * @returns {string} - Número de orden único
 */
export const generateOrderNumber = () => {
  const now = new Date();
  const datePart = now.toISOString()
    .replace(/T/, '-')
    .replace(/\..+/, '')
    .replace(/[-:]/g, '')
    .slice(2, 12); // YYMMDDHHmm
  
  const randomPart = Math.floor(100 + Math.random() * 900); // 100-999
  
  return `ORD-${datePart}-${randomPart}`;
};

/**
 * Calcula el total de un pedido considerando ingredientes adicionales
 * @param {Array} items - Items del pedido
 * @returns {number} - Total del pedido
 */
export const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    // Validación de precios
    const itemPrice = Number(item.priceAtOrder) || 0;
    const itemQty = Number(item.quantity) || 0;
    const itemTotal = itemPrice * itemQty;
    
    // Total de adicionales
    const additionsTotal = (item.additionalIngredients || []).reduce(
      (sum, addition) => {
        const addPrice = Number(addition.price) || 0;
        const addQty = Number(addition.quantity) || 0;
        return sum + (addPrice * addQty);
      }, 0
    );
    
    return total + itemTotal + additionsTotal;
  }, 0);
};

/**
 * Formatea una cantidad monetaria
 * @param {number} amount - Cantidad a formatear
 * @param {string} [currency='USD'] - Moneda a usar
 * @returns {string} - Cantidad formateada
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Formatea una fecha a formato legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime()) 
    ? 'Fecha inválida'
    : d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
};

/**
 * Filtra elementos por término de búsqueda en múltiples campos
 * @param {Array} data - Datos a filtrar
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @returns {Array} - Datos filtrados
 */
export const filterBySearchTerm = (data, searchTerm, fields) => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    fields.some(field => {
      const value = item[field];
      if (!value) return false;
      return value.toString().toLowerCase().includes(term);
    })
  );
};

/**
 * Valida si un correo electrónico tiene formato válido
 * @param {string} email - Correo a validar
 * @returns {boolean} - True si es válido, false si no
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Calcula el tiempo transcurrido desde una fecha
 * @param {Date|string} date - Fecha de inicio
 * @returns {string} - Tiempo transcurrido en formato legible
 */
export const timeSince = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);
  
  if (seconds < 60) return 'hace unos segundos';
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `hace ${count} ${unit}${count > 1 ? 's' : ''}`;
    }
  }
  
  return 'recientemente';
};