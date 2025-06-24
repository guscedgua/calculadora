import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  const { user, login, logout, loading } = context;

  const isAuthenticated = !!user;
  
  const requireAuth = (requiredRoles = []) => {
    if (loading) return false;
    
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
      return false;
    }
    
    // Verificar roles si se especifican
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      navigate('/unauthorized', { replace: true });
      return false;
    }
    
    return true;
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    requireAuth,
    hasRole: (role) => user?.role === role
  };
};