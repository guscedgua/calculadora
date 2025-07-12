// backend/controllers/adminController.js
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js'; // Necesitas este modelo para las mesas

/**
 * @desc    Obtener datos para el dashboard del administrador.
 * @route   GET /api/admin/dashboard?metric=<metricName>
 * @access  Private (admin)
 */
export const getDashboard = async (req, res) => {
    try {
        const { metric } = req.query; // Obtener el parámetro 'metric' de la URL

        let data = {}; // Objeto para almacenar los datos a devolver

        switch (metric) {
            case 'ordersToday':
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const ordersTodayCount = await Order.countDocuments({
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: { $ne: 'cancelled' } // Excluir órdenes canceladas si es necesario
                });
                data = { value: ordersTodayCount };
                break;

            case 'totalSales':
                // Esta lógica debería sumar el totalAmount de las órdenes completadas
                const completedOrders = await Order.find({ status: 'completed' }); // O el estado que designe una venta finalizada
                const totalSalesAmount = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                data = { value: totalSalesAmount };
                break;

            case 'tablesStatus':
                const totalTables = await Table.countDocuments();
                const occupiedTables = await Table.countDocuments({ status: 'occupied' }); // Asume que tienes un campo 'status' en tu modelo Table
                data = { occupied: occupiedTables, total: totalTables };
                break;

            case 'userCount':
                const userCount = await User.countDocuments();
                data = { value: userCount };
                break;

            case 'productCount':
                const productCount = await Product.countDocuments();
                data = { value: productCount };
                break;

            case 'systemSettings':
                // Nota: Tu frontend en Dashboard.jsx no pide 'systemSettings' explícitamente
                // pero si lo necesitas, aquí se devolvería.
                const systemSettings = await Setting.getSettings();
                data = {
                    useInventoryModule: systemSettings.useInventoryModule,
                    useRecipeModule: systemSettings.useRecipeModule,
                    // ... otras configuraciones relevantes
                };
                break;

            default:
                // Si no se especifica una métrica o es desconocida, puedes devolver un error
                // o un conjunto de datos predeterminado (por ejemplo, todas las métricas)
                return res.status(400).json({
                    success: false,
                    message: 'Métrica de dashboard no válida o no especificada.',
                });
        }

        res.status(200).json({
            success: true,
            message: `Datos para la métrica '${metric}' obtenidos exitosamente.`,
            ...data // Devuelve los datos específicos de la métrica
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

/**
 * @desc    Actualizar configuraciones específicas del sistema (accesible por admin y supervisor).
 * @route   PUT /api/admin/system-settings
 * @access  Private (admin, supervisor)
 */
export const updateSystemSettings = async (req, res) => {
    try {
        const settings = await Setting.getSettings();

        if (req.body.defaultTaxRate !== undefined) {
            settings.defaultTaxRate = req.body.defaultTaxRate;
        }
        if (req.body.welcomeMessage !== undefined) {
            settings.welcomeMessage = req.body.welcomeMessage;
        }
        // Agrega aquí los campos para useInventoryModule, useRecipeModule, etc.
        if (req.body.useInventoryModule !== undefined) {
            settings.useInventoryModule = req.body.useInventoryModule;
        }
        if (req.body.useRecipeModule !== undefined) {
            settings.useRecipeModule = req.body.useRecipeModule;
        }

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Configuración del sistema actualizada exitosamente.',
            settings: {
                defaultTaxRate: settings.defaultTaxRate,
                welcomeMessage: settings.welcomeMessage,
                useInventoryModule: settings.useInventoryModule,
                useRecipeModule: settings.useRecipeModule,
            }
        });

    } catch (error) {
        console.error('[ADMIN ERROR] Update System Settings:', error);
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