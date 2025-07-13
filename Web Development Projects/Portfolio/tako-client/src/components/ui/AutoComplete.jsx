import React, { useState, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

const AutoComplete = ({
  value,
  onChange,
  options = [],
  placeholder = 'Type om te zoeken...',
  className = '',
  disabled = false,
  error = false,
  onSearch,
  maxResults = 10,
  allowCustom = true,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Simple filtering without problematic useEffect
  const updateFilteredOptions = (newValue) => {
    if (!newValue) {
      setFilteredOptions([]);
      return;
    }

    let filtered;
    if (onSearch) {
      try {
        filtered = onSearch(newValue);
      } catch {
        const lowerValue = newValue.toLowerCase();
        filtered = options.filter((option) =>
          option.toLowerCase().includes(lowerValue)
        );
      }
    } else {
      const lowerValue = newValue.toLowerCase();
      filtered = options.filter((option) =>
        option.toLowerCase().includes(lowerValue)
      );
    }

    setFilteredOptions(filtered.slice(0, maxResults));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    updateFilteredOptions(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && value) {
          setIsOpen(false);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (value) {
      updateFilteredOptions(value);
      setIsOpen(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay to allow clicking on options
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);

    // Call parent onBlur if provided
    if (onBlur) {
      onBlur();
    }
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className='relative'>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 text-gray-500' : ''} ${className}`}
        />

        {/* Clear button */}
        {value && !disabled && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
          >
            <X className='w-4 h-4' />
          </button>
        )}

        {/* Dropdown arrow */}
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown list */}
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={listRef}
          className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'
        >
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type='button'
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && value && filteredOptions.length === 0 && (
        <div className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3'>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>
            {allowCustom
              ? 'Geen resultaten gevonden. Je kunt je eigen invoer gebruiken.'
              : 'Geen resultaten gevonden.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
