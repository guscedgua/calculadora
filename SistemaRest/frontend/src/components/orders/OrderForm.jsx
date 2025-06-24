import { useState } from 'react';
import { useForm } from 'react-hook-form';

const OrderForm = ({ tables, products, onSubmit }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const addProduct = (product) => {
    // Evita duplicados o añade a la cantidad si ya está seleccionado
    const existingProductIndex = selectedProducts.findIndex(item => item._id === product._id);
    if (existingProductIndex > -1) {
      updateQuantity(existingProductIndex, selectedProducts[existingProductIndex].quantity + 1);
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeProduct = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity < 1) {
      removeProduct(index); // Eliminar si la cantidad llega a 0
      return;
    }
    setSelectedProducts(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const submitHandler = (data) => {
    if (selectedProducts.length === 0) {
      alert('Debe agregar al menos un producto al pedido.');
      return;
    }
    
    const orderData = {
      ...data,
      items: selectedProducts.map(item => ({
        product: item._id,
        quantity: item.quantity,
        priceAtOrder: item.price // Asegúrate de que el precio se guarda al momento del pedido
      })),
      totalAmount: selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    onSubmit(orderData);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto my-8"> {/* Contenedor del formulario */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crear Nuevo Pedido</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Mayor separación entre columnas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Detalles del Pedido</h3>
          
          <div className="mb-5"> {/* Mayor margen inferior */}
            <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pedido</label>
            <select 
              id="orderType"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm" // Estilo mejorado para select
              {...register('orderType', { required: 'El tipo de pedido es requerido' })}
            >
              <option value="comer aquí">Comer aquí</option>
              <option value="para llevar">Para llevar</option>
              <option value="a domicilio">A domicilio</option>
            </select>
            {errors.orderType && <p className="text-red-500 text-xs mt-1">{errors.orderType.message}</p>}
          </div>

          <div className="mb-5">
            <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
            <select 
              id="table"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              {...register('table')}
            >
              <option value="">Seleccione una mesa (opcional)</option>
              {tables.filter(t => t.status === 'available').map(table => (
                <option key={table._id} value={table._id}>
                  Mesa {table.number} (Capacidad: {table.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <input 
              id="customerName"
              type="text" 
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Nombre del cliente (opcional)"
              {...register('customerName')}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input 
              id="customerPhone"
              type="text" 
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Teléfono del cliente (opopcional)"
              {...register('customerPhone')}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Productos del Pedido</h3>
          
          <div className="mb-5">
            <label htmlFor="addProduct" className="block text-sm font-medium text-gray-700 mb-1">Agregar Producto</label>
            <select 
              id="addProduct"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm mb-2"
              onChange={(e) => {
                const product = products.find(p => p._id === e.target.value);
                if (product) addProduct(product);
                e.target.value = ''; // Resetear la selección
              }}
              defaultValue="" // Asegurar que la opción predeterminada se selecciona visualmente
            >
              <option value="" disabled>Seleccione un producto</option>
              {products.filter(p => p.isAvailable).map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} (${product.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <h4 className="font-semibold text-gray-700 mb-3">Productos Seleccionados</h4>
            {selectedProducts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Agregue productos usando el selector de arriba.</p>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden"> {/* Borde y división para la lista */}
                {selectedProducts.map((item, index) => (
                  <li key={index} className="py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <button 
                          type="button"
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full flex items-center justify-center text-lg leading-none pb-0.5 transition-colors" // Botones de cantidad más pulidos
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="mx-2 font-semibold text-base">{item.quantity}</span>
                        <button 
                          type="button"
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full flex items-center justify-center text-lg leading-none pb-0.5 transition-colors"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center ml-4">
                      <span className="mr-4 font-bold text-lg text-green-700">${(item.price * item.quantity).toFixed(2)}</span>
                      <button 
                        type="button"
                        className="text-red-500 hover:text-red-700 transition-colors text-xl font-bold"
                        onClick={() => removeProduct(index)}
                        title="Eliminar producto"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="text-right font-extrabold text-2xl text-green-800 mt-6 pt-4 border-t-2 border-gray-200"> {/* Total más grande y llamativo */}
            Total: ${selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center"> {/* Botón centralizado */}
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-10 rounded-lg transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Crear Pedido
        </button>
      </div>
    </form>
  );
};

export default OrderForm;