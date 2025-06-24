// Archivo: server.js
// Archivo principal del servidor Express.
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';

// Importar rutas
import authRoutes from './routers/authRoutes.js';
import adminRoutes from './routers/adminRoutes.js';
import configRoutes from './routers/configRoutes.js';
import ingredientRoutes from './routers/ingredientRoutes.js';
import inventoryRoutes from './routers/inventoryRoutes.js';
import kitchenRoutes from './routers/kitchenRoutes.js';
import orderRoutes from './routers/orderRoutes.js';
import productRoutes from './routers/productRoutes.js';
import recipeRoutes from './routers/recipeRoutes.js';
import tableRoutes from './routers/tableRoutes.js';


dotenv.config(); // Cargar variables de entorno

connectDB(); // Conectar a la base de datos

const app = express();

// *** MIDDLEWARE PARA PARSEAR EL CUERPO DE LAS PETICIONES (JSON Y URL-ENCODED) ***
// ¡ESTAS LÍNEAS DEBEN IR ANTES DE CUALQUIER DEFINICIÓN DE RUTAS!
app.use(express.json()); // Body parser para JSON
app.use(express.urlencoded({ extended: true })); // Body parser para URL-encoded
// *** FIN DEL MIDDLEWARE DE PARSING ***

app.use(cookieParser()); // Parser de cookies

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Reemplaza con el origen de tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log('--- Aplicando rutas API ---'); // LOG DE INICIO DE APLICACIÓN DE RUTAS

// Rutas API
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/admin', adminRoutes);
console.log('Ruta /api/admin aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/config', configRoutes);
console.log('Ruta /api/config aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/ingredients', ingredientRoutes);
console.log('Ruta /api/ingredients aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/inventory', inventoryRoutes);
console.log('Ruta /api/inventory aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/kitchen', kitchenRoutes);
console.log('Ruta /api/kitchen aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/orders', orderRoutes);
console.log('Ruta /api/orders aplicada.'); // LOG DE RUTA APLICADA (MUY IMPORTANTE)

app.use('/api/products', productRoutes);
console.log('Ruta /api/products aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/recipes', recipeRoutes);
console.log('Ruta /api/recipes aplicada.'); // LOG DE RUTA APLICADA

app.use('/api/tables', tableRoutes);
console.log('Ruta /api/tables aplicada.'); // LOG DE RUTA APLICADA

console.log('--- Rutas API aplicadas. ---'); // LOG DE FIN DE APLICACIÓN DE RUTAS


// Ruta de bienvenida
app.get('/', (req, res) => {
  res.send('API del Sistema de Gestión de Restaurante está funcionando...');
});

// Middleware para manejar errores no encontrados (404)
app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.originalUrl}`); // LOG DE RUTA NO ENCONTRADA
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global de Express:', err.stack); // LOG DE ERROR GLOBAL

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});
