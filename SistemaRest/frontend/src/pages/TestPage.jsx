import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Prueba de estilos Tailwind CSS</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
            <p>Este es un mensaje informativo con estilo Tailwind</p>
          </div>
          
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Botón de prueba
          </button>
          
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;