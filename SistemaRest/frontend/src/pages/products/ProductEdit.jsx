import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getProductById, updateProduct } from '../../api/products';
import ProductForm from '../../components/products/ProductForm';
import Spinner from '../../components/ui/Spinner';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, loading, error, execute } = useApi(() => getProductById(id), {
    immediate: true
  });
  
  const handleSubmit = async (productData) => {
    try {
      await updateProduct(id, productData);
      navigate(`/products/${id}`);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };
  
  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!product) return <div>Producto no encontrado</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Producto</h1>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate(`/products/${id}`)}
        >
          Cancelar
        </button>
      </div>
      
      <ProductForm 
        product={product} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default ProductEdit;