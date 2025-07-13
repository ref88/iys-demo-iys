import React, { useId } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getFieldAriaAttributes } from '../../utils/accessibilityUtils.js';

const FormField = ({
  label,
  children,
  error,
  success,
  hint,
  required = false,
  className = '',
  id: providedId,
  ...props
}) => {
  const autoId = useId();
  const fieldId = providedId || autoId;
  const hasError = !!error;
  const hasSuccess = !!success;
  const hasHint = !!hint;

  const ariaAttributes = getFieldAriaAttributes(fieldId, error, hint, required);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && (
            <span className='text-red-500 ml-1' aria-label='verplicht'>
              *
            </span>
          )}
        </label>
      )}

      <div className='relative'>
        {React.cloneElement(children, {
          ...props,
          ...ariaAttributes,
          id: fieldId,
          className:
            `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : hasSuccess
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${children.props.className || ''}`.trim(),
        })}

        {/* Status icons */}
        {(hasError || hasSuccess) && (
          <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
            {hasError && <AlertCircle className='w-5 h-5 text-red-500' />}
            {hasSuccess && <CheckCircle className='w-5 h-5 text-green-500' />}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div
          id={`${fieldId}-error`}
          role='alert'
          aria-live='polite'
          className='flex items-center gap-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2'
        >
          <AlertCircle className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {hasSuccess && !hasError && (
        <div
          id={`${fieldId}-success`}
          role='status'
          aria-live='polite'
          className='flex items-center gap-1 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2'
        >
          <CheckCircle className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
          <span>{success}</span>
        </div>
      )}

      {/* Hint message */}
      {hasHint && !hasError && !hasSuccess && (
        <div
          id={`${fieldId}-hint`}
          className='flex items-center gap-1 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-2'
        >
          <Info className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
