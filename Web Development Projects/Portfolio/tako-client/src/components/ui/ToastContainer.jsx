import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const Toast = ({ toast, onDismiss }) => {
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
        );
      case 'error':
        return (
          <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400' />
        );
      case 'warning':
        return (
          <AlertTriangle className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
        );
      case 'info':
        return <Info className='w-5 h-5 text-blue-600 dark:text-blue-400' />;
      default:
        return <Info className='w-5 h-5 text-gray-600 dark:text-gray-400' />;
    }
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-white dark:bg-gray-800 border-l-4 border-green-500 dark:border-green-400 shadow-lg';
      case 'error':
        return 'bg-white dark:bg-gray-800 border-l-4 border-red-500 dark:border-red-400 shadow-lg';
      case 'warning':
        return 'bg-white dark:bg-gray-800 border-l-4 border-yellow-500 dark:border-yellow-400 shadow-lg';
      case 'info':
        return 'bg-white dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 shadow-lg';
      default:
        return 'bg-white dark:bg-gray-800 border-l-4 border-gray-500 dark:border-gray-400 shadow-lg';
    }
  };

  const handleActionClick = () => {
    if (toast.action && toast.action.callback) {
      toast.action.callback();
      onDismiss(toast.id);
    }
  };

  return (
    <div
      className={`${getToastStyles(toast.type)} rounded-lg p-4 mb-3 max-w-sm animate-slide-in-right`}
    >
      <div className='flex items-start'>
        <div className='flex-shrink-0'>{getToastIcon(toast.type)}</div>
        <div className='ml-3 flex-1'>
          <p className='text-sm font-medium text-gray-900 dark:text-white'>
            {toast.message}
          </p>
          {toast.action && (
            <button
              onClick={handleActionClick}
              className='text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1 font-medium'
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <div className='ml-4 flex-shrink-0'>
          <button
            onClick={() => onDismiss(toast.id)}
            className='inline-flex text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400'
          >
            <span className='sr-only'>Sluiten</span>
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
