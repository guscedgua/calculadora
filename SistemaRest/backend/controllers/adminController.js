// backend/controllers/adminController.js
import Setting from '../models/Setting.js'; // Asumiendo que las configuraciones del sistema también están en el modelo Setting
import User from '../models/User.js'; // Para obtener estadísticas de usuarios si es necesario para el dashboard
import Product from '../models/Product.js'; // Para obtener estadísticas de productos
import Order from '../models/Order.js'; // Para obtener estadísticas de pedidos

// @desc    Obtener datos para el dashboard del administrador
// @route   GET /api/admin/dashboard
// @access  Private (admin)
export const getDashboard = async (req, res) => {
    try {
        // Aquí puedes agregar la lógica para recopilar los datos que el administrador necesita
        // para su dashboard. Por ejemplo:
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        // Puedes agregar más lógicas, como ventas totales, pedidos pendientes, etc.

        // Ejemplo: Obtener configuraciones del sistema si se muestran en el dashboard
        const systemSettings = await Setting.getSettings();

        res.status(200).json({
            success: true,
            message: 'Datos del dashboard obtenidos exitosamente.',
            data: {
                userCount,
                productCount,
                totalOrders,
                systemModulesConfig: { // Puedes enviar configuraciones de módulos específicas si no las quieres en la ruta /api/settings
                    useInventoryModule: systemSettings.useInventoryModule,
                    useRecipeModule: systemSettings.useRecipeModule,
                    // ... otras configuraciones relevantes para el dashboard
                }
            }
        });
    } catch (error) {
        console.error('[ADMIN ERROR] Get Dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener los datos del dashboard.',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null,
        });
    }
};

// @desc    Actualizar configuraciones específicas del sistema (accesible por admin y supervisor)
// @route   PUT /api/admin/system-settings
// @access  Private (admin, supervisor)
export const updateSystemSettings = async (req, res) => {
    try {
        // Los campos que se pueden actualizar a través de esta ruta PUT
        // NOTA: Estos campos deberían ser específicamente configuraciones del "sistema"
        // que no pertenecen a la gestión general de "settings" manejada por settingController.js.
        // Si hay solapamiento, considera consolidar.

        // Por ejemplo, aquí podrías manejar campos como:
        // const { enableFeatureX, defaultTaxRate, welcomeMessage } = req.body;
        // console.log('req.body para updateSystemSettings:', req.body);

        // Si estas "configuraciones del sistema" son parte del modelo Setting,
        // tendrías que cargarlo, actualizar los campos específicos y guardar.
        const settings = await Setting.getSettings(); // Obtiene el único documento de configuración

        // Ejemplo: Si quieres actualizar campos como 'defaultTaxRate' o 'welcomeMessage'
        // que son diferentes de 'useInventoryModule' o 'moduleAccess' en SettingController.js
        if (req.body.defaultTaxRate !== undefined) {
            settings.defaultTaxRate = req.body.defaultTaxRate;
        }
        if (req.body.welcomeMessage !== undefined) {
            settings.welcomeMessage = req.body.welcomeMessage;
        }
        // ... (agrega lógica para los campos específicos que este controlador debe manejar)

        await settings.save(); // Guarda los cambios

        res.status(200).json({
            success: true,
            message: 'Configuración del sistema actualizada exitosamente.',
            settings: { // Puedes devolver solo los campos que este controlador actualizó
                defaultTaxRate: settings.defaultTaxRate,
                welcomeMessage: settings.welcomeMessage,
                // ...
            }
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Update System Settings:', error);
        // Manejo específico para errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la configuración del sistema.',
            systemError: process.env.NODE_ENV === 'development' ? error.message : null,
        });
    }
};