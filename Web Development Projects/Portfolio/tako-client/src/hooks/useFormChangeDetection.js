import { useState, useCallback, useEffect } from 'react';

/**
 * Form Change Detection Hook
 *
 * Tracks changes to form data and provides utilities to detect unsaved changes.
 * Works with any form data structure.
 *
 * @param {Object} initialData - The initial form data
 * @param {Object} options - Configuration options
 * @param {Function} options.onDirtyChange - Called when dirty state changes
 * @param {Array} options.ignoreFields - Fields to ignore when comparing
 * @returns {Object} Form change detection utilities
 */
export const useFormChangeDetection = (initialData, options = {}) => {
  const { onDirtyChange, ignoreFields = [] } = options;

  const [originalData, setOriginalData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);

  // Deep compare function that ignores specified fields
  const deepCompare = useCallback(
    (obj1, obj2) => {
      if (obj1 === obj2) {
        return true;
      }

      if (obj1 === null || obj2 === null) {
        return obj1 === obj2;
      }

      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
      }

      const keys1 = Object.keys(obj1).filter(
        (key) => !ignoreFields.includes(key)
      );
      const keys2 = Object.keys(obj2).filter(
        (key) => !ignoreFields.includes(key)
      );

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        if (!keys2.includes(key)) {
          return false;
        }

        if (!deepCompare(obj1[key], obj2[key])) {
          return false;
        }
      }

      return true;
    },
    [ignoreFields]
  );

  // Check if current data is different from original
  const checkForChanges = useCallback(
    (currentData) => {
      const hasChanges = !deepCompare(originalData, currentData);

      if (hasChanges !== isDirty) {
        setIsDirty(hasChanges);
        if (onDirtyChange) {
          onDirtyChange(hasChanges);
        }
      }

      return hasChanges;
    },
    [originalData, isDirty, deepCompare, onDirtyChange]
  );

  // Reset the original data (call this after successful save)
  const resetOriginalData = useCallback(
    (newData) => {
      setOriginalData(newData);
      setIsDirty(false);
      if (onDirtyChange) {
        onDirtyChange(false);
      }
    },
    [onDirtyChange]
  );

  // Force set dirty state
  const setDirty = useCallback(
    (dirty) => {
      setIsDirty(dirty);
      if (onDirtyChange) {
        onDirtyChange(dirty);
      }
    },
    [onDirtyChange]
  );

  // Update original data when initialData changes
  useEffect(() => {
    setOriginalData(initialData);
    setIsDirty(false);
    if (onDirtyChange) {
      onDirtyChange(false);
    }
  }, [initialData, onDirtyChange]);

  return {
    isDirty,
    checkForChanges,
    resetOriginalData,
    setDirty,
    originalData,
  };
};

export default useFormChangeDetection;
