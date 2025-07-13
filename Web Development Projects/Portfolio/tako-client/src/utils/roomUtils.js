// Room filtering and sorting utilities

/**
 * Calculate room availability and occupancy data
 * @param {Array} existingResidents - Array of all residents
 * @param {Object} roomCapacities - Object with room numbers as keys, capacities as values
 * @returns {Array} Array of room objects with occupancy data
 */
export const calculateRoomAvailability = (
  existingResidents = [],
  roomCapacities = {}
) => {
  const roomData = {};

  // Initialize rooms from existing residents
  existingResidents.forEach((resident) => {
    const roomNum = resident.room || resident.roomNumber;
    if (roomNum) {
      if (!roomData[roomNum]) {
        roomData[roomNum] = {
          id: roomNum,
          number: roomNum,
          occupants: [],
          capacity: roomCapacities[roomNum] || 3, // Default capacity 3
        };
      }
      roomData[roomNum].occupants.push(resident);
    }
  });

  // Add empty rooms from roomCapacities that don't have residents
  Object.keys(roomCapacities).forEach((roomNum) => {
    if (!roomData[roomNum]) {
      roomData[roomNum] = {
        id: roomNum,
        number: roomNum,
        occupants: [],
        capacity: roomCapacities[roomNum],
      };
    }
  });

  // Calculate availability metrics
  return Object.values(roomData).map((room) => ({
    ...room,
    occupantCount: room.occupants.length,
    availableSpace: room.capacity - room.occupants.length,
    occupancyRate:
      room.capacity > 0 ? room.occupants.length / room.capacity : 0,
    isEmpty: room.occupants.length === 0,
    isFull: room.occupants.length >= room.capacity,
    isAvailable: room.occupants.length < room.capacity,
  }));
};

/**
 * Get most relevant rooms for quick selection
 * @param {Array} rooms - Array of room objects from calculateRoomAvailability
 * @param {number} newOccupants - Number of new occupants to add
 * @param {number} limit - Maximum number of rooms to return (default: 6)
 * @returns {Array} Array of most relevant rooms
 */
export const getMostRelevantRooms = (rooms, newOccupants = 1, limit = 6) => {
  return rooms
    .filter((room) => room.availableSpace >= newOccupants) // Only rooms with enough space
    .sort((a, b) => {
      // Priority scoring system
      let scoreA = 0;
      let scoreB = 0;

      // 1. Prefer rooms with some occupants (not empty, but not full)
      if (a.occupantCount > 0 && !a.isFull) scoreA += 10;
      if (b.occupantCount > 0 && !b.isFull) scoreB += 10;

      // 2. Prefer rooms with more available space (less crowded)
      scoreA += a.availableSpace * 3;
      scoreB += b.availableSpace * 3;

      // 3. Prefer lower room numbers (often ground floor/easier access)
      const roomNumA = parseInt(a.number.replace(/\D/g, '')) || 999;
      const roomNumB = parseInt(b.number.replace(/\D/g, '')) || 999;
      if (roomNumA < roomNumB) scoreA += 2;
      if (roomNumB < roomNumA) scoreB += 2;

      // 4. Prefer rooms that aren't empty (community aspect)
      if (a.isEmpty) scoreA -= 5;
      if (b.isEmpty) scoreB -= 5;

      return scoreB - scoreA;
    })
    .slice(0, limit);
};

/**
 * Filter rooms based on search criteria
 * @param {Array} rooms - Array of room objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered rooms
 */
export const filterRooms = (rooms, filters = {}) => {
  const {
    search = '',
    availability = 'all', // 'all', 'available', 'full', 'empty'
    minCapacity = null,
    maxCapacity = null,
    floor = null,
    building = null,
  } = filters;

  return rooms.filter((room) => {
    // Search filter (room number)
    if (search && !room.number.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Availability filter
    switch (availability) {
      case 'available':
        if (!room.isAvailable) return false;
        break;
      case 'full':
        if (!room.isFull) return false;
        break;
      case 'empty':
        if (!room.isEmpty) return false;
        break;
    }

    // Capacity filters
    if (minCapacity !== null && room.capacity < minCapacity) return false;
    if (maxCapacity !== null && room.capacity > maxCapacity) return false;

    // Floor filter (extract floor from room number)
    if (floor !== null) {
      const roomFloor = Math.floor(parseInt(room.number) / 100);
      if (roomFloor !== floor) return false;
    }

    // Building filter (extract building from room number prefix)
    if (building !== null) {
      const roomBuilding = room.number.charAt(0);
      if (roomBuilding !== building) return false;
    }

    return true;
  });
};

/**
 * Sort rooms by specified criteria
 * @param {Array} rooms - Array of room objects
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted rooms
 */
export const sortRooms = (rooms, sortBy = 'number', sortOrder = 'asc') => {
  const sortedRooms = [...rooms].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'number':
        valueA = parseInt(a.number.replace(/\D/g, '')) || 0;
        valueB = parseInt(b.number.replace(/\D/g, '')) || 0;
        break;
      case 'availability':
        valueA = a.availableSpace;
        valueB = b.availableSpace;
        break;
      case 'occupancy':
        valueA = a.occupantCount;
        valueB = b.occupantCount;
        break;
      case 'capacity':
        valueA = a.capacity;
        valueB = b.capacity;
        break;
      case 'occupancyRate':
        valueA = a.occupancyRate;
        valueB = b.occupancyRate;
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return valueA - valueB;
    } else {
      return valueB - valueA;
    }
  });

  return sortedRooms;
};

/**
 * Get room statistics for display
 * @param {Array} rooms - Array of room objects
 * @returns {Object} Room statistics
 */
export const getRoomStatistics = (rooms) => {
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;
  const fullRooms = rooms.filter((r) => r.isFull).length;
  const emptyRooms = rooms.filter((r) => r.isEmpty).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalOccupants = rooms.reduce((sum, r) => sum + r.occupantCount, 0);

  return {
    totalRooms,
    availableRooms,
    fullRooms,
    emptyRooms,
    totalCapacity,
    totalOccupants,
    occupancyRate: totalCapacity > 0 ? totalOccupants / totalCapacity : 0,
    availabilityRate: totalRooms > 0 ? availableRooms / totalRooms : 0,
  };
};

/**
 * Validate if a room can accommodate new occupants
 * @param {Object} room - Room object
 * @param {number} newOccupants - Number of new occupants
 * @returns {Object} Validation result
 */
export const validateRoomCapacity = (room, newOccupants = 1) => {
  const wouldExceedCapacity = room.occupantCount + newOccupants > room.capacity;
  const availableSpace = room.capacity - room.occupantCount;

  return {
    isValid: !wouldExceedCapacity,
    wouldExceedCapacity,
    availableSpace,
    requiredSpace: newOccupants,
    message: wouldExceedCapacity
      ? `Kamer ${room.number} heeft slechts ${availableSpace} beschikbare plaatsen, maar ${newOccupants} zijn nodig.`
      : `Kamer ${room.number} kan ${newOccupants} nieuwe bewoner(s) accommoderen.`,
  };
};
