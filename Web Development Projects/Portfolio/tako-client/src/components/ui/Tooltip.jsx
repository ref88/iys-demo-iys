import React, { useState } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-600 dark:border-t-gray-400',
    bottom:
      'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-600 dark:border-b-gray-400',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-600 dark:border-l-gray-400',
    right:
      'right-full top-1/2 transform -translate-y-1/2 border-r-gray-600 dark:border-r-gray-400',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className='bg-gray-600 dark:bg-gray-400 text-white dark:text-gray-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap'>
            {content}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
