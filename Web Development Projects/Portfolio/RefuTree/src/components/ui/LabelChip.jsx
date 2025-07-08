import React from 'react';

const colorClasses = {
  blue: 'bg-blue-500/20 text-blue-700 border border-blue-300/50',
  green: 'bg-green-500/20 text-green-700 border border-green-300/50',
  red: 'bg-red-500/20 text-red-700 border border-red-300/50',
  yellow: 'bg-yellow-500/20 text-yellow-700 border border-yellow-300/50',
  purple: 'bg-purple-500/20 text-purple-700 border border-purple-300/50',
  orange: 'bg-orange-500/20 text-orange-700 border border-orange-300/50',
  gray: 'bg-gray-500/20 text-gray-700 border border-gray-300/50',
  pink: 'bg-pink-500/20 text-pink-700 border border-pink-300/50',
};

const LabelChip = ({ label, className = '' }) => {
  const colorClass = colorClasses[label.color] || 'bg-blue-100 text-blue-800';
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
      title={label.name}
    >
      {label.name}
    </span>
  );
};

export default LabelChip; 