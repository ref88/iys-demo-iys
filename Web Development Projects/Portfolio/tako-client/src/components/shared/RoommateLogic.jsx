import React, { useState, useEffect } from 'react';
import { Home, Users, Search } from 'lucide-react';
import Button from '../ui/Button.jsx';
import {
  calculateRoomAvailability,
  getMostRelevantRooms,
} from '../../utils/roomUtils.js';
import RoomSearchModal from './RoomSearchModal.jsx';

const RoommateLogic = ({
  existingResidents = [],
  roomCapacities = {},
  selectedRoomId,
  onRoomSelect,
  selectedRoommates = [],
  onRoommateSelect,
  newOccupants = 0,
  showFinancialArrangement = false,
  financialArrangement = 'independent',
  onFinancialArrangementChange,
  errors = {},
}) => {
  // Helper function for keyboard accessibility
  const handleKeyboardClick = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };
  const [availableRooms, setAvailableRooms] = useState([]);
  const [quickSelectRooms, setQuickSelectRooms] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Calculate available rooms with capacity information
  useEffect(() => {
    const rooms = calculateRoomAvailability(existingResidents, roomCapacities);
    const relevantRooms = getMostRelevantRooms(rooms, newOccupants, 6);

    setAvailableRooms(rooms);
    setQuickSelectRooms(relevantRooms);
  }, [existingResidents, roomCapacities, newOccupants]);

  // Get roommates for selected room
  const selectedRoomOccupants = selectedRoomId
    ? availableRooms.find((room) => room.id === selectedRoomId)?.occupants || []
    : [];

  return (
    <div className='space-y-6'>
      {/* Room Selection */}
      <div>
        <h4 className='font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
          <Home className='w-5 h-5' />
          Kamer Selectie
        </h4>

        {availableRooms.length === 0 ? (
          <div className='p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
            <p className='text-sm text-yellow-700 dark:text-yellow-300'>
              Geen bestaande kamers gevonden. Nieuwe kamer wordt automatisch
              toegewezen.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Quick Select Section */}
            {quickSelectRooms.length > 0 && (
              <div>
                <h5 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Aanbevolen Kamers ({quickSelectRooms.length})
                </h5>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                  {quickSelectRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedRoomId === room.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      onClick={() => onRoomSelect(room.id)}
                      onKeyDown={(e) =>
                        handleKeyboardClick(e, () => onRoomSelect(room.id))
                      }
                      role='button'
                      tabIndex={0}
                    >
                      <div className='text-center'>
                        <div className='font-medium text-gray-900 dark:text-white text-lg'>
                          {room.number}
                        </div>
                        <div className='text-xs text-gray-600 dark:text-gray-400'>
                          {room.occupantCount}/{room.capacity} personen
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded mt-1 ${
                            room.availableSpace >= newOccupants
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {room.availableSpace} vrij
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Search Button */}
            <div className='flex justify-center'>
              <Button
                variant='secondary'
                onClick={() => setShowAdvancedSearch(true)}
                className='w-full'
              >
                <Search className='w-4 h-4 mr-2' />
                Zoek andere kamers... (
                {availableRooms.length - quickSelectRooms.length} meer)
              </Button>
            </div>
          </div>
        )}

        {errors.roomSelection && (
          <p className='text-red-500 text-sm mt-2'>{errors.roomSelection}</p>
        )}
      </div>

      {/* Roommate Selection */}
      {selectedRoomId && selectedRoomOccupants.length > 0 && (
        <div>
          <h4 className='font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Kamergenoten Relatie
          </h4>

          <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
              Selecteer je relatie tot huidige kamergenoten:
            </p>

            <div className='space-y-2'>
              {selectedRoomOccupants.map((occupant) => (
                <div
                  key={occupant.id}
                  className='flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded'
                >
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {occupant.name}
                  </span>
                  <select
                    value={
                      selectedRoommates.find((r) => r.id === occupant.id)
                        ?.relationship || ''
                    }
                    onChange={(e) =>
                      onRoommateSelect(occupant.id, e.target.value)
                    }
                    className='px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Geen relatie</option>
                    <option value='friend'>Vriend</option>
                    <option value='acquaintance'>Bekende</option>
                    <option value='colleague'>Collega</option>
                    <option value='other'>Anders</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financial Arrangement */}
      {showFinancialArrangement && (
        <div>
          <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
            Financiële Regeling
          </h4>

          <div className='space-y-3'>
            <div
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                financialArrangement === 'independent'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => onFinancialArrangementChange('independent')}
              onKeyDown={(e) =>
                handleKeyboardClick(e, () =>
                  onFinancialArrangementChange('independent')
                )
              }
              role='button'
              tabIndex={0}
            >
              <div className='flex items-center space-x-3'>
                <input
                  type='radio'
                  name='financialArrangement'
                  value='independent'
                  checked={financialArrangement === 'independent'}
                  onChange={() => onFinancialArrangementChange('independent')}
                  className='w-4 h-4 text-blue-600'
                />
                <div>
                  <h5 className='font-medium text-gray-900 dark:text-white'>
                    Onafhankelijk
                  </h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Eigen financiën, geen gedeelde kosten
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                financialArrangement === 'shared'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => onFinancialArrangementChange('shared')}
              onKeyDown={(e) =>
                handleKeyboardClick(e, () =>
                  onFinancialArrangementChange('shared')
                )
              }
              role='button'
              tabIndex={0}
            >
              <div className='flex items-center space-x-3'>
                <input
                  type='radio'
                  name='financialArrangement'
                  value='shared'
                  checked={financialArrangement === 'shared'}
                  onChange={() => onFinancialArrangementChange('shared')}
                  className='w-4 h-4 text-green-600'
                />
                <div>
                  <h5 className='font-medium text-gray-900 dark:text-white'>
                    Gedeeld
                  </h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Gedeelde kosten met kamergenoten
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      <RoomSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        rooms={availableRooms}
        onRoomSelect={(roomId) => {
          onRoomSelect(roomId);
          setShowAdvancedSearch(false);
        }}
        selectedRoomId={selectedRoomId}
        newOccupants={newOccupants}
      />
    </div>
  );
};

export default RoommateLogic;
