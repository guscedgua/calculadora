// frontend/src/pages/dashboard/Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Dashboard</h2>
      <p className="text-gray-600">Este es el panel principal de control de tu restaurante. Aquí podrás ver un resumen de tus operaciones, estadísticas clave y accesos rápidos.</p>
      {/* Puedes empezar a añadir más contenido aquí, como widgets, gráficos, etc. */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-xl font-semibold text-blue-800">Órdenes Hoy</h3>
          <p className="text-3xl font-bold text-blue-700">125</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-xl font-semibold text-green-800">Ventas Totales</h3>
          <p className="text-3xl font-bold text-green-700">$1,500</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-xl font-semibold text-purple-800">Mesas Ocupadas</h3>
          <p className="text-3xl font-bold text-purple-700">8/15</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
