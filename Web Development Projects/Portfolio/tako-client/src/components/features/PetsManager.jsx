import React, { useState, useEffect } from 'react';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  User,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { auditHelpers } from '../../utils/auditLogger.js';
import useAuditNotifications from '../../hooks/useAuditNotifications.js';

const PetsManager = ({
  isOpen,
  onClose,
  residents,
  onPetsUpdate,
  currentUser,
}) => {
  const { notify } = useNotifications();
  const { processAuditEntry } = useAuditNotifications();

  // Default user if not provided
  const user = currentUser || { id: 1, name: 'Systeem', role: 'admin' };
  const [pets, setPets] = useState([]);
  const [editingPet, setEditingPet] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newPet, setNewPet] = useState({
    name: '',
    type: '',
    breed: '',
    notes: '',
    owners: [], // Array of resident IDs
  });

  // Load pets from localStorage
  useEffect(() => {
    const savedPets = localStorage.getItem('vms_pets');
    if (savedPets) {
      setPets(JSON.parse(savedPets));
    }
  }, []);

  // Save pets to localStorage
  const savePetsToStorage = (petsData) => {
    localStorage.setItem('vms_pets', JSON.stringify(petsData));
    if (onPetsUpdate) {
      onPetsUpdate(petsData);
    }
  };

  const handleAddPet = () => {
    if (
      !newPet.name.trim() ||
      !newPet.type.trim() ||
      newPet.owners.length === 0
    ) {
      notify('Naam, type en minimaal 1 eigenaar zijn verplicht', {
        type: 'error',
      });
      return;
    }

    const petToAdd = {
      id: Date.now(),
      name: newPet.name.trim(),
      type: newPet.type.trim(),
      breed: newPet.breed.trim(),
      notes: newPet.notes.trim(),
      owners: newPet.owners,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPets = [...pets, petToAdd];
    setPets(updatedPets);
    savePetsToStorage(updatedPets);

    // Auto-assign labels to owners
    autoAssignPetLabels(petToAdd);

    // Log audit entry for pet creation
    const auditEntry = auditHelpers.logPetCreated(user, petToAdd);
    processAuditEntry(auditEntry);

    setNewPet({ name: '', type: '', breed: '', notes: '', owners: [] });
    setShowAddForm(false);
  };

  const handleUpdatePet = () => {
    if (
      !newPet.name.trim() ||
      !newPet.type.trim() ||
      newPet.owners.length === 0
    ) {
      notify('Naam, type en minimaal 1 eigenaar zijn verplicht', {
        type: 'error',
      });
      return;
    }

    const updatedPets = pets.map((pet) =>
      pet.id === editingPet.id
        ? {
            ...pet,
            name: newPet.name.trim(),
            type: newPet.type.trim(),
            breed: newPet.breed.trim(),
            notes: newPet.notes.trim(),
            owners: newPet.owners,
            updatedAt: new Date().toISOString(),
          }
        : pet
    );

    setPets(updatedPets);
    savePetsToStorage(updatedPets);

    // Log audit entry for pet update
    const auditEntry = auditHelpers.logPetUpdated(user, newPet, {
      old: editingPet,
      new: newPet,
    });
    processAuditEntry(auditEntry);

    setEditingPet(null);
    setNewPet({ name: '', type: '', breed: '', notes: '', owners: [] });
    setShowAddForm(false);
  };

  const handleDeletePet = (petId) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Weet je zeker dat je dit huisdier wilt verwijderen?')) {
      const petToDelete = pets.find((pet) => pet.id === petId);
      const updatedPets = pets.filter((pet) => pet.id !== petId);
      setPets(updatedPets);
      savePetsToStorage(updatedPets);

      // Log audit entry for pet deletion
      if (petToDelete) {
        const auditEntry = auditHelpers.logPetDeleted(user, petToDelete);
        processAuditEntry(auditEntry);
        notify(`Huisdier "${petToDelete.name}" succesvol verwijderd`, {
          type: 'success',
        });
      }
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setNewPet({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      notes: pet.notes,
      owners: pet.owners,
    });
    setShowAddForm(true);
  };

  const autoAssignPetLabels = (pet) => {
    // This would integrate with the labels system
    // For now, just log the action
    // eslint-disable-next-line no-console
    console.log(
      `Auto-assigning pet labels for ${pet.type} to owners:`,
      pet.owners
    );
  };

  const getOwnerNames = (ownerIds) => {
    return ownerIds
      .map((id) => {
        const resident = residents.find((r) => r.id === id);
        return resident ? resident.name : 'Onbekend';
      })
      .join(', ');
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      pet.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const petTypes = [...new Set(pets.map((pet) => pet.type))];

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <Heart className='w-6 h-6 text-amber-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Huisdieren Beheren
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          {/* Controls */}
          <div className='flex gap-4 mb-6'>
            <div className='flex-1'>
              <label htmlFor='pet-search' className='sr-only'>
                Zoek huisdieren
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  id='pet-search'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Zoek huisdieren...'
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <label htmlFor='pet-filter' className='sr-only'>
                Filter huisdieren op type
              </label>
              <select
                id='pet-filter'
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
              >
                <option value='all'>Alle types</option>
                {petTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className='bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2'
            >
              <Plus className='w-4 h-4' />
              Nieuw Huisdier
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className='bg-amber-50 rounded-lg p-6 mb-6'>
              <h3 className='font-semibold text-amber-900 mb-4'>
                {editingPet ? 'Huisdier Bewerken' : 'Nieuw Huisdier Toevoegen'}
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label
                    htmlFor='pet-name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Naam *
                  </label>
                  <input
                    type='text'
                    id='pet-name'
                    value={newPet.name}
                    onChange={(e) =>
                      setNewPet((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                    placeholder='Naam van het huisdier'
                  />
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
                    value={newPet.type}
                    onChange={(e) =>
                      setNewPet((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
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
                </div>
                <div>
                  <label
                    htmlFor='pet-breed'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Ras
                  </label>
                  {newPet.type === 'Hond' ? (
                    <select
                      id='pet-breed'
                      value={newPet.breed}
                      onChange={(e) =>
                        setNewPet((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                    >
                      <option value=''>Selecteer ras (optioneel)</option>
                      <option value='Chihuahua'>Chihuahua</option>
                      <option value='Pomeriaan'>Pomeriaan</option>
                      <option value='Franse Bulldog'>Franse Bulldog</option>
                      <option value='Yorkshire Terrier'>
                        Yorkshire Terrier
                      </option>
                      <option value='Shih Tzu'>Shih Tzu</option>
                      <option value='Dwergkeeshond'>Dwergkeeshond</option>
                      <option value='Dwergpinscher'>Dwergpinscher</option>
                      <option value='Mopshond (Pug)'>Mopshond (Pug)</option>
                      <option value='Maltezer'>Maltezer</option>
                      <option value='Bichon Frisé'>Bichon Frisé</option>
                      <option value='Papillon'>Papillon</option>
                      <option value='Cavalier King Charles Spaniël'>
                        Cavalier King Charles Spaniël
                      </option>
                      <option value='Toy Poedel'>Toy Poedel</option>
                      <option value='Tibetaanse Spaniel'>
                        Tibetaanse Spaniel
                      </option>
                      <option value='Japanse Chin'>Japanse Chin</option>
                      <option value='Chinese Naakthond'>
                        Chinese Naakthond
                      </option>
                      <option value='Boston Terriër'>Boston Terriër</option>
                      <option value='Griffon Bruxellois'>
                        Griffon Bruxellois
                      </option>
                      <option value='Italiaanse Windhond'>
                        Italiaanse Windhond
                      </option>
                      <option value='Lhasa Apso'>Lhasa Apso</option>
                      <option value='Anders'>Anders</option>
                    </select>
                  ) : newPet.type === 'Kat' ? (
                    <select
                      id='pet-breed'
                      value={newPet.breed}
                      onChange={(e) =>
                        setNewPet((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                    >
                      <option value=''>Selecteer ras (optioneel)</option>
                      <option value='Britse Korthaar'>Britse Korthaar</option>
                      <option value='Perzische Kat'>Perzische Kat</option>
                      <option value='Maine Coon'>Maine Coon</option>
                      <option value='Ragdoll'>Ragdoll</option>
                      <option value='Siamese'>Siamese</option>
                      <option value='Scottish Fold'>Scottish Fold</option>
                      <option value='Sphynx'>Sphynx</option>
                      <option value='Bengaal'>Bengaal</option>
                      <option value='Abessijn'>Abessijn</option>
                      <option value='Russisch Blauw'>Russisch Blauw</option>
                      <option value='Noorse Boskat'>Noorse Boskat</option>
                      <option value='Birmaan'>Birmaan</option>
                      <option value='Exotic Shorthair'>Exotic Shorthair</option>
                      <option value='Devon Rex'>Devon Rex</option>
                      <option value='Cornish Rex'>Cornish Rex</option>
                      <option value='Bombay'>Bombay</option>
                      <option value='Munchkin'>Munchkin</option>
                      <option value='Tonkinese'>Tonkinese</option>
                      <option value='Burmese'>Burmese</option>
                      <option value='Ocicat'>Ocicat</option>
                      <option value='Anders'>Anders</option>
                    </select>
                  ) : (
                    <input
                      type='text'
                      id='pet-breed'
                      value={newPet.breed}
                      onChange={(e) =>
                        setNewPet((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                      placeholder='Ras (optioneel)'
                    />
                  )}
                </div>
                <div>
                  <label
                    htmlFor='pet-owners'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Eigenaren * (minimaal 1)
                  </label>
                  <select
                    id='pet-owners'
                    multiple
                    value={newPet.owners}
                    onChange={(e) =>
                      setNewPet((prev) => ({
                        ...prev,
                        owners: Array.from(e.target.selectedOptions, (option) =>
                          parseInt(option.value)
                        ),
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                    size='3'
                  >
                    {residents.map((resident) => (
                      <option key={resident.id} value={resident.id}>
                        {resident.name} - {resident.room}
                      </option>
                    ))}
                  </select>
                  <p className='text-xs text-gray-500 mt-1'>
                    Houd Ctrl/Cmd ingedrukt om meerdere eigenaren te selecteren
                  </p>
                </div>
              </div>

              <div className='mb-4'>
                <label
                  htmlFor='pet-notes'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Notities
                </label>
                <textarea
                  id='pet-notes'
                  value={newPet.notes}
                  onChange={(e) =>
                    setNewPet((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500'
                  placeholder='Bijzonderheden over het huisdier...'
                />
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={editingPet ? handleUpdatePet : handleAddPet}
                  className='bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2'
                >
                  <Save className='w-4 h-4' />
                  {editingPet ? 'Bijwerken' : 'Toevoegen'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPet(null);
                    setNewPet({
                      name: '',
                      type: '',
                      breed: '',
                      notes: '',
                      owners: [],
                    });
                  }}
                  className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Pets List */}
          <div className='space-y-4'>
            {filteredPets.map((pet) => (
              <div
                key={pet.id}
                className='bg-white border border-amber-200 rounded-lg p-4 hover:shadow-sm transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <Heart className='w-5 h-5 text-amber-600' />
                      <div>
                        <h3 className='font-semibold text-amber-900'>
                          {pet.name}
                        </h3>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded'>
                            {pet.type}
                          </span>
                          {pet.breed && (
                            <span className='text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded'>
                              {pet.breed}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 mb-2'>
                      <Users className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-700'>
                        Eigenaren: {getOwnerNames(pet.owners)}
                      </span>
                    </div>

                    {pet.notes && (
                      <p className='text-sm text-gray-600 mt-2'>{pet.notes}</p>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => handleEditPet(pet)}
                      className='p-2 text-gray-400 hover:text-amber-600 transition-colors'
                      title='Bewerken'
                    >
                      <Edit className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                      title='Verwijderen'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPets.length === 0 && (
              <div className='text-center py-12'>
                <Heart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500'>
                  {searchTerm || filterType !== 'all'
                    ? 'Geen huisdieren gevonden'
                    : 'Nog geen huisdieren toegevoegd'}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className='mt-8 bg-amber-50 rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-amber-900 mb-4'>
              Huisdieren Statistieken
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Heart className='w-5 h-5 text-amber-600' />
                  <span className='font-semibold'>Totaal Huisdieren</span>
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {pets.length}
                </p>
              </div>
              <div className='bg-white rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <User className='w-5 h-5 text-green-600' />
                  <span className='font-semibold'>Bewoners met Huisdier</span>
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {new Set(pets.flatMap((pet) => pet.owners)).size}
                </p>
              </div>
              <div className='bg-white rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Filter className='w-5 h-5 text-blue-600' />
                  <span className='font-semibold'>Verschillende Types</span>
                </div>
                <p className='text-2xl font-bold text-gray-900'>
                  {petTypes.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetsManager;
