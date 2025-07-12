// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rutas
import adminRoutes from './routers/adminRoutes.js';
import authRoutes from './routers/authRoutes.js';
import configRoutes from './routers/configRoutes.js';
import dashboardRoutes from './routers/dashboardRoutes.js';
import ingredientRoutes from './routers/ingredientRoutes.js';
import inventoryRoutes from './routers/inventoryRoutes.js';
import kitchenRoutes from './routers/kitchenRoutes.js';
import orderRoutes from './routers/orderRoutes.js';
import productRoutes from './routers/productRoutes.js';
import recipeRoutes from './routers/recipeRoutes.js'; // Corregido: recipeRoutes.js
import reportRoutes from './routers/reportRoutes.js';
import settingRoutes from './routers/settingRoutes.js';
import supplierRoutes from './routers/supplierRoutes.js';
import tableRoutes from './routers/tableRoutes.js';
import userRoutes from './routers/userRoutes.js';

// Configuración de dotenv para cargar variables de entorno
dotenv.config();

const app = express();
// --- CORRECCIÓN AQUÍ: Asegúrate de que sea '||' (doble barra vertical) ---
const PORT = process.env.PORT || 5000; 

// Obtener __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Ajusta esto a tu frontend
    credentials: true // Permite el envío de cookies
}));
app.use(express.json()); // Para parsear cuerpos de solicitud JSON
app.use(express.urlencoded({ extended: true })); // Para parsear cuerpos de solicitud URL-encoded
app.use(cookieParser()); // Para parsear cookies

// Rutas de la API
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/users', userRoutes);

// Ruta de bienvenida para la API
app.get('/', (req, res) => {
    res.send('API del Sistema de Gestión de Restaurante está funcionando...');
});

// --- CORRECCIÓN CRÍTICA PARA EXPRESS V5 Y EL ERROR "Missing parameter name" ---
// Esta ruta debe ir DESPUÉS de todas tus rutas API específicas.
// Maneja cualquier ruta GET que no haya sido capturada por las rutas anteriores.
// Si estás sirviendo archivos estáticos de un frontend, esta ruta podría apuntar a tu index.html
// Por ejemplo, si tienes una carpeta 'frontend/build' con tu aplicación React/Angular/Vue:
// app.use(express.static(path.join(__dirname, '../frontend/build')));
// app.get('/{*any}', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
// });
// Para un simple mensaje de API, como en tu ejemplo:
app.get('/{*any}', (req, res) => { // Cambiado de '*' a '/{*any}'
    res.status(200).send('API del Sistema de Gestión de Restaurante está funcionando (ruta comodín).');
});

// Middleware para manejar rutas no encontradas (404)
// Este middleware debe ir DESPUÉS de todas tus rutas definidas
app.use((req, res, next) => {
    res.status(404).json({ message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
// Este middleware debe ser el ÚLTIMO en tu cadena de middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Loguea el stack de errores para depuración
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Error interno del servidor',
        // Incluir el stack de errores solo en desarrollo
        stack: process.env.NODE_ENV === 'production'? null : err.stack
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Accede a la API en: http://localhost:${PORT}`);
});