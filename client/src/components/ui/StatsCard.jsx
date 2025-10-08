// client/src/components/ui/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const getColorClasses = (color) => {
    const colors = {
      primary: 'text-primary-600 bg-primary-100',
      secondary: 'text-secondary-600 bg-secondary-100',
      accent: 'text-accent-600 bg-accent-100',
      orange: 'text-orange-600 bg-orange-100',
      green: 'text-green-600 bg-green-100',
      red: 'text-red-600 bg-red-100'
    };
    return colors[color] || colors.primary;
  };

  const getTrendColor = (trend) => {
    if (!trend) return '';
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;