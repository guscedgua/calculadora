import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={`/products/${product._id}`}
              className="font-semibold text-lg hover:underline"
            >
              {product.name}
            </Link>
            <p className="text-gray-600 text-sm mt-1">{product.category}</p>
          </div>
          <span className="font-bold">${product.price}</span>
        </div>
        
        <div className="mt-3">
          <p className="text-gray-700 text-sm line-clamp-2">{product.description}</p>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-xs ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.isAvailable ? 'Disponible' : 'No Disponible'}
          </span>
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;