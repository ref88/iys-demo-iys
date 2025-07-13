import React, { useState } from 'react';
import { User, X, Save, Lock, Users } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import AutoComplete from '../ui/AutoComplete.jsx';
import RoommateLogic from '../shared/RoommateLogic.jsx';
import { searchNationalities } from '../../utils/nationalities.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { updateResidentWithLabels } from '../../utils/residentUtils.ts';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const AddResidentModalNew = ({
  isOpen,
  onClose,
  onSubmit,
  onFamilyWizardClick,
  existingResidents = [],
  roomCapacities = {},
}) => {
  const { canEditField } = useAuth();
  const { notify } = useNotifications();
  const [formData, setFormData] = useState({
    type: 'human',
    firstName: '',
    lastName: '',
    nationality: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    roomNumber: '',
    notes: '',
    bsn: '',
    intakeDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roommate mode state
  const [isRoommateMode, setIsRoommateMode] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoommates, setSelectedRoommates] = useState([]);
  const [roommateFinancialArrangement, setRoommateFinancialArrangement] =
    useState('independent');

  // Calculate max date for 18+ requirement (18 years ago from today)
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
  const maxBirthDateString = maxBirthDate.toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle field blur for real-time validation
  const handleFieldBlur = (fieldName) => {
    const value = formData[fieldName];
    const errorMessage = validateField(fieldName, value);

    if (errorMessage) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    }
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'firstName':
        return !value.trim() ? 'Voornaam is verplicht' : null;

      case 'lastName':
        return !value.trim() ? 'Achternaam is verplicht' : null;

      case 'nationality':
        return !value.trim() ? 'Nationaliteit is verplicht' : null;

      case 'birthDate': {
        if (!value) {
          return 'Geboortedatum is verplicht';
        }

        // Check if person is at least 18 years old
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Calculate exact age considering month and day
        const exactAge =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1
            : age;

        if (exactAge < 18) {
          return 'Bewoner moet minimaal 18 jaar oud zijn';
        }
        return null;
      }

      case 'phone':
        return !value.trim() ? 'Telefoon is verplicht' : null;

      case 'roomNumber':
        return !value.trim() ? 'Kamernummer is verplicht' : null;

      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Ongeldig email formaat';
        }
        return null;

      case 'bsn':
        if (value.trim() && !/^\d{8,9}$/.test(value.replace(/\s/g, ''))) {
          return 'BSN moet 8 of 9 cijfers bevatten';
        }
        return null;

      default:
        return null;
    }
  };

  // Roommate handlers
  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    setFormData((prev) => ({ ...prev, roomNumber: roomId }));
  };

  const handleRoommateSelect = (occupantId, relationship) => {
    setSelectedRoommates((prev) => {
      const existing = prev.find((r) => r.id === occupantId);
      if (existing) {
        return prev.map((r) =>
          r.id === occupantId ? { ...r, relationship } : r
        );
      } else {
        return [...prev, { id: occupantId, relationship }];
      }
    });
  };

  const handleRoommateFinancialChange = (arrangement) => {
    setRoommateFinancialArrangement(arrangement);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Voornaam is verplicht';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Achternaam is verplicht';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationaliteit is verplicht';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Geboortedatum is verplicht';
    } else {
      // Check if person is at least 18 years old
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // Calculate exact age considering month and day
      const exactAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      if (exactAge < 18) {
        newErrors.birthDate = 'Bewoner moet minimaal 18 jaar oud zijn';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefoon is verplicht';
    }

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Kamernummer is verplicht';
    }

    // Email validation (optional field)
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Ongeldig email formaat';
    }

    // BSN validation (optional field)
    if (
      formData.bsn.trim() &&
      !/^\d{8,9}$/.test(formData.bsn.replace(/\s/g, ''))
    ) {
      newErrors.bsn = 'BSN moet 8 of 9 cijfers bevatten';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create full resident object
      const baseResident = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nationality: formData.nationality,
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        room: formData.roomNumber,
        notes: formData.notes,
        bsn: formData.bsn || null,
        intakeDate: formData.intakeDate || null,
        type: 'human',
        status: 'In procedure',
        statusColor: 'yellow',
        priority: 'Normal',
        arrivalDate: new Date().toISOString().split('T')[0],
        registrationDate: new Date().toISOString().split('T')[0],
        attendance: 'Aanwezig',
        lastSeen: 'Nu online',
        leaveBalance: 20,
        labels: [],
        photo: `https://images.unsplash.com/photo-1494790108755-2616c4e9c6e0?w=400&h=400&fit=crop&crop=face&auto=format&q=60`,
        locationType: 'OEKRAINE',
        bsnStatus: 'toegekend',
        vNumber: null,
        medicalInfo: {
          allergies: [],
          medications: [],
          emergencyContact: '',
        },
        documents: [],
        caseworker: '',
        language: '',
      };

      // Add roommate metadata if in roommate mode
      if (isRoommateMode) {
        baseResident.roommateInfo = {
          isRoommate: true,
          financialArrangement: roommateFinancialArrangement,
          roommates: selectedRoommates,
          selectedRoom: selectedRoomId,
        };
      }

      // Apply automatic labels including BSN checking
      const resident = updateResidentWithLabels(baseResident);

      await onSubmit(resident);

      notify('Bewoner succesvol toegevoegd', { type: 'success' });

      // Reset form
      setFormData({
        type: 'human',
        firstName: '',
        lastName: '',
        nationality: '',
        birthDate: '',
        gender: 'M',
        phone: '',
        email: '',
        roomNumber: '',
        notes: '',
        bsn: '',
        intakeDate: '',
      });

      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding resident:', error);
      notify('Er is een fout opgetreden bij het toevoegen van de bewoner', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Check if form has been modified
    const hasChanges =
      formData.firstName ||
      formData.lastName ||
      formData.nationality ||
      formData.birthDate ||
      formData.phone ||
      formData.email ||
      formData.roomNumber ||
      formData.notes ||
      formData.bsn ||
      formData.intakeDate;

    if (hasChanges) {
      notify('Formulier gesloten - wijzigingen niet opgeslagen', {
        type: 'warning',
      });
    }

    // Reset form when closing
    setFormData({
      type: 'human',
      firstName: '',
      lastName: '',
      nationality: '',
      birthDate: '',
      gender: 'M',
      phone: '',
      email: '',
      roomNumber: '',
      notes: '',
      bsn: '',
      intakeDate: '',
    });
    setErrors({});
    setIsRoommateMode(false);
    setSelectedRoomId(null);
    setSelectedRoommates([]);
    setRoommateFinancialArrangement('independent');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth='2xl'>
      <div className='p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2'>
            <User className='w-5 h-5' />
            Nieuwe Bewoner Toevoegen
          </h2>
          <button
            onClick={handleClose}
            className='p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Type Selection - Fixed to Human */}
          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Type
            </div>
            <select
              value='human'
              disabled
              className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300'
            >
              <option value='human'>Mens</option>
            </select>
          </div>

          {/* Name Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Voornaam *
              </label>
              <input
                id='firstName'
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('firstName')}
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
                htmlFor='lastName'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Achternaam *
              </label>
              <input
                id='lastName'
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('lastName')}
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

          {/* Personal Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='nationality'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Nationaliteit *
              </label>
              <AutoComplete
                id='nationality'
                value={formData.nationality}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, nationality: value }));
                  // Clear error when user starts typing
                  if (errors.nationality) {
                    setErrors((prev) => ({
                      ...prev,
                      nationality: '',
                    }));
                  }
                }}
                onBlur={() => handleFieldBlur('nationality')}
                onSearch={searchNationalities}
                placeholder='Type om nationaliteit te zoeken...'
                error={!!errors.nationality}
                allowCustom={true}
                maxResults={8}
              />
              {errors.nationality && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.nationality}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='birthDate'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Geboortedatum *
              </label>
              <input
                id='birthDate'
                type='date'
                name='birthDate'
                value={formData.birthDate}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('birthDate')}
                max={maxBirthDateString}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 ${
                  errors.birthDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birthDate && (
                <p className='text-red-500 text-sm mt-1'>{errors.birthDate}</p>
              )}
              <p className='text-xs text-gray-500 mt-1'>
                Bewoners moeten minimaal 18 jaar oud zijn. Voor minderjarigen
                gebruik{' '}
                <button
                  type='button'
                  onClick={() => {
                    onClose();
                    onFamilyWizardClick?.();
                  }}
                  className='text-blue-600 hover:text-blue-800 underline font-medium'
                >
                  Gezinsregistratie
                </button>
                .
              </p>
            </div>
          </div>

          {/* Gender and Room */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='gender'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Geslacht
              </label>
              <select
                id='gender'
                name='gender'
                value={formData.gender}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              >
                <option value='M'>Man</option>
                <option value='V'>Vrouw</option>
              </select>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <label
                  htmlFor='roomNumber'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Kamernummer *
                </label>
                <Button
                  type='button'
                  variant={isRoommateMode ? 'primary' : 'secondary'}
                  size='sm'
                  onClick={() => setIsRoommateMode(!isRoommateMode)}
                >
                  <Users className='w-4 h-4 mr-1' />
                  {isRoommateMode ? 'Eigen kamer' : 'Kamergenoot'}
                </Button>
              </div>

              {isRoommateMode ? (
                <div className='p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                  <RoommateLogic
                    existingResidents={existingResidents}
                    roomCapacities={roomCapacities}
                    selectedRoomId={selectedRoomId}
                    onRoomSelect={handleRoomSelect}
                    selectedRoommates={selectedRoommates}
                    onRoommateSelect={handleRoommateSelect}
                    newOccupants={1}
                    showFinancialArrangement={true}
                    financialArrangement={roommateFinancialArrangement}
                    onFinancialArrangementChange={handleRoommateFinancialChange}
                    errors={{
                      roomSelection: errors.roomNumber,
                    }}
                  />
                </div>
              ) : (
                <input
                  id='roomNumber'
                  type='text'
                  name='roomNumber'
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('roomNumber')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.roomNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Bijv. 101, A-12...'
                />
              )}

              {errors.roomNumber && (
                <p className='text-red-500 text-sm mt-1'>{errors.roomNumber}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Telefoon *
              </label>
              <input
                id='phone'
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('phone')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='+31 6 12345678'
              />
              {errors.phone && (
                <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='email@example.com'
              />
              {errors.email && (
                <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
              )}
            </div>
          </div>

          {/* BSN and Intake Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='bsn'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                BSN Nummer
              </label>
              <input
                id='bsn'
                type='text'
                name='bsn'
                value={formData.bsn}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur('bsn')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.bsn ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='123456789'
                maxLength='9'
              />
              {errors.bsn && (
                <p className='text-red-500 text-sm mt-1'>{errors.bsn}</p>
              )}
              <p className='text-xs text-gray-500 mt-1'>
                8 of 9 cijfers (optioneel)
              </p>
            </div>

            <div>
              <label
                htmlFor='intakeDate'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'
              >
                Instroomdatum
                {!canEditField('intakeDate') && (
                  <Lock className='w-4 h-4 text-gray-400' />
                )}
              </label>
              <input
                id='intakeDate'
                type='date'
                name='intakeDate'
                value={formData.intakeDate}
                onChange={handleInputChange}
                disabled={!canEditField('intakeDate')}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:border-gray-600 ${
                  !canEditField('intakeDate')
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                    : ''
                }`}
              />
              <p className='text-xs text-gray-500 mt-1'>
                {!canEditField('intakeDate')
                  ? 'Alleen admin/management/coördinator kunnen deze datum wijzigen'
                  : 'Datum van instroom (optioneel)'}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor='notes'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Opmerkingen
            </label>
            <textarea
              id='notes'
              name='notes'
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              placeholder='Eventuele opmerkingen...'
            />
          </div>

          {/* Submit buttons */}
          <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type='submit'
              variant='primary'
              loading={isSubmitting}
              icon={Save}
            >
              {isSubmitting ? 'Toevoegen...' : 'Bewoner Toevoegen'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddResidentModalNew;
