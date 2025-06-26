// backend/routes/dashboardRoutes.js
// Rutas para los endpoints de resumen del dashboard.

import express from 'express';
// Importa los controladores del dashboard
import { 
    getOrdersTodaySummary,
    getTotalSalesSummary,
    getTablesStatusSummary
} from '../controllers/dashboardController.js'; 
// Importa tus middlewares de autenticación y autorización
// Se ha cambiado 'authorize' por 'roleCheck' ya que es el nombre correcto del middleware genérico de roles.
import { auth, roleCheck } from '../middleware/auth.js'; 
import { ROLES } from '../config/roles.js'; // Importa la definición de roles

const router = express.Router();

// Todas las rutas del dashboard están protegidas y solo son accesibles por roles específicos.
// Se usa 'auth' para asegurar que el usuario está autenticado.
// Se usa 'roleCheck' con un array de ROLES permitidos para controlar el acceso.

/**
 * Ruta para obtener el resumen de órdenes de hoy.
 * @route GET /api/dashboard/summary/ordersToday
 * @access Private (admin, supervisor, mesero, cocinero)
 */
router.get(
    '/summary/ordersToday', 
    auth, 
    roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO, ROLES.COCINERO]), // Usamos 'roleCheck' aquí
    getOrdersTodaySummary
);

/**
 * Ruta para obtener el resumen de ventas totales.
 * @route GET /api/dashboard/summary/totalSales
 * @access Private (admin, supervisor, mesero)
 */
router.get(
    '/summary/totalSales', 
    auth, 
    roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO]), // Usamos 'roleCheck' aquí
    getTotalSalesSummary
);

/**
 * Ruta para obtener el resumen del estado de las mesas (ocupadas vs. total).
 * @route GET /api/dashboard/summary/tablesStatus
 * @access Private (admin, supervisor, mesero)
 */
router.get(
    '/summary/tablesStatus', 
    auth, 
    roleCheck([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.MESERO]), // Usamos 'roleCheck' aquí
    getTablesStatusSummary
);

export default router;