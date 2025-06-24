import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md z-10"> {/* Sombra más pronunciada y z-index */}
      <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4"> {/* Ajustado el padding */}
        <div className="text-xl md:text-2xl font-bold text-gray-800">Panel de Control</div> {/* Texto más grande y oscuro */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="flex items-center cursor-pointer group"> {/* Añadido cursor-pointer y group para hover */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-lg font-semibold uppercase shadow-sm group-hover:bg-blue-600 transition-colors"> {/* Avatar con color y efecto hover */}
              {user?.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-800">{user?.name}</div>
              <div className="text-sm text-gray-600">{user?.role}</div> {/* Texto del rol más oscuro */}
            </div>
          </div>
          <button 
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-colors shadow-md text-sm md:text-base" // Botón de logout más atractivo
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;