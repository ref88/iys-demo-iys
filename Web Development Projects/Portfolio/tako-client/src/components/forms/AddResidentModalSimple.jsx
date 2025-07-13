import React, { useState } from 'react';
import { User, X } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const AddResidentModalSimple = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
}) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormChange({
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.firstName) {
      newErrors.firstName = 'Voornaam is verplicht';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Achternaam is verplicht';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await onSubmit(formData);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth='2xl'>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2'>
            <User className='w-5 h-5' />
            Nieuwe Bewoner Toevoegen
          </h2>
          <button
            onClick={onClose}
            className='p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Type Selection */}
          <div>
            <label
              htmlFor='resident-type'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Type
            </label>
            <select
              id='resident-type'
              name='type'
              value={formData.type || 'human'}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            >
              <option value='human'>Mens</option>
              <option value='cat'>Kat</option>
              <option value='dog'>Hond</option>
            </select>
          </div>

          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='resident-first-name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Voornaam *
              </label>
              <input
                id='resident-first-name'
                type='text'
                name='firstName'
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Voer voornaam in...'
              />
              {errors.firstName && (
                <p className='text-red-500 text-sm mt-1'>{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='resident-last-name'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Achternaam *
              </label>
              <input
                id='resident-last-name'
                type='text'
                name='lastName'
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Voer achternaam in...'
              />
              {errors.lastName && (
                <p className='text-red-500 text-sm mt-1'>{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Additional fields for humans */}
          {formData.type === 'human' && (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='resident-birth-date'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Geboortedatum
                  </label>
                  <input
                    id='resident-birth-date'
                    type='date'
                    name='birthDate'
                    value={formData.birthDate || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  />
                </div>

                <div>
                  <label
                    htmlFor='resident-gender'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Geslacht
                  </label>
                  <select
                    id='resident-gender'
                    name='gender'
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  >
                    <option value=''>Selecteer geslacht</option>
                    <option value='M'>Man</option>
                    <option value='V'>Vrouw</option>
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='resident-nationality'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Nationaliteit
                  </label>
                  <input
                    id='resident-nationality'
                    type='text'
                    name='nationality'
                    value={formData.nationality || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='Bijv. Nederlands, Syrisch...'
                  />
                </div>

                <div>
                  <label
                    htmlFor='resident-room-number'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Kamernummer
                  </label>
                  <input
                    id='resident-room-number'
                    type='text'
                    name='roomNumber'
                    value={formData.roomNumber || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='Bijv. 101, A-12...'
                  />
                </div>
              </div>

              {/* Contact Information - Only for humans */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='resident-phone'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Telefoon
                  </label>
                  <input
                    id='resident-phone'
                    type='tel'
                    name='phone'
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='+31 6 12345678'
                  />
                </div>

                <div>
                  <label
                    htmlFor='resident-email'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Email
                  </label>
                  <input
                    id='resident-email'
                    type='email'
                    name='email'
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                    placeholder='email@example.com'
                  />
                </div>
              </div>
            </>
          )}

          {/* Animal-specific fields */}
          {formData.type !== 'human' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='resident-breed'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Ras
                </label>
                <input
                  id='resident-breed'
                  type='text'
                  name='breed'
                  value={formData.breed || ''}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  placeholder='Bijv. Europese korthaar, Labrador...'
                />
              </div>

              <div>
                <label
                  htmlFor='resident-weight'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Gewicht (kg)
                </label>
                <input
                  id='resident-weight'
                  type='number'
                  name='weight'
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                  placeholder='Gewicht in kg'
                  min='0'
                  step='0.1'
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              htmlFor='resident-notes'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Opmerkingen
            </label>
            <textarea
              id='resident-notes'
              name='notes'
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Eventuele opmerkingen...'
            />
          </div>

          {/* Submit buttons */}
          <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <Button type='button' variant='outline' onClick={onClose}>
              Annuleren
            </Button>
            <Button type='submit' variant='primary'>
              Bewoner Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddResidentModalSimple;
