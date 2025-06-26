// backend/controllers/dashboardController.js
// Controladores para obtener los datos de resumen del dashboard.

import Order from '../models/Order.js'; // Importa el modelo de Órdenes
import Table from '../models/Table.js'; // Importa el modelo de Mesas

/**
 * @desc    Obtener el resumen de órdenes realizadas hoy
 * @route   GET /api/dashboard/summary/ordersToday
 * @access  Private (admin, supervisor, mesero, cocinero)
 */
export const getOrdersTodaySummary = async (req, res) => {
    try {
        // Establece el inicio y el fin del día actual en la zona horaria del servidor
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00.000

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // Establece la hora a 23:59:59.999

        // Cuenta el número de documentos (órdenes) creados entre el inicio y el fin del día
        const ordersCount = await Order.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        // Responde con el conteo de órdenes
        res.status(200).json({ success: true, count: ordersCount });
    } catch (error) {
        console.error('Error al obtener órdenes de hoy (Dashboard):', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener el resumen de órdenes de hoy.' });
    }
};

/**
 * @desc    Obtener el resumen de ventas totales
 * @route   GET /api/dashboard/summary/totalSales
 * @access  Private (admin, supervisor, mesero)
 */
export const getTotalSalesSummary = async (req, res) => {
    try {
        // Agrega órdenes para sumar el campo 'totalAmount'.
        // Podrías añadir condiciones de filtrado aquí (ej. por estado 'completada', por rango de fechas).
        const result = await Order.aggregate([
            {
                // Solo considera órdenes que han sido 'pagada' para el total de ventas
                $match: { status: 'pagada' }
            },
            {
                // Agrupa todos los documentos restantes y suma sus 'totalAmount'
                $group: {
                    _id: null, // 'null' agrupa todos los documentos en un solo grupo
                    totalAmount: { $sum: '$totalAmount' } // Suma el campo 'totalAmount'
                }
            }
        ]);

        // Si hay resultados, toma el totalAmount del primer grupo; de lo contrario, 0
        const totalSalesAmount = result.length > 0 ? result[0].totalAmount : 0;

        res.status(200).json({ success: true, totalAmount: totalSalesAmount });
    } catch (error) {
        console.error('Error al obtener ventas totales (Dashboard):', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener el resumen de ventas totales.' });
    }
};

/**
 * @desc    Obtener el resumen del estado de las mesas (ocupadas vs. total)
 * @route   GET /api/dashboard/summary/tablesStatus
 * @access  Private (admin, supervisor, mesero)
 */
export const getTablesStatusSummary = async (req, res) => {
    try {
        // Cuenta el total de mesas registradas
        const totalTables = await Table.countDocuments();
        
        // Cuenta el número de mesas que están en estado 'occupied'
        const occupiedTablesCount = await Table.countDocuments({ status: 'occupied' });

        // Responde con el conteo de mesas ocupadas y el total
        res.status(200).json({ 
            success: true, 
            occupied: occupiedTablesCount, 
            total: totalTables 
        });
    } catch (error) {
        console.error('Error al obtener estado de mesas (Dashboard):', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al obtener el resumen del estado de las mesas.' });
    }
};