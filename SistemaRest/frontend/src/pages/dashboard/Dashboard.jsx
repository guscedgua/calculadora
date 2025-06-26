// frontend/src/pages/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios'; // Importa tu instancia de Axios configurada
import Spinner from '../../components/ui/Spinner'; // Asume que tienes un componente Spinner para la carga
import { FaChartLine, FaUtensils, FaBox } from 'react-icons/fa'; // Iconos para las tarjetas

const Dashboard = () => {
    // Estados para almacenar los datos del dashboard
    const [ordersToday, setOrdersToday] = useState(null);
    const [totalSales, setTotalSales] = useState(null);
    const [occupiedTables, setOccupiedTables] = useState(null);
    const [totalTables, setTotalTables] = useState(null);
    const [loadingData, setLoadingData] = useState(true); // Estado de carga para los datos
    const [errorData, setErrorData] = useState(null); // Estado para manejar errores al cargar datos

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoadingData(true);
            setErrorData(null); // Limpiar errores previos

            try {
                // *** 1. Obtener Órdenes Hoy ***
                // CORRECCIÓN CLAVE: La ruta ahora es /api/dashboard/summary/ordersToday
                const ordersRes = await axiosInstance.get('/api/dashboard/summary/ordersToday');
                setOrdersToday(ordersRes.data.count); // Ajusta 'count' según la estructura de tu respuesta

                // *** 2. Obtener Ventas Totales ***
                // CORRECCIÓN CLAVE: La ruta ahora es /api/dashboard/summary/totalSales
                const salesRes = await axiosInstance.get('/api/dashboard/summary/totalSales');
                setTotalSales(salesRes.data.totalAmount); // Ajusta 'totalAmount' según tu respuesta

                // *** 3. Obtener Estado de Mesas ***
                // CORRECCIÓN CLAVE: La ruta ahora es /api/dashboard/summary/tablesStatus
                const tablesRes = await axiosInstance.get('/api/dashboard/summary/tablesStatus');
                setOccupiedTables(tablesRes.data.occupied); // Ajusta según tu respuesta
                setTotalTables(tablesRes.data.total);     // Ajusta según tu respuesta

            } catch (err) {
                console.error('Error al cargar datos del dashboard:', err);
                setErrorData('No se pudieron cargar los datos del dashboard. Verifica tu conexión al backend y los permisos.');
                // En caso de error, puedes restablecer los valores a nulo o cero
                setOrdersToday(0);
                setTotalSales(0);
                setOccupiedTables(0);
                setTotalTables(0);
            } finally {
                setLoadingData(false);
            }
        };

        fetchDashboardData();
    }, []); // El array de dependencias vacío asegura que esto se ejecute solo una vez al montar

    // Renderizado condicional basado en el estado de carga y error de los datos
    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-md">
                <Spinner size="lg" />
                <p className="ml-4 text-gray-700">Cargando datos del dashboard...</p>
            </div>
        );
    }

    if (errorData) {
        return (
            <div className="p-5 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md text-center">
                <p className="font-bold mb-2">Error al cargar el Dashboard:</p>
                <p>{errorData}</p>
                <p className="mt-3 text-sm text-red-600">Por favor, verifica que tu backend esté funcionando y que tengas los permisos adecuados.</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido al Dashboard</h2>
            <p className="text-gray-600 mb-6">Este es el panel principal de control de tu restaurante. Aquí podrás ver un resumen de tus operaciones, estadísticas clave y accesos rápidos.</p>

            {/* Cuadrícula de tarjetas de estadísticas dinámicas */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjeta de Órdenes Hoy */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-200 p-6 rounded-xl shadow-lg border border-blue-300 transform transition duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-blue-900">Órdenes Hoy</h3>
                        <FaUtensils className="text-blue-600 text-3xl" />
                    </div>
                    <p className="text-5xl font-extrabold text-blue-700">{ordersToday !== null ? ordersToday : '--'}</p>
                    <p className="text-sm text-blue-600 mt-2">Pedidos recibidos en el día.</p>
                </div>

                {/* Tarjeta de Ventas Totales */}
                <div className="bg-gradient-to-br from-green-50 to-green-200 p-6 rounded-xl shadow-lg border border-green-300 transform transition duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-green-900">Ventas Totales</h3>
                        <FaChartLine className="text-green-600 text-3xl" />
                    </div>
                    <p className="text-5xl font-extrabold text-green-700">${totalSales !== null ? totalSales.toFixed(2) : '--'}</p>
                    <p className="text-sm text-green-600 mt-2">Ingresos generados hasta ahora.</p>
                </div>

                {/* Tarjeta de Mesas Ocupadas */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-200 p-6 rounded-xl shadow-lg border border-purple-300 transform transition duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-purple-900">Mesas Ocupadas</h3>
                        <FaBox className="text-purple-600 text-3xl" />
                    </div>
                    <p className="text-5xl font-extrabold text-purple-700">{occupiedTables !== null ? `${occupiedTables}/${totalTables}` : '--/--'}</p>
                    <p className="text-sm text-purple-600 mt-2">Mesas actualmente en uso.</p>
                </div>
                
                {/* Puedes añadir más tarjetas o secciones aquí */}

            </div>
            {/* Aquí puedes añadir otros componentes del dashboard, como gráficos, listas recientes, etc. */}
        </div>
    );
};

export default Dashboard;