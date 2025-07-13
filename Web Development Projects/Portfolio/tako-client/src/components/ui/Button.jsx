import React from 'react';
import { Loader } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick = () => {},
  type = 'button',
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-quick focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg focus:ring-blue-500',
    secondary:
      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md focus:ring-gray-500',
    success:
      'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg focus:ring-green-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500',
    warning:
      'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg focus:ring-yellow-500',
    outline:
      'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md focus:ring-gray-500',
    ghost:
      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm focus:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader className={`${iconSizeClasses[size]} animate-spin mr-2`} />
      ) : Icon ? (
        <Icon className={`${iconSizeClasses[size]} mr-2`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
