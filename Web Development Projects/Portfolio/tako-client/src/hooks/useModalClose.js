import { useCallback } from 'react';

/**
 * Universal Modal Close Hook
 *
 * Provides consistent smooth close behavior for all modals.
 * Handles timing for animations and prevents jarring closures.
 * Includes unsaved changes detection for better UX.
 *
 * @param {Function} onClose - The close callback from parent component
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay before closing (for save operations)
 * @param {boolean} options.immediate - Skip delay for immediate closes
 * @param {Function} options.onCleanup - Cleanup function to run after close
 * @param {boolean} options.hasUnsavedChanges - Whether form has unsaved changes
 * @param {Function} options.onUnsavedChanges - Called when user tries to close with unsaved changes
 * @returns {Object} Close handlers for different scenarios
 */
export const useModalClose = (onClose, options = {}) => {
  const {
    delay = 100,
    immediate = false,
    onCleanup,
    hasUnsavedChanges = false,
    onUnsavedChanges,
  } = options;

  // Smooth close with animation time
  const handleSmoothClose = useCallback(() => {
    if (onClose) {
      if (immediate) {
        onClose();
        if (onCleanup) {
          setTimeout(() => onCleanup(), 100);
        }
      } else {
        // Small delay to allow Modal.jsx animations to complete
        setTimeout(() => {
          onClose();
          if (onCleanup) {
            setTimeout(() => onCleanup(), 100);
          }
        }, delay);
      }
    }
  }, [onClose, delay, immediate, onCleanup]);

  // Check for unsaved changes before closing
  const handleCloseWithUnsavedCheck = useCallback(() => {
    if (hasUnsavedChanges && onUnsavedChanges) {
      onUnsavedChanges();
    } else {
      handleSmoothClose();
    }
  }, [hasUnsavedChanges, onUnsavedChanges, handleSmoothClose]);

  // For save operations - show success state then close
  const handleSaveAndClose = useCallback(
    (saveOperation = null) => {
      if (saveOperation && typeof saveOperation === 'function') {
        saveOperation();
      }
      // Longer delay for save operations to show success feedback
      // This allows SuccessAnimation (2000ms) + Modal close (400ms) to complete
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
        if (onCleanup) {
          setTimeout(() => onCleanup(), 100);
        }
      }, 500);
    },
    [onClose, onCleanup]
  );

  // For cancel operations - check for unsaved changes
  const handleCancel = useCallback(() => {
    handleCloseWithUnsavedCheck();
  }, [handleCloseWithUnsavedCheck]);

  // For X button or ESC key - check for unsaved changes
  const handleDismiss = useCallback(() => {
    handleCloseWithUnsavedCheck();
  }, [handleCloseWithUnsavedCheck]);

  // For outside click - check for unsaved changes
  const handleOutsideClick = useCallback(() => {
    handleCloseWithUnsavedCheck();
  }, [handleCloseWithUnsavedCheck]);

  return {
    // Primary close handler - use this for most cases
    close: handleSmoothClose,

    // Close with unsaved changes check
    closeWithCheck: handleCloseWithUnsavedCheck,

    // Specific handlers for different close scenarios
    cancel: handleCancel,
    dismiss: handleDismiss,
    outsideClick: handleOutsideClick,
    saveAndClose: handleSaveAndClose,

    // Raw handler (for special cases)
    immediate: () => onClose && onClose(),
  };
};

export default useModalClose;
