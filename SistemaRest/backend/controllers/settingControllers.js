// backend/controllers/settingController.js
// Controladores para la gestión de la configuración del sistema.

import Setting from '../models/Setting.js';
// No necesitamos importar User ni ROLES aquí si solo los usamos en los middlewares o config/roles.js
// Si ROLES se necesita directamente en este controlador (ej. para availableRoles en getSettings),
// asegúrate de importarlo desde su archivo de configuración:
// import { ROLES } from '../config/roles.js'; 

/**
 * @desc    Obtener la configuración actual del sistema
 * @route   GET /api/settings
 * @access  Private (admin/supervisor)
 */
export const getSettings = async (req, res) => {
    try {
        // Usa el método estático getSettings del modelo para obtener el único documento de configuración
        const settings = await Setting.getSettings();
        
        // Si necesitas exponer los roles disponibles, y ROLES está importado:
        // const availableRoles = Object.values(ROLES); 
        // res.status(200).json({ success: true, settings, availableRoles });

        // Si ROLES no está importado o no es necesario exponerlo aquí:
        res.status(200).json({ success: true, settings });
        
    } catch (error) {
        console.error('[SETTINGS ERROR] Get Settings:', error);
        
        // Mensaje mejorado para el entorno
        const errorMessage = process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : `Error al obtener la configuración: ${error.message}`;
        
        res.status(500).json({
            success: false,
            message: 'Error al obtener la configuración del sistema',
            systemError: errorMessage
        });
    }
};

/**
 * @desc    Actualizar la configuración del sistema
 * @route   PATCH /api/settings
 * @access  Private (admin)
 */
export const updateSettings = async (req, res) => {
    try {
        // Extrae solo los campos que están en tu modelo Setting.js
        const {
            useInventoryModule,
            useRecipeModule
            // Si en el futuro añades más campos al modelo Setting.js, inclúyelos aquí
            // Por ejemplo: restaurantName, currencySymbol, taxRate, etc.
        } = req.body;

        // Obtiene el único documento de configuración
        const settings = await Setting.getSettings(); 

        // Actualiza los campos booleanos si se proporcionan en el cuerpo de la solicitud
        if (useInventoryModule !== undefined) {
            settings.useInventoryModule = useInventoryModule;
        }
        if (useRecipeModule !== undefined) {
            settings.useRecipeModule = useRecipeModule;
        }

        // Si tu modelo Setting.js incluye campos como 'moduleAccess' (tipo Map),
        // y los estás enviando en el body, la lógica para actualizarlos debería ir aquí.
        // Ejemplo (si decides añadir moduleAccess al modelo Setting.js):
        // if (moduleAccess !== undefined && typeof moduleAccess === 'object' && moduleAccess !== null) {
        //     // Limpia el Map existente antes de establecer los nuevos valores
        //     // settings.moduleAccess.clear(); // Opcional, dependiendo de tu lógica de actualización
        //     for (const [key, value] of Object.entries(moduleAccess)) {
        //         if (Array.isArray(value)) {
        //             settings.moduleAccess.set(key, value);
        //         } else {
        //             return res.status(400).json({ success: false, message: `El valor para el módulo '${key}' debe ser un array de roles.` });
        //         }
        //     }
        // }


        await settings.save(); // Guarda los cambios en la base de datos

        res.status(200).json({ 
            success: true, 
            message: 'Configuración actualizada exitosamente.', 
            settings // Devuelve la configuración actualizada
        });
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
