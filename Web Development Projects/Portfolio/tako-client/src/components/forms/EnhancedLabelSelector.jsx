import React, { useState, /* useEffect, */ useMemo } from 'react';
import { Tag, X, Search, Check } from 'lucide-react';
import LabelChip from '../ui/LabelChip.jsx';

const EnhancedLabelSelector = ({
  selectedLabels = [],
  onLabelsChange,
  availableLabels = [],
  labelUsageCounts = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Calculate most used labels excluding selected ones
  const mostUsedLabels = useMemo(() => {
    return availableLabels
      .filter((label) => !selectedLabels.includes(label.id))
      .map((label) => ({
        ...label,
        count: labelUsageCounts[label.id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Show top 8 most used
  }, [availableLabels, selectedLabels, labelUsageCounts]);

  // Filter labels based on search term
  const filteredLabels = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    return availableLabels.filter((label) =>
      label.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableLabels, searchTerm]);

  // Get selected label objects
  const selectedLabelObjects = useMemo(() => {
    return selectedLabels
      .map((labelId) => availableLabels.find((l) => l.id === labelId))
      .filter(Boolean);
  }, [selectedLabels, availableLabels]);

  const handleLabelToggle = (labelId) => {
    const newSelectedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter((id) => id !== labelId)
      : [...selectedLabels, labelId];
    onLabelsChange(newSelectedLabels);
  };

  const handleRemoveLabel = (labelId) => {
    const newSelectedLabels = selectedLabels.filter((id) => id !== labelId);
    onLabelsChange(newSelectedLabels);
  };

  return (
    <div className='space-y-4'>
      {/* Selected Labels Zone */}
      {selectedLabelObjects.length > 0 && (
        <div className='bg-gray-50 rounded-lg p-3'>
          <div className='flex items-center gap-2 mb-2'>
            <Tag className='w-4 h-4 text-gray-600' />
            <span className='text-sm font-medium text-gray-700'>
              Geselecteerde labels
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {selectedLabelObjects.map((label) => (
              <div
                key={label.id}
                className='group relative inline-flex items-center gap-1 transition-all duration-200 hover:scale-105'
              >
                <LabelChip label={label} />
                <button
                  type='button'
                  onClick={() => handleRemoveLabel(label.id)}
                  className='ml-1 p-0.5 rounded bg-gray-600 text-white opacity-80 hover:opacity-100 hover:bg-red-600 transition-all duration-200'
                  style={{ borderRadius: '5px' }}
                  aria-label={`Verwijder ${label.name}`}
                >
                  <X className='w-3 h-3' />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Select Zone - Most Used Labels */}
      {mostUsedLabels.length > 0 && !isSearchFocused && (
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <Tag className='w-4 h-4 text-blue-600' />
            <span className='text-sm font-medium text-gray-700'>
              Meest gebruikt
            </span>
            <span className='text-xs text-gray-500'>
              (klik om toe te voegen)
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {mostUsedLabels.map((label) => (
              <button
                key={label.id}
                type='button'
                onClick={() => handleLabelToggle(label.id)}
                className='group relative inline-flex items-center gap-1 transition-all duration-200 hover:scale-105 cursor-pointer'
                title={`${label.count} bewoners hebben dit label`}
              >
                <LabelChip label={label} />
                <span className='text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full'>
                  {label.count}
                </span>
                <div className='absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200' />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Zone */}
      <div className='relative'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder='Zoek naar labels...'
            className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>

        {/* Search Results Dropdown */}
        {searchTerm && filteredLabels.length > 0 && isSearchFocused && (
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
            <div className='p-2'>
              {filteredLabels.map((label) => (
                <button
                  key={label.id}
                  type='button'
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur
                  onClick={() => {
                    handleLabelToggle(label.id);
                    setSearchTerm('');
                  }}
                  className='w-full flex items-center justify-between gap-2 px-3 py-2 rounded hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center gap-2'>
                    <LabelChip label={label} />
                    {labelUsageCounts[label.id] > 0 && (
                      <span className='text-xs text-gray-500'>
                        ({labelUsageCounts[label.id]} bewoners)
                      </span>
                    )}
                  </div>
                  {selectedLabels.includes(label.id) && (
                    <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {searchTerm && filteredLabels.length === 0 && isSearchFocused && (
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4'>
            <p className='text-sm text-gray-500 text-center'>
              Geen labels gevonden voor "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Help text */}
      {selectedLabels.length === 0 && !searchTerm && (
        <p className='text-xs text-gray-500 text-center'>
          Klik op een label om toe te voegen of gebruik de zoekbalk
        </p>
      )}
    </div>
  );
};

export default EnhancedLabelSelector;
