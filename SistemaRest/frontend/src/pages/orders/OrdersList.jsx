import { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getOrders } from '../../api/orders';
import OrderCard from '../../components/orders/OrderCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const OrdersList = () => {
  const [filter, setFilter] = useState('all');
  const { data, loading, error, execute } = useApi(getOrders, { immediate: true });
  
  const filteredOrders = data?.orders?.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const refreshOrders = () => {
    execute();
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <div className="flex space-x-2">
          <Button variant="primary" as={Link} to="/orders/new">
            Nuevo Pedido
          </Button>
          <Button variant="secondary" onClick={refreshOrders}>
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button 
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('pendiente')}
        >
          Pendientes
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'en preparación' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('en preparación')}
        >
          En preparación
        </button>
        <button 
          className={`px-4 py-2 rounded ${filter === 'listo' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setFilter('listo')}
        >
          Listos
        </button>
      </div>

      {loading && <Spinner />}
      {error && <div className="text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders?.map(order => (
            <Link to={`/orders/${order._id}`} key={order._id}>
              <OrderCard order={order} />
            </Link>
          ))}
          {filteredOrders?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No hay pedidos con este filtro</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersList;