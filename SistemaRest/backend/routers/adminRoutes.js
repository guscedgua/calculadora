import express from 'express';
import { auth, adminCheck, roleCheck } from '../middleware/auth.js';
import { getDashboard, updateSystemSettings } from '../controllers/adminController.js';

const router = express.Router();

// @desc    Obtener datos para el dashboard del administrador
// @route   GET /api/admin/dashboard
// @access  Private (admin)
// Esta ruta requiere que el usuario esté autenticado y tenga el rol de 'admin'.
router.get('/dashboard', auth, adminCheck, getDashboard);

// @desc    Actualizar configuraciones específicas del sistema
// @route   PUT /api/admin/system-settings
// @access  Private (admin, supervisor)
// Esta ruta requiere que el usuario esté autenticado y tenga el rol de 'admin' o 'supervisor'.
router.put('/system-settings', auth, roleCheck(['admin', 'supervisor']), updateSystemSettings);

export default router;