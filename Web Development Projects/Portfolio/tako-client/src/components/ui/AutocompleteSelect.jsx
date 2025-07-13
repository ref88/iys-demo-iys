import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

const AutocompleteSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Type om te zoeken...',
  className = '',
  disabled = false,
  allowCustom = true,
  maxHeight = '200px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    setFocusedIndex(-1);
  }, [searchTerm, options]);

  // Update search term when value changes externally
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    if (allowCustom) {
      onChange(newValue);
    }
  };

  const handleOptionClick = (option) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[focusedIndex]);
        } else if (allowCustom && searchTerm.trim()) {
          onChange(searchTerm.trim());
          setIsOpen(false);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSearchTerm(value || '');
        break;
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className='relative'>
        <input
          ref={inputRef}
          type='text'
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800'
          }`}
        />

        <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
          {searchTerm && !disabled && (
            <button
              type='button'
              onClick={handleClear}
              className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
              tabIndex={-1}
            >
              <X className='w-3 h-3 text-gray-400 dark:text-gray-500' />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div
          className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg'
          style={{ maxHeight }}
        >
          <div
            className='py-1 overflow-y-auto'
            style={{ maxHeight: `calc(${maxHeight} - 2px)` }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type='button'
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    index === focusedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className='px-3 py-2 text-gray-500 dark:text-gray-400 text-sm'>
                {allowCustom && searchTerm.trim() ? (
                  <span>
                    Druk Enter om "<strong>{searchTerm}</strong>" toe te voegen
                  </span>
                ) : (
                  <span>Geen resultaten gevonden</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
