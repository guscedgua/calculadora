import express from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus
} from '../controllers/tableController.js';
import { 
  auth,
  roleCheck,
  adminCheck,
  supervisorCheck,
  meseroCheck
} from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas incluyen '/tables' explícitamente
router.route('/tables')
  .post(auth, adminCheck, createTable)
  .get(auth, meseroCheck, getAllTables);

router.route('/tables/:id')
  .get(auth, meseroCheck, getTableById)
  .put(auth, supervisorCheck, updateTable)
  .delete(auth, adminCheck, deleteTable);

router.patch('/tables/:id/status', auth, meseroCheck, updateTableStatus);

export default router;