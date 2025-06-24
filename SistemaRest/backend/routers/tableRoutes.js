// Archivo: backend/routes/tableRoutes.js
// Rutas para la gestión de mesas.
import express from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus
} from '../controllers/tableController.js';
// Importa el nuevo middleware de autenticación
import { 
  auth, // Nuevo nombre para el middleware principal de protección
  roleCheck, // Middleware para verificar roles
  adminCheck, // Middleware específico para rol de admin
  supervisorCheck, // Middleware específico para rol de supervisor
  meseroCheck // Middleware específico para rol de mesero
} from '../middleware/auth.js'; // Asegúrate que el archivo se llame auth.js o ajusta la ruta
import { ROLES } from '../config/roles.js'; // Aún necesitas ROLES si los usas en roleCheck

const router = express.Router();

router.route('/')
  // Usa 'auth' para la protección general y 'adminCheck' o 'supervisorCheck' para el rol
  .post(auth, adminCheck, createTable) // createTable requiere admin
  .get(auth, meseroCheck, getAllTables); // getAllTables accesible por admin, supervisor, mesero


router.route('/:id')
  .get(auth, meseroCheck, getTableById) // getTableById accesible por admin, supervisor, mesero
  .put(auth, supervisorCheck, updateTable) // updateTable requiere admin o supervisor
  .delete(auth, adminCheck, deleteTable); // deleteTable requiere admin

// Puedes usar meseroCheck si quieres que los meseros puedan cambiar el estado,
// o supervisorCheck/adminCheck si quieres restringirlo más.
router.patch('/:id/status', auth, meseroCheck, updateTableStatus);

export default router;