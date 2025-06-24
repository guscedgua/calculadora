// backend/controllers/settingController.js
import Setting from '../models/Setting.js';
import User from '../models/User.js'; // Necesario para obtener los roles existentes

// @desc    Obtener la configuración actual
// @route   GET /api/settings
// @access  Private (admin/supervisor)
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.getSettings();
        
        res.status(200).json({ 
            success: true, 
            settings, 
            availableRoles: Object.values(ROLES) // Usa roles predefinidos
        });
    } catch (error) {
        console.error('[SETTINGS ERROR] Get Settings:', error);
        
        // Mensaje mejorado y localizado
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : `Error: ${error.message}`;
        
        res.status(500).json({
            success: false,
            message: 'Error al obtener la configuración del sistema',
            systemError: errorMessage
        });
    }
};

// @desc    Actualizar la configuración
// @route   PATCH /api/settings
// @access  Private (admin)
export const updateSettings = async (req, res) => {
    try {
        const {
            useInventoryModule,
            useRecipeModule,
            moduleAccess // Nuevo campo para la gestión de accesos a módulos
        } = req.body;

        const settings = await Setting.getSettings(); // Obtiene el único documento de configuración

        // Actualiza las configuraciones booleanas existentes
        if (useInventoryModule !== undefined) {
            settings.useInventoryModule = useInventoryModule;
        }
        if (useRecipeModule !== undefined) {
            settings.useRecipeModule = useRecipeModule;
        }

        // --- Lógica para actualizar moduleAccess ---
        if (moduleAccess !== undefined) {
            // Validar que moduleAccess sea un objeto y que sus valores sean arrays de strings
            if (typeof moduleAccess !== 'object' || moduleAccess === null) {
                return res.status(400).json({ success: false, message: 'El campo moduleAccess debe ser un objeto.' });
            }

            // Opcional: Puedes añadir validaciones más estrictas aquí
            // Por ejemplo, verificar que los roles dentro de moduleAccess[] sean roles válidos.
            // Para simplificar, asumimos que el frontend envía roles válidos.

            // Asegurarse de que `moduleAccess` en el esquema es de tipo `Map` para esto.
            // Si es un objeto simple, puedes simplemente asignarlo:
            // settings.moduleAccess = moduleAccess;
            
            // Si `moduleAccess` es un Map en el esquema, necesitas actualizarlo apropiadamente
            if (!settings.moduleAccess) {
                settings.moduleAccess = new Map();
            }
            for (const key in moduleAccess) {
                if (Array.isArray(moduleAccess[key])) {
                    settings.moduleAccess.set(key, moduleAccess[key]);
                } else {
                    return res.status(400).json({ success: false, message: `El valor para el módulo '${key}' debe ser un array de roles.` });
                }
            }
        }
        // --- Fin lógica moduleAccess ---

        await settings.save(); // Guarda los cambios en la base de datos

        res.status(200).json({ success: true, message: 'Configuración actualizada exitosamente.', settings });
    } catch (error) {
        console.error('[SETTINGS ERROR] Update Settings:', error);
        // Manejo específico para errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la configuración.',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};