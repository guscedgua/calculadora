// src/pages/error/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <FaLock className="text-red-500 text-4xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso no autorizado</h1>
        <p className="text-gray-700 mb-6">
          No tienes permiso para acceder a esta página. Por favor, contacta al administrador si necesitas acceso.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Volver al inicio
          </Link>
          
          <Link 
            to="/login" 
            className="flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;