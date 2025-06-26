// Archivo: server.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar modelos
import Order from './models/Order.js';

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
import dashboardRoutes from './routers/dashboardRoutes.js';
import settingsRoutes from './routers/settingRoutes.js';

dotenv.config();
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

console.log('--- Aplicando rutas API ---');


app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth aplicada.');

app.use('/api/admin', adminRoutes);
console.log('Ruta /api/admin aplicada.');

app.use('/api/config', configRoutes);
console.log('Ruta /api/config aplicada.');

app.use('/api/ingredients', ingredientRoutes);
console.log('Ruta /api/ingredients aplicada.');

app.use('/api/inventory', inventoryRoutes);
console.log('Ruta /api/inventory aplicada.');

app.use('/api/kitchen', kitchenRoutes);
console.log('Ruta /api/kitchen aplicada.');

app.use('/api/orders', orderRoutes);
console.log('Ruta /api/orders aplicada.');

app.use('/api/products', productRoutes);
console.log('Ruta /api/products aplicada.');

app.use('/api/recipes', recipeRoutes);
console.log('Ruta /api/recipes aplicada.');

app.use(tableRoutes);
console.log('Ruta /api/tables aplicada.');

app.use('/api/dashboard', dashboardRoutes);
console.log('Ruta /api/dashboard aplicada.');

app.use('/api/settings', settingsRoutes);
console.log('Ruta /api/settings aplicada.');

app.get('/api/orders/summary/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const count = orders.length;

    res.json({
      success: true,
      total,
      count,
      orders: orders.map(o => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount
      }))
    });
  } catch (error) {
    console.error('Error al obtener resumen diario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el resumen diario'
    });
  }
});

// Configuración para producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
} // <-- Aquí se cierra el bloque if

// Ruta de bienvenida (fuera del bloque de producción)
app.get('/', (req, res) => {
  res.send('API del Sistema de Gestión de Restaurante está funcionando...');
});

// Middleware para manejar errores 404
app.use((req, res, next) => {
  console.log(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global de Express:', err.stack);
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