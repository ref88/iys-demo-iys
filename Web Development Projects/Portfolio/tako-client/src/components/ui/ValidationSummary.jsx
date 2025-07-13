import React from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

const ValidationSummary = ({
  errors,
  onClose,
  title = 'Controleer de volgende velden',
}) => {
  const errorList = [];

  // Flatten nested errors
  const flattenErrors = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        flattenErrors(value, prefix ? `${prefix}.${key}` : key);
      } else if (value) {
        errorList.push({
          field: prefix ? `${prefix}.${key}` : key,
          message: value,
        });
      }
    });
  };

  flattenErrors(errors);

  if (errorList.length === 0) {
    return null;
  }

  return (
    <div
      role='alert'
      aria-live='polite'
      aria-atomic='true'
      className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <AlertTriangle
            className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5'
            aria-hidden='true'
          />
          <div>
            <h3 className='text-sm font-medium text-red-800'>{title}</h3>
            <ul className='mt-2 text-sm text-red-700 space-y-1' role='list'>
              {errorList.map((error, index) => (
                <li
                  key={index}
                  className='flex items-start gap-1'
                  role='listitem'
                >
                  <span className='text-red-500 font-medium' aria-hidden='true'>
                    •
                  </span>
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label='Sluit validatie overzicht'
            className='text-red-400 hover:text-red-600 transition-colors'
          >
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        )}
      </div>
    </div>
  );
};

const ValidationSuccess = ({ message, onClose }) => (
  <div
    role='status'
    aria-live='polite'
    aria-atomic='true'
    className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'
  >
    <div className='flex items-start justify-between'>
      <div className='flex items-center gap-2'>
        <CheckCircle
          className='w-5 h-5 text-green-600 flex-shrink-0'
          aria-hidden='true'
        />
        <div>
          <h3 className='text-sm font-medium text-green-800'>{message}</h3>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label='Sluit success bericht'
          className='text-green-400 hover:text-green-600 transition-colors'
        >
          <X className='w-4 h-4' aria-hidden='true' />
        </button>
      )}
    </div>
  </div>
);

export default ValidationSummary;
export { ValidationSuccess };
