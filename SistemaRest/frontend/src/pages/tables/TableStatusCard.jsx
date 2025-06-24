import React from 'react';
import { TABLE_STATUS } from '../../utils/constants';
import { getTableStatusName } from '../../utils/helpers';

const TableStatusCard = ({ table }) => {
  // Determinar colores según el estado
  const statusColors = {
    [TABLE_STATUS.AVAILABLE]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500'
    },
    [TABLE_STATUS.OCCUPIED]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500'
    },
    [TABLE_STATUS.RESERVED]: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-500'
    },
    [TABLE_STATUS.CLEANING]: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-500'
    },
    [TABLE_STATUS.UNAVAILABLE]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500'
    },
    default: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-500'
    }
  };

  // Obtener colores para el estado actual
  const colors = statusColors[table.status] || statusColors.default;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Mesa #{table.number}</h3>
            <p className="text-sm text-gray-500 mt-1">Capacidad: {table.capacity} personas</p>
          </div>
          
          <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${colors.dot}`}></span>
            {getTableStatusName(table.status)}
          </div>
        </div>
        
        {table.currentOrder && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Orden actual:</span> #{table.currentOrder}
            </p>
          </div>
        )}
        
        {table.lastCleanedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Última limpieza: {new Date(table.lastCleanedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-5 py-3 text-right">
        <span className="text-xs text-gray-500">Haz clic para editar</span>
      </div>
    </div>
  );
};

export default TableStatusCard;