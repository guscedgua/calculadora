// backend/routes/inventoryRoutes.js
import express from 'express'; // Usar import si tu proyecto es 'type: module'
// const express = require('express'); // Usar require si tu proyecto es CJS
const router = express.Router();
import {
    getAllInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryQuantity,
    removeInventoryQuantity
} from '../controllers/inventoryController.js'; // Asegúrate de la extensión .js

// Middleware de protección (ejemplo, DEBES implementar el tuyo)
// const protect = (req, res, next) => { /* Tu lógica de autenticación */ next(); };
// const authorize = (roles) => (req, res, next) => { /* Tu lógica de autorización */ next(); };

// Rutas públicas
router.get('/', getAllInventoryItems);
router.get('/:id', getInventoryItemById);

// Rutas protegidas por admin (ejemplo, reemplaza con tu middleware real)
// router.post('/', protect, authorize(['admin']), createInventoryItem);
// router.put('/:id', protect, authorize(['admin']), updateInventoryItem);
// router.delete('/:id', protect, authorize(['admin']), deleteInventoryItem);
// router.patch('/:id/add', protect, authorize(['admin']), addInventoryQuantity);
// router.patch('/:id/remove', protect, authorize(['admin']), removeInventoryQuantity);

// Si aún no tienes auth, para probar puedes usarlas así (SOLO PARA DESARROLLO)
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.patch('/:id/add', addInventoryQuantity);
router.patch('/:id/remove', removeInventoryQuantity);


export default router; // Usar export default si tu proyecto es 'type: module'
// module.exports = router; // Usar module.exports si tu proyecto es CJS