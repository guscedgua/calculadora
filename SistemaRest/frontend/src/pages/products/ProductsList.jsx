import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getProducts } from '../../api/products';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const ProductsList = () => {
  const { user } = useAuth();
  const { data, loading, error, execute } = useApi(getProducts, { immediate: true });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        {user?.role === 'admin' && (
          <Button as={Link} to="/products/new" variant="primary">
            Nuevo Producto
          </Button>
        )}
      </div>
      
      {loading && <Spinner />}
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.products?.map(product => (
            <Link to={`/products/${product._id}`} key={product._id}>
              <ProductCard product={product} />
            </Link>
          ))}
          {data?.products?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos registrados</p>
              {user?.role === 'admin' && (
                <Button as={Link} to="/products/new" variant="primary" className="mt-4">
                  Crear Primer Producto
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsList;