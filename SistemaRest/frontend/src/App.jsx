// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './components/layout/DashboardLayout';
import RestaurantLogin from './pages/auth/Login'; // Importación corregida
import Register from './pages/auth/Register';
import OrdersList from './pages/orders/OrdersList';
import OrderDetail from './pages/orders/OrderDetail';
import CreateOrder from './pages/orders/CreateOrder';
import ProductsList from './pages/products/ProductsList';
import ProductEdit from './pages/products/ProductEdit';
import Inventory from './pages/inventory/Inventory';
import Recipes from './pages/recipes/Recipes';
import Settings from './pages/settings/Settings';
import TablesPage from './pages/tables/Tables';
import Unauthorized from './pages/error/Unauthorized';
import NotFound from './pages/error/NotFound';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import './index.css';

// Importa el componente de tu dashboard principal.
// Asegúrate de crear este archivo si no existe.
import Dashboard from './pages/dashboard/Dashboard'; 

console.log("¡Este mensaje DEBE aparecer si el frontend se carga!");

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas (accesibles sin autenticación) */}
            <Route path="/login" element={<RestaurantLogin />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rutas Protegidas que usan DashboardLayout.
                La PrivateRoute se encarga de verificar la autenticación.
                Si no está autenticado, PrivateRoute DEBE redirigir a /login.
                Si está autenticado, se renderiza el DashboardLayout y sus rutas anidadas.
            */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                {/* Ruta index: Se renderiza cuando la ruta es exactamente "/" o "/dashboard"
                    (si DashboardLayout es el elemento de la ruta principal "/").
                */}
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} /> {/* Ruta explícita para /dashboard */}
                
                {/* Rutas de Órdenes (anidadas y relativas a la ruta padre "/") */}
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="orders/new" element={<CreateOrder />} />

                {/* Rutas de Mesas (anidadas y relativas a la ruta padre "/") */}
                <Route path="tables" element={<TablesPage />} />

                {/* Rutas para Administradores (anidadas dentro de DashboardLayout y protegidas por AdminRoute).
                    Estas también son relativas a la ruta padre ("/").
                */}
                <Route element={<AdminRoute />}>
                  <Route path="products" element={<ProductsList />} />
                  <Route path="products/:id" element={<ProductEdit />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>

            {/* Rutas para manejo de errores y rutas no encontradas.
                La redirección por defecto a /login ya no es necesaria aquí si PrivateRoute maneja la lógica.
                Esta ruta catch-all solo se activará si ninguna ruta anterior (incluyendo las públicas y las protegidas vía PrivateRoute) coincide.
            */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
