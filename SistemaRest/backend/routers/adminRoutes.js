// backend/routers/adminRoutes.js
import express from 'express';
// --- CAMBIO AQUÍ: La ruta de importación ha sido corregida ---
import {
    auth,
    adminCheck,
    roleCheck // Asegúrate de que roleCheck también se importe si se usa
} from '../controllers/authController.js'; // Importa desde authController.js
import {
    getUsers, // CAMBIO: Importa 'getUsers' en lugar de 'getAllUsers'
    getUserById,
    updateUser,
    deleteUser,
    createUser // Si admin puede crear usuarios
} from '../controllers/userController.js'; // Ajusta la ruta si es diferente

const router = express.Router();

// @desc    Ruta de ejemplo para administradores
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', auth, adminCheck, (req, res) => {
    res.status(200).json({ success: true, message: 'Acceso concedido al dashboard de admin.' });
});

// Rutas para la gestión de usuarios por parte del administrador
// Estas rutas asumen que el adminRoutes maneja la gestión de usuarios
// Si ya tienes un userRoutes.js, podrías querer mover estas rutas allí.
router.route('/users')
    .post(auth, adminCheck, createUser) // Crear usuario (solo admin)
    .get(auth, adminCheck, getUsers); // CAMBIO: Usa 'getUsers' aquí // Obtener todos los usuarios (solo admin)

router.route('/users/:id')
    .get(auth, adminCheck, getUserById) // Obtener usuario por ID (solo admin)
    .put(auth, adminCheck, updateUser) // Actualizar usuario (solo admin)
    .delete(auth, adminCheck, deleteUser); // Eliminar usuario (solo admin)

export default router;