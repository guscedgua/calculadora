// frontend/src/context/SettingsContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../api/settings';
import { useAuth } from './AuthContext'; // Importa useAuth

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Obtiene el usuario del AuthContext

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getSettings();
      setSettings(response.settings);
      setError(null);
    } catch (err) {
      setError('Error al cargar la configuración del sistema');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      // Aquí normalmente llamarías a la API para actualizar (ej: await updateSettingsAPI(newSettings);)
      // Luego, actualizarías el estado local con la respuesta del servidor.
      // Por ahora, solo actualizamos localmente
      setSettings(newSettings); 
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Solo intenta cargar la configuración si el usuario está disponible (autenticado)
    // o si la ruta de settings permite acceso público sin usuario (menos común para admin/supervisor)
    // Si SettingsContext depende de la autenticación, esta es una buena práctica.
    if (user || !loading) { // O si quieres que cargue incluso si no hay usuario (ej. para settings públicos)
      fetchSettings();
    }
  }, [user]); // Vuelve a ejecutar cuando el usuario cambia (ej. después del login)

  const value = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: fetchSettings,
    isModuleEnabled: (moduleName) => {
      if (!settings || !settings.moduleAccess) return false;
      // Convertir el Map a un objeto si es necesario, o acceder directamente
      const moduleAccessArray = settings.moduleAccess[moduleName]; // Asumiendo que moduleAccess es un objeto o Map accesible
      
      // Si moduleAccess es un Map real de Mongoose, se accede con .get()
      // Si es un objeto JSON plano (como suele ser después de la deserialización), se accede con [key]
      // Aquí asumo que después de la respuesta de la API, moduleAccess es un objeto JSON o similar.
      const rolesAllowed = Array.isArray(moduleAccessArray) ? moduleAccessArray : (settings.moduleAccess.get ? settings.moduleAccess.get(moduleName) : undefined);

      if (!rolesAllowed) return false;

      return rolesAllowed.includes('*') || 
             (user && rolesAllowed.includes(user.role)); // Usamos 'user' que ahora viene del AuthContext
    }
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings debe usarse dentro de un SettingsProvider');
  }
  return context;
};