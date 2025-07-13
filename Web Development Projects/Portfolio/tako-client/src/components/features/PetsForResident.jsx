import React, { useState, useEffect } from 'react';
import { Heart, Users } from 'lucide-react';

const PetsForResident = ({ residentId, refreshTrigger }) => {
  const [pets, setPets] = useState([]);
  const [residents, setResidents] = useState([]);

  useEffect(() => {
    // Load pets from localStorage
    const savedPets = localStorage.getItem('vms_pets');
    if (savedPets) {
      const allPets = JSON.parse(savedPets);
      // Filter pets where this resident is an owner
      const residentPets = allPets.filter(
        (pet) => pet.owners && pet.owners.includes(residentId)
      );
      setPets(residentPets);
    }

    // Load residents for displaying co-owners
    const savedResidents = localStorage.getItem('vms_residents');
    if (savedResidents) {
      setResidents(JSON.parse(savedResidents));
    }
  }, [residentId, refreshTrigger]);

  const getOwnerNames = (ownerIds) => {
    return ownerIds
      .filter((id) => id !== residentId) // Exclude current resident
      .map((id) => {
        const resident = residents.find((r) => r.id === id);
        return resident ? resident.name : 'Onbekend';
      })
      .filter((name) => name !== 'Onbekend');
  };

  if (pets.length === 0) {
    return <p className='text-gray-500'>Geen huisdieren</p>;
  }

  return (
    <div className='space-y-3'>
      {pets.map((pet) => {
        const coOwners = getOwnerNames(pet.owners);

        return (
          <div
            key={pet.id}
            className='bg-amber-50 border border-amber-200 rounded-lg p-3'
          >
            <div className='flex items-center gap-2 mb-1'>
              <Heart className='w-4 h-4 text-amber-600' />
              <span className='font-medium text-amber-900'>{pet.name}</span>
              <span className='text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded'>
                {pet.type}
              </span>
              {pet.breed && (
                <span className='text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded'>
                  {pet.breed}
                </span>
              )}
            </div>

            {coOwners.length > 0 && (
              <div className='flex items-center gap-2 mb-1'>
                <Users className='w-3 h-3 text-gray-500' />
                <span className='text-xs text-gray-600'>
                  Gedeeld met: {coOwners.join(', ')}
                </span>
              </div>
            )}

            {pet.notes && (
              <p className='text-sm text-amber-700 ml-6'>{pet.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PetsForResident;
