// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './components/layout/DashboardLayout';
import RestaurantLogin from './pages/auth/Login'; 
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

import Dashboard from './pages/dashboard/Dashboard'; 

console.log("¡Este mensaje DEBE aparecer si el frontend se carga!");

function App() {
  return (
    // CORRECCIÓN: BrowserRouter debe ser el contenedor PRINCIPAL
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<RestaurantLogin />} /> 
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rutas Protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} /> 
                <Route path="orders" element={<OrdersList />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="orders/new" element={<CreateOrder />} />
                <Route path="tables" element={<TablesPage />} />

                {/* Rutas de Administrador */}
                <Route element={<AdminRoute />}>
                  <Route path="products" element={<ProductsList />} />
                  <Route path="products/:id" element={<ProductEdit />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>

            {/* Manejo de errores */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter> // ← BrowserRouter ahora envuelve TODO
  );
}

export default App;