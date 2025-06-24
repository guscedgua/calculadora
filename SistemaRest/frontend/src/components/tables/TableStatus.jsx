// frontend/src/pages/tables/Tables.jsx
import React, { useState, useEffect } from 'react';
import Spinner from '../../components/ui/Spinner'; // Asumiendo que tienes un Spinner
import { getTables } from '../../api/tables'; // Asumiendo que esta es la ruta a tu archivo de servicios

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usa la función getTables del servicio, que internamente usa axiosInstance
        const response = await getTables(); 
        setTables(response.data);
      } catch (err) {
        let errorMessage = 'Error al cargar las mesas.';
        // Los errores de autenticación deberían ser manejados por el interceptor de axiosInstance
        // y redirigir al usuario al login. Aquí puedes manejar otros tipos de errores.
        if (err.response) {
          errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
          // Si el interceptor no redirigió, podrías tener una lógica de respaldo aquí
          if (err.response.status === 401 || err.response.status === 403) {
            errorMessage = 'No autorizado para ver las mesas. Tu sesión puede haber expirado o tus permisos son insuficientes.';
          }
        } else if (err.request) {
          errorMessage = 'No se recibió respuesta del servidor al intentar cargar las mesas. Verifica la conexión.';
        } else {
          errorMessage = `Error inesperado: ${err.message}`;
        }
        setError(errorMessage);
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []); // El API_URL ya no es una dependencia directa aquí, ya que el servicio lo maneja

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
        <p className="ml-4 text-gray-700">Cargando mesas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Mesas</h2>
      {tables.length === 0 ? (
        <p className="text-gray-600">No hay mesas disponibles o cargadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {tables.map(table => (
            <div key={table.id} className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Mesa #{table.number}</h3>
              <p className={`text-sm ${table.status === 'Ocupada' ? 'text-red-500' : 'text-green-500'}`}>
                Estado: {table.status}
              </p>
              <p className="text-sm text-gray-600">Capacidad: {table.capacity}</p>
              {/* Aquí podrías añadir un botón para ver detalles o acciones */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TablesPage;
