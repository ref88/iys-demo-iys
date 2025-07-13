import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

const RoomCapacityManager = ({
  isOpen,
  onClose,
  existingResidents = [],
  onSave,
}) => {
  const [rooms, setRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(1);

  // Initialize rooms from existing residents
  useEffect(() => {
    if (existingResidents.length > 0) {
      const roomData = {};

      existingResidents.forEach((resident) => {
        const roomNum = resident.room || resident.roomNumber;
        if (roomNum) {
          if (!roomData[roomNum]) {
            roomData[roomNum] = {
              number: roomNum,
              capacity: 3, // Default capacity
              occupants: [],
            };
          }
          roomData[roomNum].occupants.push(resident);
        }
      });

      setRooms(Object.values(roomData));
    } else {
      // Default empty state
      setRooms([]);
    }
  }, [existingResidents]);

  const handleAddRoom = () => {
    if (
      newRoomNumber.trim() &&
      !rooms.find((r) => r.number === newRoomNumber)
    ) {
      const newRoom = {
        number: newRoomNumber,
        capacity: newRoomCapacity,
        occupants: [],
      };
      setRooms([...rooms, newRoom]);
      setNewRoomNumber('');
      setNewRoomCapacity(1);
    }
  };

  const handleUpdateCapacity = (roomNumber, newCapacity) => {
    setRooms(
      rooms.map((room) =>
        room.number === roomNumber ? { ...room, capacity: newCapacity } : room
      )
    );
  };

  const handleDeleteRoom = (roomNumber) => {
    const room = rooms.find((r) => r.number === roomNumber);
    if (room && room.occupants.length === 0) {
      setRooms(rooms.filter((r) => r.number !== roomNumber));
    }
  };

  const handleSave = () => {
    const roomCapacities = {};
    rooms.forEach((room) => {
      roomCapacities[room.number] = room.capacity;
    });
    onSave(roomCapacities);
    onClose();
  };

  const getOccupancyColor = (room) => {
    const occupancy = room.occupants.length;
    const capacity = room.capacity;

    if (occupancy === 0) return 'text-gray-500';
    if (occupancy > capacity) return 'text-red-600';
    if (occupancy === capacity) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getOccupancyBgColor = (room) => {
    const occupancy = room.occupants.length;
    const capacity = room.capacity;

    if (occupancy === 0) return 'bg-gray-50 dark:bg-gray-800';
    if (occupancy > capacity) return 'bg-red-50 dark:bg-red-900/20';
    if (occupancy === capacity) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-green-50 dark:bg-green-900/20';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Kamer Capaciteit Beheer'
      size='lg'
      showCloseButton={true}
    >
      <div className='p-6'>
        <div className='space-y-6'>
          {/* Header */}
          <div className='text-center'>
            <Home className='w-12 h-12 text-blue-600 mx-auto mb-3' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Kamer Capaciteiten
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Beheer de capaciteit van elke kamer (max 3 personen per kamer)
            </p>
          </div>

          {/* Room List */}
          <div className='space-y-3'>
            {rooms.length === 0 ? (
              <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                <Home className='w-16 h-16 mx-auto mb-3 opacity-50' />
                <p>Geen kamers gevonden. Voeg hieronder kamers toe.</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.number}
                  className={`p-4 rounded-lg border transition-colors ${getOccupancyBgColor(room)}`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`p-2 rounded-full ${getOccupancyColor(room) === 'text-red-600' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}
                      >
                        {room.occupants.length > room.capacity ? (
                          <AlertTriangle className='w-5 h-5 text-red-600' />
                        ) : (
                          <Home className='w-5 h-5 text-blue-600' />
                        )}
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900 dark:text-white'>
                          Kamer {room.number}
                        </h4>
                        <p className={`text-sm ${getOccupancyColor(room)}`}>
                          {room.occupants.length} / {room.capacity} personen
                          {room.occupants.length > room.capacity &&
                            ' (OVERVOL)'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      {editingRoom === room.number ? (
                        <div className='flex items-center space-x-2'>
                          <select
                            value={room.capacity}
                            onChange={(e) =>
                              handleUpdateCapacity(
                                room.number,
                                parseInt(e.target.value)
                              )
                            }
                            className='px-2 py-1 border rounded text-sm'
                          >
                            <option value={1}>1 persoon</option>
                            <option value={2}>2 personen</option>
                            <option value={3}>3 personen</option>
                          </select>
                          <Button
                            variant='primary'
                            size='sm'
                            onClick={() => setEditingRoom(null)}
                          >
                            <Check className='w-4 h-4' />
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Max {room.capacity}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setEditingRoom(room.number)}
                          >
                            <Edit2 className='w-4 h-4' />
                          </Button>
                          {room.occupants.length === 0 && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteRoom(room.number)}
                              className='text-red-600 hover:text-red-800'
                            >
                              <X className='w-4 h-4' />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show occupants if any */}
                  {room.occupants.length > 0 && (
                    <div className='mt-3 pt-3 border-t'>
                      <div className='flex flex-wrap gap-2'>
                        {room.occupants.map((occupant) => (
                          <span
                            key={occupant.id}
                            className='px-2 py-1 text-xs bg-white dark:bg-gray-700 rounded border'
                          >
                            {occupant.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add New Room */}
          <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
              Nieuwe Kamer Toevoegen
            </h4>
            <div className='flex space-x-3'>
              <input
                type='text'
                placeholder='Kamer nummer (bijv. 101)'
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className='flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              />
              <select
                value={newRoomCapacity}
                onChange={(e) => setNewRoomCapacity(parseInt(e.target.value))}
                className='px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              >
                <option value={1}>1 persoon</option>
                <option value={2}>2 personen</option>
                <option value={3}>3 personen</option>
              </select>
              <Button
                variant='primary'
                onClick={handleAddRoom}
                disabled={
                  !newRoomNumber.trim() ||
                  rooms.find((r) => r.number === newRoomNumber)
                }
              >
                <Plus className='w-4 h-4 mr-1' />
                Toevoegen
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
          <Button variant='secondary' onClick={onClose}>
            Annuleren
          </Button>
          <Button variant='primary' onClick={handleSave}>
            Opslaan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RoomCapacityManager;
