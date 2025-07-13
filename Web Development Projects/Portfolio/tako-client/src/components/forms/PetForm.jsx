import React, { useState } from 'react';
import { Heart, Save, X } from 'lucide-react';
import AutocompleteSelect from '../ui/AutocompleteSelect.jsx';

const PetForm = ({ onSave, onCancel, residentId, residentName }) => {
  const [petData, setPetData] = useState({
    name: '',
    type: '',
    breed: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const dogBreeds = [
    'Chihuahua',
    'Pomeriaan',
    'Franse Bulldog',
    'Yorkshire Terrier',
    'Shih Tzu',
    'Dwergkeeshond',
    'Dwergpinscher',
    'Mopshond (Pug)',
    'Maltezer',
    'Bichon Frisé',
    'Papillon',
    'Cavalier King Charles Spaniël',
    'Toy Poedel',
    'Tibetaanse Spaniel',
    'Japanse Chin',
    'Chinese Naakthond',
    'Boston Terriër',
    'Griffon Bruxellois',
    'Italiaanse Windhond',
    'Lhasa Apso',
    'Golden Retriever',
    'Labrador Retriever',
    'Duitse Herder',
    'Bulldog',
    'Beagle',
    'Rottweiler',
    'Pointer',
    'Boxer',
    'Husky',
    'Dalmatier',
    'Border Collie',
    'Cocker Spaniel',
    'Doberman',
  ];

  const catBreeds = [
    'Britse Korthaar',
    'Perzische Kat',
    'Maine Coon',
    'Ragdoll',
    'Siamese',
    'Scottish Fold',
    'Sphynx',
    'Bengaal',
    'Abessijn',
    'Russisch Blauw',
    'Noorse Boskat',
    'Birmaan',
    'Exotic Shorthair',
    'Devon Rex',
    'Cornish Rex',
    'Bombay',
    'Munchkin',
    'Tonkinese',
    'Burmese',
    'Ocicat',
    'Birman',
    'Chartreux',
    'Manx',
    'Orientaal',
    'Somali',
    'Turkse Angora',
  ];

  const getBreedOptions = () => {
    if (petData.type === 'Hond') {
      return dogBreeds;
    }
    if (petData.type === 'Kat') {
      return catBreeds;
    }
    return [];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!petData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!petData.type.trim()) {
      newErrors.type = 'Type is verplicht';
    }

    if (!petData.breed.trim()) {
      newErrors.breed = 'Ras is verplicht';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const petToSave = {
      id: Date.now(),
      name: petData.name.trim(),
      type: petData.type.trim(),
      breed: petData.breed.trim(),
      notes: petData.notes.trim(),
      owners: [residentId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to pets storage
    const savedPets = localStorage.getItem('vms_pets');
    const allPets = savedPets ? JSON.parse(savedPets) : [];
    allPets.push(petToSave);
    localStorage.setItem('vms_pets', JSON.stringify(allPets));

    onSave(petToSave);
  };

  const handleInputChange = (field, value) => {
    setPetData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className='bg-amber-50 border border-amber-200 rounded-lg p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-amber-900 flex items-center gap-2'>
          <Heart className='w-5 h-5' />
          Huisdier Toevoegen voor {residentName}
        </h3>
        <button
          type='button'
          onClick={onCancel}
          className='text-gray-400 hover:text-gray-600'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='pet-name'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Naam *
            </label>
            <input
              id='pet-name'
              type='text'
              value={petData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='Naam van het huisdier'
            />
            {errors.name && (
              <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='pet-type'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Type *
            </label>
            <select
              id='pet-type'
              value={petData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value=''>Selecteer type</option>
              <option value='Hond'>Hond</option>
              <option value='Kat'>Kat</option>
              <option value='Vogel'>Vogel</option>
              <option value='Vis'>Vis</option>
              <option value='Konijn'>Konijn</option>
              <option value='Hamster'>Hamster</option>
              <option value='Reptiel'>Reptiel</option>
              <option value='Anders'>Anders</option>
            </select>
            {errors.type && (
              <p className='text-red-500 text-sm mt-1'>{errors.type}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor='pet-breed'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Ras *
          </label>
          <AutocompleteSelect
            id='pet-breed'
            value={petData.breed}
            onChange={(value) => handleInputChange('breed', value)}
            options={getBreedOptions()}
            placeholder={
              petData.type === 'Hond'
                ? 'Type om hondenras te zoeken...'
                : petData.type === 'Kat'
                  ? 'Type om kattenras te zoeken...'
                  : 'Selecteer eerst een type'
            }
            disabled={!petData.type}
            className={errors.breed ? 'border-red-500' : ''}
            allowCustom={true}
          />
          {errors.breed && (
            <p className='text-red-500 text-sm mt-1'>{errors.breed}</p>
          )}
          {petData.type && (
            <p className='text-xs text-gray-500 mt-1'>
              Type om te zoeken of voer een eigen ras in
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='pet-notes'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Notities
          </label>
          <textarea
            id='pet-notes'
            value={petData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
            placeholder='Bijzonderheden over het huisdier...'
          />
        </div>

        <div className='flex items-center gap-3 pt-4'>
          <button
            type='submit'
            className='bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2'
          >
            <Save className='w-4 h-4' />
            Huisdier Toevoegen
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
};

export default PetForm;
