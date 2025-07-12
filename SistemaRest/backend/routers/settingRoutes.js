// backend/routes/settingsRoutes.js (CORREGIDO)
import express from 'express';
// Importa las funciones del controlador de settings
import { getSettings, updateSettings } from '../controllers/settingController.js'; 
import { auth, roleCheck } from '../middleware/auth.js'; 

const router = express.Router();

// Las rutas ya están prefijadas con '/api/settings' desde server.js
// Por lo tanto, aquí deben ser rutas relativas a ese prefijo.

// @desc    Obtener configuraciones del sistema
// @route   GET /api/settings
// @access  Privado (admin, supervisor)
router.get('/', // Ruta raíz relativa al montaje (/api/settings)
    auth,
    roleCheck(['admin', 'supervisor']),
    getSettings // Llama a la función del controlador importada
);

// @desc    Actualizar configuraciones del sistema
// @route   PATCH /api/settings
// @access  Privado (solo admin)
router.patch(
    '/', // Ruta raíz relativa al montaje (/api/settings)
    auth,
    roleCheck(['admin']),
    updateSettings // Llama a la función del controlador importada
);

// Puedes eliminar los middlewares 'attachNewTokens' y 'handleDBErrors' de aquí,
// ya que 'attachNewTokens' debería ser manejado por un interceptor de axios en el frontend
// y 'handleDBErrors' es una función auxiliar, no un middleware Express en sí mismo para este router.
// Si necesitas manejo de errores centralizado, se hace en app.js con app.use((err, req, res, next) => {...})

export default router;