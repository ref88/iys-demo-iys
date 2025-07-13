import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      setIsClosing(true);
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 400); // Match --duration-calm
    }
  }, [isOpen, isVisible]);

  // Handle smooth close - call onClose directly, let useModalClose handle timing
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity-calm ${
          isClosing ? 'backdrop-exit-active' : 'backdrop-enter-active'
        }`}
        onClick={closeOnOverlayClick ? handleClose : undefined}
        onKeyDown={
          closeOnOverlayClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClose();
                }
              }
            : undefined
        }
        role={closeOnOverlayClick ? 'button' : undefined}
        tabIndex={closeOnOverlayClick ? 0 : undefined}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className={`relative w-full ${sizeClasses[size]} ${className}`}>
          {/* Modal Content */}
          <div
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
              isClosing ? 'modal-exit-active' : 'modal-enter-active'
            }`}
          >
            {/* Header */}
            {title && (
              <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={handleClose}
                    className='p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors-calm'
                    aria-label='Sluiten'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className='px-6 py-4'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
