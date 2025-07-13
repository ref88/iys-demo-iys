// Accessibility utilities for better user experience

/**
 * Generate a unique ID for form elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'field') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create ARIA attributes for form fields with validation
 * @param {string} id - Field ID
 * @param {string} error - Error message
 * @param {string} hint - Hint message
 * @param {boolean} required - Whether field is required
 * @returns {object} ARIA attributes
 */
export const getFieldAriaAttributes = (id, error, hint, required = false) => {
  const attributes = {};

  if (required) {
    attributes['aria-required'] = 'true';
  }

  if (error) {
    attributes['aria-invalid'] = 'true';
    attributes['aria-describedby'] = `${id}-error`;
  } else if (hint) {
    attributes['aria-describedby'] = `${id}-hint`;
  }

  return attributes;
};

/**
 * Create keyboard navigation handler
 * @param {Array} items - Array of items to navigate
 * @param {function} onSelect - Callback when item is selected
 * @param {boolean} loop - Whether to loop navigation
 * @returns {function} Keyboard event handler
 */
export const createKeyboardNavigation = (items, onSelect, loop = true) => {
  let currentIndex = -1;

  return (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        currentIndex = loop
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        currentIndex = loop
          ? currentIndex <= 0
            ? items.length - 1
            : currentIndex - 1
          : Math.max(currentIndex - 1, 0);
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0 && currentIndex < items.length) {
          onSelect(items[currentIndex], currentIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        currentIndex = -1;
        break;

      default:
        return;
    }

    // Update focus
    if (currentIndex >= 0 && currentIndex < items.length) {
      const element = document.querySelector(
        `[data-nav-index="${currentIndex}"]`
      );
      if (element) {
        element.focus();
      }
    }
  };
};

/**
 * Announce screen reader message
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level (polite, assertive)
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Trap focus within an element
   * @param {HTMLElement} element - Element to trap focus in
   * @returns {function} Cleanup function
   */
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  },

  /**
   * Restore focus to previously focused element
   * @param {HTMLElement} element - Element that was previously focused
   */
  restoreFocus: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },
};

/**
 * Create accessible button attributes
 * @param {string} label - Button label
 * @param {string} description - Optional description
 * @param {boolean} expanded - Whether associated content is expanded
 * @param {string} controls - ID of controlled element
 * @returns {object} Accessible button attributes
 */
export const getButtonAriaAttributes = (
  label,
  description,
  expanded,
  controls
) => {
  const attributes = {
    'aria-label': label,
  };

  if (description) {
    attributes['aria-description'] = description;
  }

  if (expanded !== undefined) {
    attributes['aria-expanded'] = expanded.toString();
  }

  if (controls) {
    attributes['aria-controls'] = controls;
  }

  return attributes;
};

/**
 * Create accessible table attributes
 * @param {string} caption - Table caption
 * @param {Array} headers - Array of header information
 * @returns {object} Table accessibility attributes
 */
export const getTableAriaAttributes = (caption, headers = []) => {
  const attributes = {};

  if (caption) {
    attributes['aria-label'] = caption;
  }

  // Add role for complex tables
  if (headers.length > 0) {
    attributes['role'] = 'table';
  }

  return attributes;
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Get appropriate text color based on background
   * @param {string} backgroundColor - Background color (hex)
   * @returns {string} Text color (black or white)
   */
  getTextColor: (backgroundColor) => {
    // Remove # if present
    const hex = backgroundColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
};

/**
 * Skip link utilities
 */
export const skipLinks = {
  /**
   * Create skip link element
   * @param {string} target - Target element ID
   * @param {string} text - Skip link text
   * @returns {HTMLElement} Skip link element
   */
  create: (target, text = 'Ga naar hoofdinhoud') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${target}`;
    skipLink.textContent = text;
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded';

    return skipLink;
  },
};
