// backend/routes/supplierRoutes.js
import express from 'express';
const router = express.Router();
import {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplierController.js';

// Aquí iría tu middleware de autenticación y autorización, por ejemplo:
// import { protect, authorize } from '../middleware/authMiddleware.js';

// Para propósitos de prueba inicial en desarrollo, los exponemos directamente:
router.route('/').get(getAllSuppliers).post(createSupplier);
router.route('/:id').get(getSupplierById).put(updateSupplier).delete(deleteSupplier);

// Si implementas auth, sería así:
// router.route('/').get(protect, authorize(['admin']), getAllSuppliers).post(protect, authorize(['admin']), createSupplier);
// router.route('/:id').get(protect, authorize(['admin']), getSupplierById).put(protect, authorize(['admin']), updateSupplier).delete(protect, authorize(['admin']), deleteSupplier);
export default router;
