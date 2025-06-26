// Archivo: backend/routes/orderRoutes.js
// Rutas para la gestión de órdenes.
import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  markOrderPaid,
  deleteOrder
} from '../controllers/orderController.js';

// Importamos los middlewares de autenticación y autorización desde tu archivo auth.js
import { auth, adminCheck, supervisorCheck, meseroCheck, cocineroCheck } from '../middleware/auth.js';
import { ROLES } from '../config/roles.js'; // Importamos los roles definidos
import { getTodaySummary } from '../controllers/orderController.js';

const router = express.Router();

console.log('--- Order Routes Loaded (Versión Final) ---'); // LOG para confirmar la carga del archivo de rutas

// Ruta para crear una nueva orden
// Requiere autenticación y roles: mesero, administrador, supervisor
router.post(
  '/',
  auth, // Middleware de autenticación principal
  meseroCheck, // Middleware de autorización (permite mesero, admin, supervisor según tu auth.js)
  (req, res, next) => { // Pequeño middleware para depuración
      console.log('Petición POST /api/orders recibida en la ruta. Pasando a createOrder.');
      next();
  },
  createOrder
);

// Ruta para obtener todas las órdenes
// Requiere autenticación y roles: administrador, supervisor, mesero
router.get(
  '/',
  auth,
  meseroCheck, // Permite admin, supervisor, mesero
  getAllOrders
);

// Ruta para obtener una orden específica por su ID
// Requiere autenticación y roles: administrador, supervisor, mesero
router.get(
  '/:id',
  auth,
  meseroCheck, // Permite admin, supervisor, mesero
  getOrderById
);

// Ruta para actualizar el estado de una orden específica por su ID
// Requiere autenticación y roles: administrador, mesero, cocinero, supervisor (cocineroCheck incluye supervisor)
router.patch(
  '/:id/status',
  auth,
  cocineroCheck, // Permite admin, supervisor, cocinero
  updateOrderStatus
);

// Ruta para marcar una orden como pagada
// Requiere autenticación y roles: administrador, mesero
router.patch(
  '/:id/pay',
  auth,
  meseroCheck, // Permite admin, supervisor, mesero
  markOrderPaid
);

// Ruta para eliminar una orden específica por su ID
// Requiere autenticación y solo el rol: administrador
router.delete(
  '/:id',
  auth,
  adminCheck, // Solo permite administrador
  deleteOrder
);
router.get('/summary/today', auth, meseroCheck, getTodaySummary);

export default router;
