import React from 'react';
import PropTypes from 'prop-types';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend,
  trendText,
  className = ''
}) => {
  // Colores para el fondo del ícono y el texto de tendencia
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      trendText: 'text-green-600' // Para la tendencia positiva
    },
    green: {
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      trendText: 'text-green-600'
    },
    red: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      trendText: 'text-red-600'
    },
    yellow: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      trendText: 'text-yellow-600'
    },
    purple: {
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      trendText: 'text-purple-600'
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex items-center">
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color].iconBg} ${colorClasses[color].iconText}`}>
            {icon}
          </div>
        )}
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-sm ${colorClasses[color].trendText}`}>
                {trend}
              </span>
              {trendText && (
                <span className="ml-1 text-xs text-gray-500">{trendText}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
  color: PropTypes.oneOf(['blue', 'green', 'red', 'yellow', 'purple']),
  trend: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  trendText: PropTypes.string,
  className: PropTypes.string
};

export default StatCard;