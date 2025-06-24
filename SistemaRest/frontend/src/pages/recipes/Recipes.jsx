import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { getRecipes } from '../../api/recipes';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const Recipes = () => {
  const { user } = useAuth();
  const { data, loading, error, execute } = useApi(getRecipes, { immediate: true });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recetas</h1>
        {user?.role === 'admin' && (
          <Button as={Link} to="/recipes/new" variant="primary">
            Nueva Receta
          </Button>
        )}
      </div>
      
      {loading && <Spinner />}
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.recipes?.map(recipe => (
            <Link to={`/recipes/${recipe._id}`} key={recipe._id}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <h3 className="font-bold text-lg">{recipe.dishName}</h3>
                <p className="text-gray-600 mt-2">{recipe.category}</p>
                <div className="mt-4">
                  <p className="font-medium">Ingredientes:</p>
                  <ul className="list-disc pl-5 mt-2">
                    {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                      <li key={idx}>
                        {ing.quantityNeeded} {ing.unit} de {ing.item?.name}
                      </li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li>... y {recipe.ingredients.length - 3} más</li>
                    )}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
          {data?.recipes?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No hay recetas registradas</p>
              {user?.role === 'admin' && (
                <Button as={Link} to="/recipes/new" variant="primary" className="mt-4">
                  Crear Primera Receta
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Recipes;