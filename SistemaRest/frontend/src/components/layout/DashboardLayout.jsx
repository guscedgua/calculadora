import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaBars, FaTimes, FaUtensils, FaSignOutAlt, 
  FaCog, FaUser, FaChartLine, FaBox, FaBell 
} from 'react-icons/fa';
import Spinner from '../../components/ui/Spinner';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentPageTitle, setCurrentPageTitle] = useState('Dashboard');
  const [loading, setLoading] = useState(true);

  // Set page title based on route
  useEffect(() => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Dashboard',
      '/orders': 'Gestión de Pedidos',
      '/orders/new': 'Nuevo Pedido',
      '/tables': 'Gestión de Mesas',
      '/products': 'Gestión de Productos',
      '/inventory': 'Control de Inventario',
      '/recipes': 'Recetas',
      '/settings': 'Configuración',
    };
    
    const title = Object.entries(titles).find(([key]) => path.startsWith(key));
    setCurrentPageTitle(title ? title[1] : 'RestaurantApp');
    
    // Close sidebar when route changes on mobile
    if (isMobile) setSidebarOpen(false);
    
    setLoading(false);
  }, [location, isMobile]);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Navigation items based on user role
  const navItems = useCallback(() => [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <FaChartLine className="text-xl" />,
      roles: ['admin', 'supervisor', 'mesero', 'cocinero']
    },
    { 
      path: '/orders', 
      label: 'Pedidos', 
      icon: <FaUtensils className="text-xl" />,
      roles: ['admin', 'supervisor', 'mesero']
    },
    { 
      path: '/tables', 
      label: 'Mesas', 
      icon: <FaBox className="text-xl" />,
      roles: ['admin', 'supervisor', 'mesero']
    },
    { 
      path: '/products', 
      label: 'Productos', 
      icon: <FaUtensils className="text-xl" />,
      roles: ['admin', 'supervisor']
    },
    { 
      path: '/inventory', 
      label: 'Inventario', 
      icon: <FaBox className="text-xl" />,
      roles: ['admin', 'supervisor']
    },
    { 
      path: '/recipes', 
      label: 'Recetas', 
      icon: <FaUtensils className="text-xl" />,
      roles: ['admin', 'supervisor', 'cocinero']
    },
    { 
      path: '/settings', 
      label: 'Configuración', 
      icon: <FaCog className="text-xl" />,
      roles: ['admin']
    },
  ], []);

  // Filter items based on user role
  const filteredItems = user ? navItems().filter(item => 
    item.roles.includes(user.role)
  ) : [];

  // Clear notifications
  const clearNotifications = () => {
    setNotifications(0);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className={`fixed top-4 left-4 z-30 lg:hidden ${sidebarOpen ? 'hidden' : 'block'}`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none"
          aria-label="Abrir menú"
        >
          <FaBars className="text-xl" />
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-900 shadow-xl`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-3 rounded-lg mr-3">
                <FaUtensils className="text-2xl" />
              </div>
              <h1 className="text-xl font-bold text-white">RestaurantApp</h1>
            </div>
          </div>
          
          <div className="lg:hidden absolute top-4 right-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
              aria-label="Cerrar menú"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          
          <nav className="flex-1 py-5 overflow-y-auto">
            {filteredItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'Rol'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow-md z-10">
          <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Alternar menú"
              >
                <FaBars className="text-xl" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{currentPageTitle}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 relative"
                  onClick={clearNotifications}
                  aria-label="Notificaciones"
                >
                  <FaBell className="text-xl" />
                  {notifications > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="relative profile-menu-container">
                <button 
                  className="flex items-center group"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Perfil de usuario"
                  aria-expanded={showProfileMenu}
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 text-lg font-semibold uppercase shadow-sm group-hover:bg-blue-600 transition-colors">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium text-gray-800">{user?.name || 'Usuario'}</div>
                    <div className="text-xs text-gray-600 capitalize">{user?.role || 'Rol'}</div>
                  </div>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'usuario@ejemplo.com'}</p>
                    </div>
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaUser className="mr-3 text-gray-500" />
                      Mi Perfil
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaCog className="mr-3 text-gray-500" />
                      Configuración
                    </button>
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                    >
                      <FaSignOutAlt className="mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 bg-white border-t border-gray-200 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} RestaurantApp - Sistema de Gestión de Restaurantes
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;