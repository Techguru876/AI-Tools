/**
 * LoadingSpinner component for displaying loading states.
 */
import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
      ></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
