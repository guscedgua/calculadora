import { useForm } from 'react-hook-form';

const ProductForm = ({ product, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {}
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          {...register('name', { required: 'Campo requerido' })}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea 
          className="w-full p-2 border rounded"
          rows="3"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full p-2 border rounded"
            {...register('price', { 
              required: 'Campo requerido',
              min: { value: 0.01, message: 'Precio debe ser mayor a 0' }
            })}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded"
            {...register('category', { required: 'Campo requerido' })}
          />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded"
            {...register('stock', { min: 0 })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select 
            className="w-full p-2 border rounded"
            {...register('isAvailable')}
          >
            <option value={true}>Disponible</option>
            <option value={false}>No Disponible</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL de la imagen</label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          {...register('imageUrl')}
        />
      </div>

      <div className="mt-6">
        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
        >
          {product ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;