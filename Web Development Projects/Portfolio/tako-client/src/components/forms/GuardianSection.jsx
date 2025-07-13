import React from 'react';
import { UserPlus, Search, X /* Shield, CheckCircle */ } from 'lucide-react';
import Button from '../ui/Button.jsx';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import PhotoService from '../../utils/photoService.js';

const GuardianSection = ({
  showQuickGuardian,
  showGuardianSearch,
  quickGuardianData,
  onQuickGuardianChange,
  onQuickGuardianSubmit,
  onQuickGuardianClose,
  onGuardianSearchClose,
  onGuardianLink,
  existingResidents,
  formData,
}) => {
  const calculateAge = (birthDate) => {
    if (!birthDate) {
      return null;
    }
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (!showQuickGuardian && !showGuardianSearch) {
    return null;
  }

  return (
    <div className='space-y-4'>
      {/* Quick Guardian Form */}
      {showQuickGuardian && (
        <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-medium text-green-800 flex items-center gap-2'>
              <UserPlus className='w-5 h-5' />
              Snel Begeleider Toevoegen
            </h4>
            <button
              onClick={onQuickGuardianClose}
              className='text-green-600 hover:text-green-800'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <p className='text-sm text-green-700 mb-4'>
            Voeg snel een volwassen begeleider toe voor {formData.name}. Deze
            begeleider wordt automatisch gekoppeld als familielid.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='guardian-name'
                className='block text-sm font-medium text-green-700 mb-1'
              >
                Naam begeleider *
              </label>
              <input
                id='guardian-name'
                type='text'
                value={quickGuardianData.name}
                onChange={(e) =>
                  onQuickGuardianChange({ name: e.target.value })
                }
                className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='Volledige naam'
              />
            </div>
            <div>
              <label
                htmlFor='guardian-relationship'
                className='block text-sm font-medium text-green-700 mb-1'
              >
                Relatie tot {formData.name}
              </label>
              <select
                id='guardian-relationship'
                value={quickGuardianData.relationship}
                onChange={(e) =>
                  onQuickGuardianChange({ relationship: e.target.value })
                }
                className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                <option value='parent'>Ouder</option>
                <option value='guardian'>Voogd</option>
                <option value='sibling'>Ouder broer/zus</option>
                <option value='relative'>Familie</option>
                <option value='other'>Anders</option>
              </select>
            </div>
            <div>
              <label
                htmlFor='guardian-birth-date'
                className='block text-sm font-medium text-green-700 mb-1'
              >
                Geboortedatum begeleider *
              </label>
              <input
                id='guardian-birth-date'
                type='date'
                value={quickGuardianData.birthDate}
                onChange={(e) =>
                  onQuickGuardianChange({ birthDate: e.target.value })
                }
                className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split('T')[0]
                }
              />
            </div>
            <div>
              <label
                htmlFor='guardian-phone'
                className='block text-sm font-medium text-green-700 mb-1'
              >
                Telefoon begeleider
              </label>
              <input
                id='guardian-phone'
                type='tel'
                value={quickGuardianData.phone}
                onChange={(e) =>
                  onQuickGuardianChange({ phone: e.target.value })
                }
                className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                placeholder='+31 6 12345678'
              />
            </div>
          </div>
          <div className='mt-4 flex justify-end gap-2'>
            <Button
              variant='secondary'
              onClick={onQuickGuardianClose}
              className='text-sm'
            >
              Annuleren
            </Button>
            <Button
              variant='primary'
              onClick={onQuickGuardianSubmit}
              className='text-sm bg-green-600 hover:bg-green-700'
            >
              Begeleider Toevoegen
            </Button>
          </div>
        </div>
      )}

      {/* Guardian Search */}
      {showGuardianSearch && (
        <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center justify-between mb-4'>
            <h4 className='text-lg font-medium text-blue-800 flex items-center gap-2'>
              <Search className='w-5 h-5' />
              Zoek Bestaande Begeleider
            </h4>
            <button
              onClick={onGuardianSearchClose}
              className='text-blue-600 hover:text-blue-800'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
          <p className='text-sm text-blue-700 mb-4'>
            Selecteer een volwassen bewoner om als begeleider te koppelen aan{' '}
            {formData.name}.
          </p>
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {existingResidents
              .filter((r) => calculateAge(r.birthDate) >= 18)
              .slice(0, 5)
              .map((adult) => (
                <div
                  key={adult.id}
                  className='flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <OptimizedImage
                      src={adult.photo}
                      fallbackSrc={PhotoService.generateAvatar(
                        adult.name,
                        adult.gender
                      )}
                      alt={adult.name}
                      className='w-10 h-10 rounded-full object-cover'
                      lazy={true}
                    />
                    <div>
                      <p className='font-medium text-gray-900'>{adult.name}</p>
                      <p className='text-sm text-gray-600'>
                        {calculateAge(adult.birthDate)} jaar • Kamer{' '}
                        {adult.room}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant='primary'
                    onClick={() => onGuardianLink(adult)}
                    className='text-sm'
                  >
                    Koppelen als begeleider
                  </Button>
                </div>
              ))}
            {existingResidents.filter((r) => calculateAge(r.birthDate) >= 18)
              .length === 0 && (
              <p className='text-sm text-blue-600 text-center py-4'>
                Geen volwassen bewoners gevonden
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuardianSection;
