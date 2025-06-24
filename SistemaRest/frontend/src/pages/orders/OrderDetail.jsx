import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getOrderById, updateOrderStatus, deleteOrder } from '../../api/orders';
import Spinner from '../../components/ui/Spinner';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import Button from "../../components/ui/Button";
import Modal from '../../components/ui/Modal';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const { data: order, loading, error, execute } = useApi(() => getOrderById(id), {
    immediate: true
  });

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    try {
      await updateOrderStatus(id, { status: newStatus });
      execute();
      setNewStatus('');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(id);
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!order) return <div>Pedido no encontrado</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
          <div className="mt-2 flex items-center">
            <OrderStatusBadge status={order.status} />
            <span className="ml-4 text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Detalles del Pedido</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Información del Cliente</h3>
            <p>{order.customerName || 'No especificado'}</p>
            <p>{order.customerPhone || 'No especificado'}</p>
            {order.orderType === 'a domicilio' && (
              <p>{order.customerAddress || 'Dirección no especificada'}</p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Productos</h3>
            <ul className="divide-y">
              {order.items.map((item, index) => (
                <li key={index} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-600">Notas: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>x{item.quantity}</p>
                      <p>${(item.priceAtOrder * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-between">
            <span className="font-bold">Total:</span>
            <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          
          <div className="mb-6">
            <label className="block mb-2 font-medium">Cambiar Estado</label>
            <div className="flex">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 p-2 border rounded-l"
              >
                <option value="">Seleccionar estado</option>
                {['pendiente', 'en preparación', 'listo', 'entregado', 'pagado', 'cancelado'].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button 
                variant="primary"
                onClick={handleStatusChange}
                disabled={!newStatus}
              >
                Actualizar
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Información Adicional</h3>
            <p><span className="font-medium">Mesa:</span> {order.table?.number || 'N/A'}</p>
            <p><span className="font-medium">Atendido por:</span> {order.takenBy?.name || 'N/A'}</p>
            <p><span className="font-medium">Tipo:</span> {order.orderType}</p>
            <p><span className="font-medium">Método de pago:</span> {order.paymentMethod || 'No especificado'}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <div className="p-4">
          <p>¿Estás seguro de que deseas eliminar este pedido?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;