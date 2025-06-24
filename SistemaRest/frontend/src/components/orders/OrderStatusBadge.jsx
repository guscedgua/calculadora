// src/components/OrderStatusBadge.jsx
import React from 'react';

const OrderStatusBadge = ({ status }) => {
  let badgeClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ";
  let statusText = "";

  switch (status) {
    case 'pending':
      badgeClasses += "bg-yellow-100 text-yellow-800";
      statusText = "Pendiente";
      break;
    case 'preparing':
      badgeClasses += "bg-blue-100 text-blue-800";
      statusText = "Preparando";
      break;
    case 'ready':
      badgeClasses += "bg-green-100 text-green-800";
      statusText = "Listo";
      break;
    case 'delivered':
      badgeClasses += "bg-purple-100 text-purple-800";
      statusText = "Entregado";
      break;
    case 'cancelled':
      badgeClasses += "bg-red-100 text-red-800";
      statusText = "Cancelado";
      break;
    default:
      badgeClasses += "bg-gray-100 text-gray-800";
      statusText = "Desconocido";
      break;
  }

  return (
    <span className={badgeClasses}>
      {statusText}
    </span>
  );
};

export default OrderStatusBadge;