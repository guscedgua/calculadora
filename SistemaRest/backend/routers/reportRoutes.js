import express from 'express';
import { getSalesReport, getInventoryReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/sales', getSalesReport);
router.get('/inventory', getInventoryReport);

export default router; // 👈 Exportación por defecto