import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getTables } from '../../api/tables';
import { getProducts } from '../../api/products';
import { createOrder } from '../../api/orders';
import OrderForm from '../../components/orders/OrderForm';
import Spinner from '../../components/ui/Spinner';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async () => {
    try {
      const [tablesRes, productsRes] = await Promise.all([
        getTables(),
        getProducts()
      ]);
      setTables(tablesRes.tables);
      setProducts(productsRes.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSubmit = async (orderData) => {
    try {
      const response = await createOrder(orderData);
      navigate(`/orders/${response.order._id}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Nuevo Pedido</h1>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate('/orders')}
        >
          Cancelar
        </button>
      </div>
      
      <OrderForm 
        tables={tables} 
        products={products} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default CreateOrder;