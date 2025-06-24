import { NavLink } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
  return (
    <div className="w-64 bg-gray-900 text-white h-full fixed flex flex-col shadow-lg z-20"> {/* Fondo más oscuro, sombra y z-index */}
      <div className="p-4 text-2xl font-extrabold border-b border-gray-700 text-blue-400"> {/* Título con color y negrita */}
        RestauranteApp
      </div>
      <nav className="flex-1 py-5 overflow-y-auto"> {/* Espacio vertical y scroll */}
        {/* Enlace Dashboard */}
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}` // Borde a la izquierda para activo
          }
        >
          <span className="mr-3 text-xl">📊</span>
          <span className="font-medium text-lg">Dashboard</span>
        </NavLink>
        
        {/* Enlace Pedidos */}
        <NavLink 
          to="/orders" 
          className={({ isActive }) => 
            `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
            ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
          }
        >
          <span className="mr-3 text-xl">📋</span>
          <span className="font-medium text-lg">Pedidos</span>
        </NavLink>
        
        {/* Enlace Productos */}
        {(userRole === 'admin' || userRole === 'supervisor') && (
          <NavLink 
            to="/products" 
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
              ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
            }
          >
            <span className="mr-3 text-xl">🍔</span>
            <span className="font-medium text-lg">Productos</span>
          </NavLink>
        )}
        
        {/* Enlace Recetas */}
        {(userRole === 'admin' || userRole === 'supervisor' || userRole === 'cocinero') && (
          <NavLink 
            to="/recipes" 
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
              ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
            }
          >
            <span className="mr-3 text-xl">📝</span>
            <span className="font-medium text-lg">Recetas</span>
          </NavLink>
        )}
        
        {/* Enlace Inventario */}
        {(userRole === 'admin' || userRole === 'supervisor') && (
          <NavLink 
            to="/inventory" 
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
              ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
            }
          >
            <span className="mr-3 text-xl">📦</span>
            <span className="font-medium text-lg">Inventario</span>
          </NavLink>
        )}
        
        {/* Enlace Mesas */}
        {(userRole === 'admin' || userRole === 'supervisor' || userRole === 'mesero') && (
          <NavLink 
            to="/tables" 
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
              ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
            }
          >
            <span className="mr-3 text-xl">🪑</span>
            <span className="font-medium text-lg">Mesas</span>
          </NavLink>
        )}
        
        {/* Enlace Configuración */}
        {userRole === 'admin' && (
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200 ease-in-out 
              ${isActive ? 'bg-gray-700 text-blue-300 border-l-4 border-blue-400' : 'border-l-4 border-transparent'}`
            }
          >
            <span className="mr-3 text-xl">⚙️</span>
            <span className="font-medium text-lg">Configuración</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;