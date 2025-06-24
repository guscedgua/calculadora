import { Link } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';

const OrderCard = ({ order }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200 hover:shadow-lg transition-shadow duration-300 ease-in-out"> {/* Sombra más definida y borde */}
      <div className="flex justify-between items-start mb-3"> {/* Margen inferior */}
        <div>
          <Link to={`/orders/${order._id}`} className="font-bold text-xl text-blue-700 hover:text-blue-800 hover:underline"> {/* Título más grande y con color */}
            Pedido #{order.orderNumber}
          </Link>
          <p className="text-gray-600 text-sm mt-1">Mesa: <span className="font-semibold">{order.table?.tableNumber || 'N/A'}</span></p> {/* Texto más pequeño y mesa destacada */}
          <p className="text-gray-600 text-sm">Cliente: <span className="font-semibold">{order.customerName || 'Sin nombre'}</span></p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-4 border-t border-gray-200 pt-3"> {/* Separador visual */}
        <p className="font-semibold text-gray-700 mb-2">Productos:</p> {/* Texto más oscuro */}
        <ul className="list-disc pl-5 text-gray-700 text-sm"> {/* Lista con bullet points y texto más oscuro */}
          {order.items.slice(0, 2).map((item, index) => (
            <li key={index} className="mb-1">{item.product?.name} x <span className="font-medium">{item.quantity}</span></li>
          ))}
          {order.items.length > 2 && <li className="text-gray-500">...y {order.items.length - 2} más</li>}
        </ul>
      </div>
      <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-3"> {/* Separador visual */}
        <span className="font-extrabold text-xl text-green-700">${order.totalAmount}</span> {/* Total más grande y verde */}
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleString()} {/* Formato de fecha y hora más completo */}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;