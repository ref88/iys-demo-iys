import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Home,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import {
  filterRooms,
  sortRooms,
  getRoomStatistics,
} from '../../utils/roomUtils.js';

const RoomSearchModal = ({
  isOpen,
  onClose,
  rooms = [],
  onRoomSelect,
  selectedRoomId = null,
  newOccupants = 1,
}) => {
  // Helper function for keyboard accessibility
  const handleKeyboardClick = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    availability: 'available', // Only show available rooms by default
    minCapacity: null,
    maxCapacity: null,
    floor: null,
  });
  const [sortBy, setSortBy] = useState('number');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 15;

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    const searchFilters = { ...filters, search: searchQuery };
    const filtered = filterRooms(rooms, searchFilters);
    return sortRooms(filtered, sortBy, sortOrder);
  }, [rooms, searchQuery, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredAndSortedRooms.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => getRoomStatistics(rooms), [rooms]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, sortOrder]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoomClick = (room) => {
    onRoomSelect(room.id);
    onClose();
  };

  const canRoomAccommodate = (room) => {
    return room.availableSpace >= newOccupants;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl' title='Kamer Zoeken'>
      <div className='p-6'>
        {/* Header Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.totalRooms}
            </div>
            <div className='text-sm text-blue-600'>Totaal Kamers</div>
          </div>
          <div className='bg-green-50 dark:bg-green-900/30 p-3 rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.availableRooms}
            </div>
            <div className='text-sm text-green-600'>Beschikbaar</div>
          </div>
          <div className='bg-red-50 dark:bg-red-900/30 p-3 rounded-lg'>
            <div className='text-2xl font-bold text-red-600'>
              {stats.fullRooms}
            </div>
            <div className='text-sm text-red-600'>Vol</div>
          </div>
          <div className='bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
            <div className='text-2xl font-bold text-gray-600'>
              {Math.round(stats.occupancyRate * 100)}%
            </div>
            <div className='text-sm text-gray-600'>Bezetting</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='space-y-4 mb-6'>
          {/* Search Bar */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Zoek kamernummer...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            />
          </div>

          {/* Filter Toggle */}
          <div className='flex items-center justify-between'>
            <Button
              variant='secondary'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='w-4 h-4 mr-2' />
              Filters {showFilters ? 'Verbergen' : 'Tonen'}
            </Button>

            <div className='flex items-center space-x-4'>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              >
                <option value='number'>Kamernummer</option>
                <option value='availability'>Beschikbaarheid</option>
                <option value='occupancy'>Bezetting</option>
                <option value='capacity'>Capaciteit</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className='px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700'
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label
                  htmlFor='availability'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Beschikbaarheid
                </label>
                <select
                  id='availability'
                  value={filters.availability}
                  onChange={(e) =>
                    handleFilterChange('availability', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value='all'>Alle kamers</option>
                  <option value='available'>Beschikbaar</option>
                  <option value='full'>Vol</option>
                  <option value='empty'>Leeg</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='minCapacity'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Min. Capaciteit
                </label>
                <select
                  id='minCapacity'
                  value={filters.minCapacity || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'minCapacity',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value=''>Alle</option>
                  <option value='1'>1 persoon</option>
                  <option value='2'>2 personen</option>
                  <option value='3'>3 personen</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='floor'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Verdieping
                </label>
                <select
                  id='floor'
                  value={filters.floor || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'floor',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value=''>Alle verdiepingen</option>
                  <option value='1'>1e verdieping</option>
                  <option value='2'>2e verdieping</option>
                  <option value='3'>3e verdieping</option>
                  <option value='4'>4e verdieping</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Room List */}
        <div className='space-y-2 mb-6 max-h-96 overflow-y-auto'>
          {paginatedRooms.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <Home className='w-16 h-16 mx-auto mb-4 opacity-50' />
              <p>Geen kamers gevonden met deze criteria</p>
            </div>
          ) : (
            paginatedRooms.map((room) => {
              const canAccommodate = canRoomAccommodate(room);
              const isSelected = selectedRoomId === room.id;

              return (
                <div
                  key={room.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : canAccommodate
                        ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        : 'border-red-300 bg-red-50 dark:bg-red-900/30 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => canAccommodate && handleRoomClick(room)}
                  onKeyDown={(e) =>
                    handleKeyboardClick(
                      e,
                      () => canAccommodate && handleRoomClick(room)
                    )
                  }
                  role='button'
                  tabIndex={canAccommodate ? 0 : -1}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <Home className='w-5 h-5 text-gray-500' />
                      <div>
                        <h3 className='font-medium text-gray-900 dark:text-white'>
                          Kamer {room.number}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {room.occupantCount} / {room.capacity} personen
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          room.availableSpace >= newOccupants
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {room.availableSpace} vrij
                      </span>

                      {room.occupants.length > 0 && (
                        <div className='flex items-center text-gray-500'>
                          <Users className='w-4 h-4 mr-1' />
                          <span className='text-xs'>
                            {room.occupants.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show current occupants */}
                  {room.occupants.length > 0 && (
                    <div className='mt-3 pt-3 border-t'>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
                        Huidige bewoners:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {room.occupants.map((occupant) => (
                          <span
                            key={occupant.id}
                            className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded'
                          >
                            {occupant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              Pagina {currentPage} van {totalPages} (
              {filteredAndSortedRooms.length} kamers)
            </div>

            <div className='flex items-center space-x-2'>
              <Button
                variant='secondary'
                size='sm'
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className='w-4 h-4' />
              </Button>

              <span className='px-3 py-1 text-sm'>{currentPage}</span>

              <Button
                variant='secondary'
                size='sm'
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
          <Button variant='secondary' onClick={onClose}>
            Annuleren
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RoomSearchModal;
