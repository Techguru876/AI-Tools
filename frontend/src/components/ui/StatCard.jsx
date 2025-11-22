/**
 * StatCard component for displaying dashboard metrics.
 * Shows an icon, metric value, label, and optional trend indicator.
 */
import React from 'react';

const StatCard = ({ icon: Icon, title, value, trend, trendUp, loading = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2 bg-primary-100 rounded-lg">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>

        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trendUp
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span>{trendUp ? '↑' : '↓'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
