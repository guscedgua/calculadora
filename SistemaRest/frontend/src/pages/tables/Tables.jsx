// src/pages/tables/Tables.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TableStatusCard from '../../components/tables/TableStatus';
import { TABLE_STATUS } from '../../utils/constants';
import { getTableStatusName } from '../../utils/helpers';
import { showToast } from '../../components/ui/Toast';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Función para obtener las mesas
  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/tables');
      setTables(response.data.tables);
    } catch (err) {
      // Manejo específico de errores
      let errorMessage = 'Error al cargar las mesas';
      
      if (err.response) {
        if (err.response.status === 401) {
          // El interceptor ya debería haber manejado la redirección
          errorMessage = 'Tu sesión ha expirado. Redirigiendo al login...';
        } else {
          errorMessage = err.response.data?.message || `Error del servidor: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión.';
      } else {
        errorMessage = `Error inesperado: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Reintentar automáticamente 2 veces
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [retryCount]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setShowModal(true);
  };

  const handleStatusChange = async () => {
    if (!selectedTable || !newStatus) return;
    
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/tables/${selectedTable._id}/status`, { status: newStatus });
      
      // Actualizar estado local sin recargar toda la lista
      setTables(prevTables => 
        prevTables.map(table => 
          table._id === selectedTable._id ? { ...table, status: newStatus } : table
        )
      );
      
      setShowModal(false);
      showToast(`Estado actualizado a: ${getTableStatusName(newStatus)}`, 'success');
    } catch (err) {
      console.error('Error updating table status:', err);
      
      let errorMessage = 'Error al actualizar el estado';
      if (err.response?.status === 401) {
        errorMessage = 'Sesión expirada. Redirigiendo...';
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Renderizar diferentes estados
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Cargando mesas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar mesas</h2>
          <p className="text-red-700 mb-4">{error}</p>
          
          {retryCount < 2 ? (
            <div className="flex items-center">
              <Spinner size="sm" />
              <span className="ml-2 text-gray-600">Reintentando en 3 segundos...</span>
            </div>
          ) : (
            <Button variant="primary" onClick={() => {
              setRetryCount(0);
              fetchTables();
            }}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Mesas</h1>
          <p className="text-gray-600 mt-1">
            {tables.length} {tables.length === 1 ? 'mesa registrada' : 'mesas registradas'}
          </p>
        </div>
        <Button 
          variant="secondary"
          onClick={fetchTables}
          icon="refresh"
        >
          Actualizar lista
        </Button>
      </div>
      
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => (
            <div 
              key={table._id} 
              className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              onClick={() => handleTableClick(table)}
              data-testid={`table-${table.number}`}
            >
              <TableStatusCard table={table} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No hay mesas registradas</h3>
          <p className="text-gray-500 mb-4">
            Parece que no hay mesas disponibles en este momento.
          </p>
          <Button variant="primary" onClick={fetchTables}>
            Recargar mesas
          </Button>
        </div>
      )}
      
      {/* Modal para cambiar estado */}
      <Modal 
        isOpen={showModal}
        onClose={() => !isUpdating && setShowModal(false)}
        title={`Mesa #${selectedTable?.number}`}
        size="md"
      >
        <div className="p-5">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado actual
            </label>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedTable?.status === TABLE_STATUS.AVAILABLE 
                ? 'bg-green-100 text-green-800' 
                : selectedTable?.status === TABLE_STATUS.OCCUPIED 
                  ? 'bg-yellow-100 text-yellow-800'
                  : selectedTable?.status === TABLE_STATUS.RESERVED 
                    ? 'bg-blue-100 text-blue-800'
                    : selectedTable?.status === TABLE_STATUS.CLEANING 
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
            }`}>
              <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
              {getTableStatusName(selectedTable?.status)}
            </div>
          </div>
          
          <div className="mb-7">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cambiar a
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isUpdating}
            >
              {Object.values(TABLE_STATUS).map(status => (
                <option key={status} value={status}>
                  {getTableStatusName(status)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={handleStatusChange}
              disabled={newStatus === selectedTable?.status || isUpdating}
              isLoading={isUpdating}
              loadingText="Actualizando..."
            >
              Confirmar cambio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tables;