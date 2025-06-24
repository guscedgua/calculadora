// Archivo: backend/routers/authRoutes.js
// Rutas para autenticación y gestión de usuarios.
import express from 'express';
import {
  registerUser,
  login,
  logout,
  refreshToken,
  getProfile
} from '../controllers/authController.js';
// Importa el middleware 'auth' desde el archivo corregido 'auth.js'
import { auth } from '../middleware/auth.js'; // Asegúrate de que el archivo sea 'auth.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
// Las siguientes rutas ahora usan el middleware 'auth' para protección
router.post('/logout', auth, logout);
router.post('/refresh-token', refreshToken); // Este endpoint no suele necesitar 'auth' ya que su propósito es obtener un nuevo token si el access token expira.
router.get('/profile', auth, getProfile);

export default router;
