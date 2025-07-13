import React from 'react';
import {
  User,
  // MapPin, // Unused
  // Globe, // Unused
  // Calendar, // Unused
  // Phone, // Unused
  // Mail, // Unused
  Shield,
  CheckCircle,
  Upload,
} from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import PhotoService from '../../utils/photoService.js';

const PersonalInfoSection = ({
  formData,
  onInputChange,
  onPhotoUpload,
  guardianWarning,
  onQuickGuardianClick,
  onGuardianSearchClick,
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

  return (
    <div className='space-y-6'>
      {/* Profile Photo */}
      <div className='flex flex-col items-center mb-6'>
        <div className='relative w-[75px] h-[75px] mb-2'>
          <OptimizedImage
            src={formData.photo || PhotoService.generatePhoto(formData)}
            fallbackSrc={PhotoService.generateAvatar(
              formData.name,
              formData.gender
            )}
            alt={formData.name || 'Resident photo'}
            className='w-[75px] h-[75px] rounded-full object-cover border'
            lazy={false}
          />
          <label
            htmlFor='personal-photo-upload'
            className='absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-lg hover:bg-blue-700 transition-colors'
          >
            <Upload className='w-4 h-4' />
            <input
              id='personal-photo-upload'
              type='file'
              accept='image/*'
              onChange={onPhotoUpload}
              className='hidden'
            />
          </label>
        </div>
        <p className='text-xs text-gray-500 text-center'>
          Klik op het camera-icoon om een foto te uploaden
        </p>
      </div>

      {/* Basic Information Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label
            htmlFor='personal-name'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Volledige naam *
          </label>
          <input
            id='personal-name'
            type='text'
            name='name'
            value={formData.name || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Voor- en achternaam'
          />
          {guardianWarning && guardianWarning.age && (
            <p className='text-xs text-amber-600 mt-1'>
              ⚠️ {guardianWarning.age} jaar oud - mogelijk begeleider nodig
            </p>
          )}
          {formData.type !== 'human' && (
            <p className='text-xs text-gray-500 mt-1'>
              Vaak onbekend bij dieren uit het asiel
            </p>
          )}

          {/* Guardian Status */}
          {formData.guardianName && (
            <div className='mt-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600' />
                <div>
                  <p className='text-sm font-medium text-green-800'>
                    Begeleider gekoppeld: {formData.guardianName}
                  </p>
                  <p className='text-xs text-green-700'>
                    Relatie: {formData.guardianRelationship}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guardian Warning */}
          {guardianWarning &&
            !guardianWarning.hasAdultFamily &&
            !formData.guardianName && (
              <div className='mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg'>
                <div className='flex items-start gap-2'>
                  <Shield className='w-4 h-4 text-amber-600 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-amber-800'>
                      Minderjarige heeft begeleider nodig
                    </p>
                    <p className='text-xs text-amber-700 mt-1'>
                      {formData.name || 'Deze bewoner'} is {guardianWarning.age}{' '}
                      jaar oud en heeft een volwassen begeleider (18+) nodig.
                    </p>
                    <div className='mt-2 flex gap-2'>
                      <button
                        type='button'
                        onClick={onQuickGuardianClick}
                        className='text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors flex items-center gap-1'
                      >
                        <User className='w-3 h-3' />
                        Snel begeleider toevoegen
                      </button>
                      <button
                        type='button'
                        onClick={onGuardianSearchClick}
                        className='text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1'
                      >
                        <Shield className='w-3 h-3' />
                        Zoek bestaande begeleider
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div>
          <label
            htmlFor='personal-gender'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Geslacht
          </label>
          <select
            id='personal-gender'
            name='gender'
            value={formData.gender || 'M'}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='M'>Man</option>
            <option value='F'>Vrouw</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='personal-arrival-date'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Aankomstdatum
          </label>
          <input
            id='personal-arrival-date'
            type='date'
            name='arrivalDate'
            value={formData.arrivalDate || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label
            htmlFor='personal-language'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Taal
          </label>
          <input
            id='personal-language'
            type='text'
            name='language'
            value={formData.language || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Moedertaal'
          />
        </div>

        <div>
          <label
            htmlFor='personal-nationality'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Nationaliteit *
          </label>
          <input
            id='personal-nationality'
            type='text'
            name='nationality'
            value={formData.nationality || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Land van herkomst'
          />
        </div>

        <div>
          <label
            htmlFor='personal-birth-date'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Geboortedatum
          </label>
          <input
            id='personal-birth-date'
            type='date'
            name='birthDate'
            value={formData.birthDate || ''}
            onChange={onInputChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          {formData.birthDate && (
            <p className='text-xs text-gray-500 mt-1'>
              Leeftijd: {calculateAge(formData.birthDate)} jaar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
