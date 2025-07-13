import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import LabelChip from '../ui/LabelChip.jsx';

const LabelSelector = ({
  selectedLabels = [],
  onLabelsChange,
  availableLabels = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLabelToggle = (labelId) => {
    const newSelectedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter((id) => id !== labelId)
      : [...selectedLabels, labelId];
    onLabelsChange(newSelectedLabels);
  };

  // Removed unused function: _removeLabel

  // const getColorClass = (color) => {
  //   const colorMap = {
  //     blue: 'bg-blue-100 text-blue-800 border-blue-200',
  //     green: 'bg-green-100 text-green-800 border-green-200',
  //     red: 'bg-red-100 text-red-800 border-red-200',
  //     yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  //     purple: 'bg-purple-100 text-purple-800 border-purple-200',
  //     orange: 'bg-orange-100 text-orange-800 border-orange-200',
  //     gray: 'bg-gray-100 text-gray-800 border-gray-200',
  //     pink: 'bg-pink-100 text-pink-800 border-pink-200',
  //   };
  //   return colorMap[color] || colorMap.blue;
  // };

  const filteredLabels = availableLabels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between'
      >
        <div className='flex flex-wrap gap-1'>
          {selectedLabels.length === 0 && (
            <span className='text-gray-400 text-sm'>Geen labels</span>
          )}
          {selectedLabels.map((labelId) => {
            const label = availableLabels.find((l) => l.id === labelId);
            if (!label) {
              return null;
            }
            return <LabelChip key={labelId} label={label} />;
          })}
        </div>
        <ChevronDown className='w-4 h-4 text-gray-400 ml-2' />
      </button>
      {isOpen && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
          <div className='p-2'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Zoeken naar label'
              className='w-full px-2 py-1 border border-gray-200 rounded mb-2 text-sm focus:outline-none'
            />
            {filteredLabels.length === 0 && (
              <div className='text-gray-400 text-sm px-2 py-1'>
                Geen labels gevonden
              </div>
            )}
            {filteredLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleLabelToggle(label.id)}
                className='w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 transition-colors mb-1'
                type='button'
              >
                <LabelChip label={label} className='mr-2' />
                {selectedLabels.includes(label.id) && (
                  <Check className='w-4 h-4 text-green-500' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelSelector;
