import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, refreshToken as apiRefreshToken } from '../api/auth';
import axiosInstance from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (email, password) => {
        try {
            const { user: userData, accessToken, refreshToken } = await loginUser({ email, password });

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setUser(userData);
            setIsAuthenticated(true);
            
            return sessionStorage.getItem('redirectPath') || '/orders';

        } catch (error) {
            console.error('Error en AuthContext login:', error);
            throw error; 
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Error en AuthContext logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            axiosInstance.defaults.headers.common['Authorization'] = '';
            setUser(null);
            setIsAuthenticated(false);
        }
        return '/login';
    }, []);

    useEffect(() => {
        let isMounted = true; // Bandera para controlar el estado montado
        
        const verifyAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedToken && storedUser) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                try {
                    await axiosInstance.get('/api/auth/profile');
                    
                    if (isMounted) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    if (error.response?.status === 401 || error.response?.status === 403) {
                         console.log("Token inválido o expirado. Forzando logout.");
                         await logout();
                         window.location.href = '/login';
                    }
                }
            } else if (storedRefreshToken) {
                try {
                    const { accessToken } = await apiRefreshToken(storedRefreshToken);
                    localStorage.setItem('token', accessToken);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    
                    if (isMounted) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                    }
                } catch (refreshErr) {
                    console.error('Error al refrescar token:', refreshErr);
                    await logout();
                    window.location.href = '/login';
                }
            } else {
                // Solo muestra en desarrollo para evitar ruido en producción
                if (process.env.NODE_ENV === 'development') {
                    console.log('No se encontraron tokens de autenticación. Usuario no autenticado.');
                }
            }
            
            if (isMounted) {
                setLoading(false);
            }
        };

        verifyAuth();

        return () => {
            isMounted = false; // Limpiar al desmontar
        };
    }, [logout]);

    const authContextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};