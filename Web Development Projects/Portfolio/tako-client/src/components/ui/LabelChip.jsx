import React from 'react';

const colorClasses = {
  blue: 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-300/50 dark:border-blue-500/50',
  green:
    'bg-green-500/20 dark:bg-green-500/30 text-green-700 dark:text-green-300 border border-green-300/50 dark:border-green-500/50',
  red: 'bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-300/50 dark:border-red-500/50',
  yellow:
    'bg-yellow-500/20 dark:bg-yellow-500/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300/50 dark:border-yellow-500/50',
  purple:
    'bg-purple-500/20 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 border border-purple-300/50 dark:border-purple-500/50',
  orange:
    'bg-orange-500/20 dark:bg-orange-500/30 text-orange-700 dark:text-orange-300 border border-orange-300/50 dark:border-orange-500/50',
  gray: 'bg-gray-500/20 dark:bg-gray-500/30 text-gray-700 dark:text-gray-300 border border-gray-300/50 dark:border-gray-500/50',
  pink: 'bg-pink-500/20 dark:bg-pink-500/30 text-pink-700 dark:text-pink-300 border border-pink-300/50 dark:border-pink-500/50',
};

const LabelChip = ({ label, className = '' }) => {
  const colorClass =
    colorClasses[label.color] ||
    'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300';
  return (
    <span
      className={`inline-block px-3 py-1 rounded text-xs font-medium ${colorClass} ${className}`}
      style={{ borderRadius: '5px' }}
      title={label.name}
    >
      {label.name}
    </span>
  );
};

export default LabelChip;
