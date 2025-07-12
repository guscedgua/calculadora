// backend/routes/authRoutes.js (ejemplo)
import { Router } from 'express';
import { login, refreshTokenMiddleware, logout, getProfile, registerUser } from '../controllers/authController.js';
import { auth } from '../controllers/authController.js'; // Importa el middleware de auth

const router = Router();

router.post('/register', registerUser);
router.post('/login', login);
router.post('/refresh-token', refreshTokenMiddleware); // Apunta a tu función correcta
router.post('/logout', logout);
router.get('/profile', auth, getProfile); // Ruta protegida con 'auth'

export default router;