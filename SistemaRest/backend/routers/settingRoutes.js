import express from 'express';
import { auth, roleCheck } from '../middleware/auth.js'; // Eliminado 'refreshToken' de aquí
import Setting from '../models/Setting.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware para adjuntar nuevos tokens
const attachNewTokens = (req, res, next) => {
    if (res.locals.newAccessToken) {
        // Enviar el nuevo access token en la cabecera de la respuesta
        res.set('Authorization', `Bearer ${res.locals.newAccessToken}`);
    }
    next();
};

// Middleware de manejo de errores de base de datos
const handleDBErrors = (error, res) => {
    console.error('Database Error:', error);

    if (error instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Error de validación en los datos',
            errors
        });
    }

    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            success: false,
            code: 'CAST_ERROR',
            message: 'Formato de dato inválido',
            field: error.path,
            value: error.value
        });
    }

    if (error.code === 11000) { // Error de clave duplicada (ej. si intentas crear más de una configuración única)
        return res.status(400).json({
            success: false,
            code: 'DUPLICATE_KEY',
            message: 'Ya existe una configuración en el sistema',
            field: Object.keys(error.keyPattern)[0]
        });
    }

    res.status(500).json({
        success: false,
        code: 'DATABASE_ERROR',
        message: 'Error interno de base de datos'
    });
};

// @desc    Obtener configuraciones del sistema
// @route   GET /api/settings
// @access  Privado (admin, supervisor)
router.get(
    '/',
    auth,
    roleCheck(['admin', 'supervisor']),
    attachNewTokens, // 'refreshToken' fue eliminado de aquí
    async (req, res) => {
        try {
            // Verificar conexión a la base de datos
            const dbState = mongoose.connection.readyState;
            if (dbState !== 1) { // 1 significa conectado
                throw new Error('Database not connected');
            }

            const settings = await Setting.findOne();

            if (!settings) {
                // Si no hay configuraciones, crear una predeterminada
                const defaultSettings = new Setting({
                    restaurantName: 'Mi Restaurante',
                    currency: '$',
                    taxRate: 10,
                    useInventoryModule: false,
                    useRecipeModule: false
                });

                const savedSettings = await defaultSettings.save();
                return res.json({
                    success: true,
                    message: 'Configuración predeterminada creada',
                    settings: savedSettings
                });
            }

            res.json({
                success: true,
                settings
            });
        } catch (error) {
            console.error('Error en GET /api/settings:', error);

            if (error.message === 'Database not connected') {
                return res.status(503).json({
                    success: false,
                    code: 'DB_CONNECTION_ERROR',
                    message: 'Base de datos no disponible'
                });
            }

            handleDBErrors(error, res);
        }
    }
);

// @desc    Actualizar configuraciones del sistema
// @route   PATCH /api/settings
// @access  Privado (solo admin)
router.patch(
    '/',
    auth,
    roleCheck(['admin']),
    attachNewTokens, // 'refreshToken' fue eliminado de aquí
    async (req, res) => {
        try {
            const {
                restaurantName,
                currency,
                taxRate,
                useInventoryModule,
                useRecipeModule
            } = req.body;

            // Validación completa de datos (mejor que solo confiar en Mongoose)
            if (!restaurantName || typeof restaurantName !== 'string' || restaurantName.trim() === '') {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_NAME',
                    message: 'El nombre del restaurante es requerido y debe ser una cadena de texto.'
                });
            }

            if (!currency || typeof currency !== 'string' || currency.length > 5 || currency.trim() === '') {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_CURRENCY',
                    message: 'La moneda es requerida y debe ser una cadena de hasta 5 caracteres.'
                });
            }

            // Considera parseFloat para taxRate si viene como string
            const parsedTaxRate = parseFloat(taxRate);
            if (isNaN(parsedTaxRate) || parsedTaxRate < 0 || parsedTaxRate > 100) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_TAX',
                    message: 'La tasa de impuesto debe ser un número entre 0 y 100.'
                });
            }

            // Booleanos
            const parsedUseInventoryModule = typeof useInventoryModule === 'boolean' ? useInventoryModule : Boolean(useInventoryModule);
            const parsedUseRecipeModule = typeof useRecipeModule === 'boolean' ? useRecipeModule : Boolean(useRecipeModule);

            // Actualizar configuración
            const settings = await Setting.findOneAndUpdate(
                {}, // Consulta vacía para encontrar el único documento de configuración
                {
                    restaurantName,
                    currency,
                    taxRate: parsedTaxRate,
                    useInventoryModule: parsedUseInventoryModule,
                    useRecipeModule: parsedUseRecipeModule
                },
                {
                    new: true, // Devuelve el documento modificado
                    upsert: true, // Crea el documento si no existe
                    runValidators: true, // Ejecuta los validadores definidos en el esquema
                    setDefaultsOnInsert: true // Aplica los valores por defecto si se hace un upsert y se inserta un nuevo doc
                }
            );

            res.json({
                success: true,
                message: 'Configuración actualizada correctamente',
                settings
            });
        } catch (error) {
            console.error('Error en PATCH /api/settings:', error);
            handleDBErrors(error, res);
        }
    }
);

export default router;