// Archivo: backend/routers/authRoutes.js
// Rutas para autenticación y gestión de usuarios.
import express from 'express';
import {
  registerUser,
  login,
  logout,
  getProfile
} from '../controllers/authController.js';
// Importa el middleware 'auth' desde el archivo corregido 'auth.js'
import { auth,  refreshTokenMiddleware } from '../middleware/auth.js'; // Asegúrate de que el archivo sea 'auth.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
// Las siguientes rutas ahora usan el middleware 'auth' para protección
router.post('/logout', auth, logout);
router.post('/refresh-token', refreshTokenMiddleware, (req, res) => {
    // refreshTokenMiddleware ya ha hecho el trabajo de refrescar y establecer cookies.
    // También ha puesto el nuevo accessToken y user en res.locals.
    // Aquí solo respondemos al frontend.
    res.status(200).json({
        success: true,
        accessToken: res.locals.newAccessToken,
        user: res.locals.user // Envía los datos del usuario con el nuevo token
    });
});router.get('/profile', auth, getProfile);

export default router;
