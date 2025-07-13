import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Save,
  Shield,
  Activity,
  Tag,
  Heart,
  UserPlus,
  Search,
  X,
  Cat,
  Dog,
  Briefcase,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import useModalClose from '../../hooks/useModalClose.js';
import useFormChangeDetection from '../../hooks/useFormChangeDetection.js';
// import ProfileImage from '../ui/ProfileImage.jsx'; // Unused
import OptimizedImage from '../ui/OptimizedImage.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import PhotoService from '../../utils/photoService.js';
import SuccessAnimation from '../ui/SuccessAnimation.jsx';
import FormField from '../ui/FormField.jsx';
import ValidationSummary, {
  ValidationSuccess,
} from '../ui/ValidationSummary.jsx';
import { validateResidentForm } from '../../utils/validationUtils.js';
import { auditHelpers } from '../../utils/auditLogger';
import { useAuth } from '../auth/AuthContext.jsx';
import EnhancedLabelSelector from './EnhancedLabelSelector.jsx';
import PetForm from './PetForm.jsx';
import PersonalInfoSection from './PersonalInfoSection.jsx';
import ContactInfoSection from './ContactInfoSection.jsx';
import StatusSection from './StatusSection.jsx';
import GuardianSection from './GuardianSection.jsx';

const AddResidentModal = ({
  isOpen,
  onClose,
  onSave,
  caseworkers = [],
  initialData,
  locationType = 'CNO',
  availableLabels = [],
  labelUsageCounts = {},
  existingResidents = [],
}) => {
  const { notify } = useNotifications();
  const { user } = useAuth();

  // Reset form function
  const resetForm = () => {
    setFormData({
      type: 'human',
      name: '',
      nationality: '',
      status: 'In procedure',
      statusColor: 'yellow',
      room: '',
      arrivalDate: new Date().toISOString().split('T')[0],
      birthDate: '',
      gender: 'M',
      phone: '',
      email: '',
      language: '',
      priority: 'Normal',
      caseworker: '',
      notes: '',
      medicalInfo: {
        allergies: [],
        medications: [],
        emergencyContact: '',
      },
      documents: [],
      photo: '',
      nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
      nummerWaarde: '',
      bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined,
      labels: [],
      pets: [],
    });
    setErrors({});
  };

  // Form change detection
  const initialFormData = {
    type: 'human', // 'human', 'cat', 'dog'
    name: '',
    nationality: '',
    status: 'In procedure',
    statusColor: 'yellow',
    room: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    language: '',
    priority: 'Normal',
    caseworker: '',
    notes: '',
    medicalInfo: {
      allergies: [],
      medications: [],
      emergencyContact: '',
    },
    documents: [],
    photo: '',
    nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
    nummerWaarde: '',
    bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined,
    labels: [],
    pets: [],
    // Pet-specific fields
    breed: '',
    isChipped: false,
    isVaccinated: false,
    isSterilized: false,
    nextVaccinationDate: '',
    // Ooievaarspas fields
    hasOoievaarspas: false,
    ooievaarspasnummer: '',
    ooievaarspasExpiry: '',
    // Work status fields
    workStatus: [], // Can have multiple: 'zzp', 'loondienst', 'leefgeld', 'jumbo'
    zzpDetails: '',
    employerName: '',
    leefgeldAmount: '',
    jumboCardNumber: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // Form change detection
  const { isDirty, checkForChanges, resetOriginalData } =
    useFormChangeDetection(
      initialFormData,
      { ignoreFields: ['photo'] } // Photo changes shouldn't trigger unsaved warning
    );

  // Handle unsaved changes warning
  const handleUnsavedChanges = () => {
    notify('Je hebt onopgeslagen wijzigingen', {
      type: 'warning',
      duration: 6000,
      action: {
        label: 'Toch sluiten',
        callback: () => {
          resetForm();
          onClose();
        },
      },
    });
  };

  const modalClose = useModalClose(onClose, {
    onCleanup: resetForm,
    hasUnsavedChanges: isDirty,
    onUnsavedChanges: handleUnsavedChanges,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  // const [_photoPreview, _setPhotoPreview] = useState('');
  const [bsnRequested, setBsnRequested] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [guardianWarning, setGuardianWarning] = useState(null);
  const [showGuardianConfirmation, setShowGuardianConfirmation] =
    useState(false);
  const [showQuickGuardian, setShowQuickGuardian] = useState(false);
  const [quickGuardianData, setQuickGuardianData] = useState({
    name: '',
    relationship: 'parent',
    birthDate: '',
    phone: '',
  });
  const [showGuardianSearch, setShowGuardianSearch] = useState(false);

  // Animation states
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [animationType, setAnimationType] = useState(''); // 'save', 'add', 'update'

  // Animation helper function
  const triggerSuccessAnimation = (type = 'save') => {
    setAnimationType(type);
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);
  };

  // Pet breed lists
  const dogBreeds = [
    'Bichon Frisé',
    'Boston Terriër',
    'Cavalier King Charles Spaniël',
    'Chihuahua',
    'Chinese Naakthond',
    'Dwergkeeshond',
    'Dwergpinscher',
    'Franse Bulldog',
    'Griffon Bruxellois',
    'Italiaanse Windhond',
    'Japanse Chin',
    'Lhasa Apso',
    'Maltezer',
    'Mopshond (Pug)',
    'Papillon',
    'Pomeriaan',
    'Shih Tzu',
    'Tibetaanse Spaniel',
    'Toy Poedel',
    'Yorkshire Terrier',
  ];

  const catBreeds = [
    'Europese Korthaar',
    'Perzische Kat',
    'Maine Coon',
    'Britse Korthaar',
    'Ragdoll',
    'Siamese',
    'Bengaal',
    'Sphynx',
    'Scottish Fold',
    'Noorse Boskat',
    'Russisch Blauw',
    'Abessijn',
    'Birmaan',
    'Kruising/Mix',
  ];

  // Helper function to calculate age
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

  // Check if resident needs guardian
  const checkGuardianRequirement = useCallback(
    (birthDate, labels = []) => {
      const age = calculateAge(birthDate);
      if (age === null || age >= 18) {
        return null;
      }

      // Check if there are adult family members in existing residents
      const adultFamilyMembers = existingResidents.filter((resident) => {
        const residentAge = calculateAge(resident.birthDate);
        return (
          residentAge >= 18 &&
          // Same family ID (if it exists)
          ((formData.familyId && resident.familyId === formData.familyId) ||
            // Same labels might indicate family
            (labels.length > 0 &&
              resident.labels &&
              labels.some((label) => resident.labels.includes(label))))
        );
      });

      return {
        age,
        hasAdultFamily: adultFamilyMembers.length > 0,
        adultFamilyMembers,
        isMinor: true,
      };
    },
    [existingResidents, formData.familyId]
  );

  useEffect(() => {
    if (isOpen && initialData) {
      // Map vNumber/bsnNumber back to nummerWaarde for editing
      const mappedData = {
        ...initialData,
        nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
        nummerWaarde:
          locationType === 'CNO' ? initialData.vNumber : initialData.bsnNumber,
        // Guardian information
        guardianId: initialData.guardianId || null,
        guardianName: initialData.guardianName || null,
        guardianRelationship: initialData.guardianRelationship || null,
        guardianPhone: initialData.guardianPhone || null,
        guardianBirthDate: initialData.guardianBirthDate || null,
      };
      setFormData(mappedData);
      // _setPhotoPreview(initialData.photo || '');
      setBsnRequested(initialData.bsnStatus === 'aangevraagd');
    } else if (isOpen && !initialData) {
      setFormData({
        name: '',
        nationality: '',
        status: 'In procedure',
        statusColor: 'yellow',
        room: '',
        arrivalDate: new Date().toISOString().split('T')[0],
        birthDate: '',
        phone: '',
        email: '',
        language: '',
        priority: 'Normal',
        caseworker: '',
        notes: '',
        medicalInfo: {
          allergies: [],
          medications: [],
          emergencyContact: '',
        },
        documents: [],
        photo: '',
        nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
        nummerWaarde:
          locationType === 'CNO'
            ? `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
            : '',
        bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined,
        labels: [],
        pets: [],
      });
      // _setPhotoPreview('');
      setBsnRequested(false);
    }
  }, [isOpen, initialData, locationType]);

  // Check guardian requirement when birth date changes
  useEffect(() => {
    if (formData.birthDate && !initialData) {
      const guardianCheck = checkGuardianRequirement(
        formData.birthDate,
        formData.labels
      );
      setGuardianWarning(guardianCheck);
    } else {
      setGuardianWarning(null);
    }
  }, [
    formData.birthDate,
    formData.labels,
    existingResidents,
    checkGuardianRequirement,
    initialData,
  ]);

  // Note: Pet residents are individual residents, not pets with owners

  // Track form changes for unsaved changes detection
  useEffect(() => {
    checkForChanges(formData);
  }, [formData, checkForChanges]);

  // Validation function
  const validateForm = () => {
    const validationErrors = validateResidentForm(
      {
        ...formData,
        bsnStatus: bsnRequested ? 'aangevraagd' : 'niet_aangevraagd',
      },
      locationType,
      existingResidents
    );

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

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

    // Clear validation summary if it's showing
    if (showValidationSummary) {
      setShowValidationSummary(false);
    }

    // Clear success message when user starts editing
    if (validationSuccess) {
      setValidationSuccess('');
    }
  };

  const handleMedicalInfoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: value,
      },
    }));
  };

  const addAllergy = () => {
    if (
      newAllergy.trim() &&
      !formData.medicalInfo.allergies.includes(newAllergy.trim())
    ) {
      handleMedicalInfoChange('allergies', [
        ...formData.medicalInfo.allergies,
        newAllergy.trim(),
      ]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    const updatedAllergies = formData.medicalInfo.allergies.filter(
      (_, i) => i !== index
    );
    handleMedicalInfoChange('allergies', updatedAllergies);
  };

  const addMedication = () => {
    if (
      newMedication.trim() &&
      !formData.medicalInfo.medications.includes(newMedication.trim())
    ) {
      handleMedicalInfoChange('medications', [
        ...formData.medicalInfo.medications,
        newMedication.trim(),
      ]);
      setNewMedication('');
    }
  };

  const removeMedication = (index) => {
    const updatedMedications = formData.medicalInfo.medications.filter(
      (_, i) => i !== index
    );
    handleMedicalInfoChange('medications', updatedMedications);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
        // _setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowValidationSummary(true);
      setValidationSuccess('');
      return;
    }

    // Clear any previous validation messages
    setShowValidationSummary(false);
    setValidationSuccess('Formulier is geldig - bezig met opslaan...');

    // Check guardian requirement for minors
    if (formData.type === 'human' && formData.birthDate) {
      const age = calculateAge(formData.birthDate);
      if (age < 18 && !formData.guardianName) {
        // Show error notification instead of just returning
        notify('Een voogd is verplicht voor minderjarigen onder 18 jaar', {
          type: 'error',
        });
        setErrors((prev) => ({
          ...prev,
          guardianName: 'Voogd is verplicht voor minderjarigen',
        }));
        setShowValidationSummary(true);
        return;
      }
    }

    // Note: Pet residents (type cat/dog) don't need separate owner validation in this form

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let newResident;
      if (initialData) {
        // Bewerk-modus: behoud id, vNumber, photo, etc.
        const updatedData = {
          ...initialData,
          ...formData,
          // Guardian information
          guardianId: formData.guardianId || initialData.guardianId,
          guardianName: formData.guardianName || initialData.guardianName,
          guardianRelationship:
            formData.guardianRelationship || initialData.guardianRelationship,
          guardianPhone: formData.guardianPhone || initialData.guardianPhone,
          guardianBirthDate:
            formData.guardianBirthDate || initialData.guardianBirthDate,
        };

        // Update correct number field based on locationType
        if (locationType === 'CNO') {
          updatedData.vNumber = formData.nummerWaarde;
          updatedData.bsnNumber = null;
          updatedData.bsnStatus = null;
        } else {
          updatedData.bsnNumber = formData.nummerWaarde;
          updatedData.bsnStatus = formData.bsnStatus;
          updatedData.vNumber = null;
        }

        newResident = updatedData;
      } else {
        // Toevoegen-modus
        // Generate photo using PhotoService instead of hardcoded arrays
        const generatedPhoto =
          formData.photo ||
          PhotoService.generatePhoto({
            name: formData.name,
            gender: formData.gender,
            birthDate: formData.birthDate,
          });
        // Debug: Photo generation successful

        // Map nummer fields correctly
        const residentData = {
          id: Date.now(),
          ...formData,
          locationType: locationType,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 20,
          photo: generatedPhoto,
          // Guardian information
          guardianId: formData.guardianId || null,
          guardianName: formData.guardianName || null,
          guardianRelationship: formData.guardianRelationship || null,
          guardianPhone: formData.guardianPhone || null,
          guardianBirthDate: formData.guardianBirthDate || null,
        };

        // Add correct number field based on locationType
        if (locationType === 'CNO') {
          residentData.vNumber =
            formData.nummerWaarde ||
            `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
          residentData.bsnNumber = null;
          residentData.bsnStatus = null;
        } else {
          residentData.bsnNumber = formData.nummerWaarde || null;
          residentData.bsnStatus = formData.bsnStatus || 'toegekend';
          residentData.vNumber = null;
        }

        newResident = residentData;
      }

      onSave(newResident);

      // Log audit trail
      if (user && !initialData) {
        auditHelpers.logResidentCreated(user, newResident);
      }

      // Reset form change detection after successful save
      resetOriginalData(formData);

      // Trigger success animation and close after animation completes
      triggerSuccessAnimation(initialData ? 'update' : 'save');

      // Wait for success animation (2000ms) then close smoothly
      setTimeout(() => {
        modalClose.cancel();
      }, 2200);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding resident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler functions for new components
  const handleQuickGuardianChange = (updates) => {
    setQuickGuardianData((prev) => ({ ...prev, ...updates }));
  };

  const handleQuickGuardianSubmit = () => {
    // Validate guardian data
    if (!quickGuardianData.name || !quickGuardianData.birthDate) {
      notify('Vul alle verplichte velden in', { type: 'error' });
      return;
    }

    // Create guardian in formData
    const guardianId = Date.now().toString();
    setFormData((prev) => ({
      ...prev,
      guardianId: guardianId,
      guardianName: quickGuardianData.name,
      guardianRelationship: quickGuardianData.relationship,
      guardianPhone: quickGuardianData.phone,
      guardianBirthDate: quickGuardianData.birthDate,
    }));

    // Reset guardian form
    setQuickGuardianData({
      name: '',
      relationship: 'parent',
      birthDate: '',
      phone: '',
    });

    setShowQuickGuardian(false);
    setGuardianWarning(null);
  };

  const handleGuardianLink = (adult) => {
    // Link this adult as guardian
    setFormData((prev) => ({
      ...prev,
      guardianId: adult.id,
      guardianName: adult.name,
    }));
    setShowGuardianSearch(false);
    setGuardianWarning(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={modalClose.dismiss}
      title={initialData ? 'Bewoner wijzigen' : 'Nieuwe Bewoner Toevoegen'}
      size='xl'
      showCloseButton={true}
      className={showSuccessAnimation ? 'success-pulse' : ''}
    >
      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccessAnimation}
        type={animationType}
        size='large'
        onComplete={() => setShowSuccessAnimation(false)}
      />

      <form onSubmit={handleSubmit} className='p-6'>
        {/* Validation Summary */}
        {showValidationSummary && Object.keys(errors).length > 0 && (
          <ValidationSummary
            errors={errors}
            onClose={() => setShowValidationSummary(false)}
          />
        )}

        {/* Success Message */}
        {validationSuccess && (
          <ValidationSuccess
            message={validationSuccess}
            onClose={() => setValidationSuccess('')}
          />
        )}

        {/* Type Selector - Moved to top */}
        <div className='mb-6'>
          <label
            htmlFor='residentType'
            className='block text-sm font-medium text-gray-700 mb-3'
          >
            Type bewoner *
          </label>
          {initialData ? (
            // Read-only display when editing
            <div className='p-4 bg-gray-50 border border-gray-300 rounded-lg'>
              <div className='flex items-center gap-3'>
                {formData.type === 'human' && (
                  <User className='w-6 h-6 text-blue-600' />
                )}
                {formData.type === 'cat' && (
                  <Cat className='w-6 h-6 text-purple-600' />
                )}
                {formData.type === 'dog' && (
                  <Dog className='w-6 h-6 text-orange-600' />
                )}
                <span className='text-sm font-medium text-gray-700'>
                  {formData.type === 'human'
                    ? 'Mens'
                    : formData.type === 'cat'
                      ? 'Kat'
                      : 'Hond'}
                </span>
                <span className='text-xs text-gray-500 ml-auto'>
                  Type kan niet worden gewijzigd
                </span>
              </div>
            </div>
          ) : (
            // Interactive selector when adding new
            <div className='grid grid-cols-3 gap-3'>
              <button
                type='button'
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: 'human',
                    status: 'In procedure',
                    statusColor: 'yellow',
                    labels: prev.labels.filter(
                      (l) => l !== 'l10' && l !== 'l11'
                    ),
                  }));
                  setErrors({});
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'human'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <User className='w-8 h-8 mb-2' />
                <span className='text-sm font-medium'>Mens</span>
              </button>

              <button
                type='button'
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: 'cat',
                    status: 'Geregistreerd',
                    statusColor: 'green',
                    labels: [
                      ...prev.labels.filter(
                        (l) => l !== 'l10' && l !== 'l11' && l !== 'l16'
                      ),
                      'l10',
                      'l16',
                    ], // Cat + Incomplete profile
                  }));
                  setErrors({});
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'cat'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Cat className='w-8 h-8 mb-2' />
                <span className='text-sm font-medium'>Kat</span>
              </button>

              <button
                type='button'
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    type: 'dog',
                    status: 'Geregistreerd',
                    statusColor: 'green',
                    labels: [
                      ...prev.labels.filter(
                        (l) => l !== 'l10' && l !== 'l11' && l !== 'l16'
                      ),
                      'l11',
                      'l16',
                    ], // Dog + Incomplete profile
                  }));
                  setErrors({});
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'dog'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Dog className='w-8 h-8 mb-2' />
                <span className='text-sm font-medium'>Hond</span>
              </button>
            </div>
          )}
        </div>

        {/* Locatie type info - Moved below type selector */}
        <div className='mb-4'>
          <span className='text-xs text-gray-500'>
            Locatie type:{' '}
            <b>{locationType === 'CNO' ? 'CNO' : 'Oekraïense opvang'}</b>
          </span>
        </div>
        {/* Nummer veld */}
        {locationType === 'CNO' && (
          <div className='mb-4'>
            <FormField
              label='V-nummer'
              required
              error={errors.nummerWaarde}
              hint='Voer het V-nummer in zoals vermeld op de documenten'
            >
              <input
                type='text'
                id='vnummer'
                name='nummerWaarde'
                value={formData.nummerWaarde}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nummerWaarde: e.target.value,
                  }))
                }
                placeholder='Bijv. V-2024-001'
              />
            </FormField>
          </div>
        )}
        {locationType === 'OEKRAINE' && (
          <div className='mb-4'>
            <FormField
              label='BSN'
              required={!bsnRequested}
              error={errors.nummerWaarde}
              hint={
                bsnRequested
                  ? 'BSN is aangevraagd - veld is uitgeschakeld'
                  : 'Voer het BSN in of vink aan dat het is aangevraagd'
              }
            >
              <div className='flex gap-2 items-center'>
                <input
                  type='text'
                  id='bsn'
                  name='nummerWaarde'
                  value={bsnRequested ? '' : formData.nummerWaarde}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nummerWaarde: e.target.value,
                    }))
                  }
                  placeholder='BSN-nummer'
                  disabled={bsnRequested}
                />
                <label
                  htmlFor='bsnRequested'
                  className='flex items-center gap-1 text-xs whitespace-nowrap'
                >
                  <input
                    type='checkbox'
                    id='bsnRequested'
                    checked={bsnRequested}
                    onChange={(e) => {
                      setBsnRequested(e.target.checked);
                      setFormData((prev) => ({
                        ...prev,
                        bsnStatus: e.target.checked
                          ? 'aangevraagd'
                          : 'toegekend',
                        nummerWaarde: e.target.checked ? '' : prev.nummerWaarde,
                      }));
                    }}
                  />
                  BSN is aangevraagd
                </label>
              </div>
            </FormField>
          </div>
        )}
        {/* Personal Information */}
        <PersonalInfoSection
          formData={formData}
          onInputChange={handleInputChange}
          onPhotoUpload={handlePhotoChange}
          guardianWarning={guardianWarning}
          onQuickGuardianClick={() => setShowQuickGuardian(true)}
          onGuardianSearchClick={() => setShowGuardianSearch(true)}
        />

        {/* Guardian Management */}
        <GuardianSection
          showQuickGuardian={showQuickGuardian}
          showGuardianSearch={showGuardianSearch}
          quickGuardianData={quickGuardianData}
          onQuickGuardianChange={handleQuickGuardianChange}
          onQuickGuardianSubmit={handleQuickGuardianSubmit}
          onQuickGuardianClose={() => setShowQuickGuardian(false)}
          onGuardianSearchClose={() => setShowGuardianSearch(false)}
          onGuardianLink={handleGuardianLink}
          existingResidents={existingResidents}
          formData={formData}
        />

        {/* Contact Information */}
        <ContactInfoSection
          formData={formData}
          onInputChange={handleInputChange}
          caseworkers={caseworkers}
        />

        {/* Status & Priority */}
        <StatusSection
          formData={formData}
          onInputChange={handleInputChange}
          locationType={locationType}
          bsnRequested={bsnRequested}
          onBsnRequestToggle={() => setBsnRequested(!bsnRequested)}
        />

        {/* Pet-specific form fields - Only shown for pets */}
        {formData.type !== 'human' && (
          <div className='space-y-4'>
            <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
              {formData.type === 'cat' ? (
                <Cat className='w-4 h-4' />
              ) : (
                <Dog className='w-4 h-4' />
              )}
              {formData.type === 'cat' ? 'Kat Informatie' : 'Hond Informatie'}
            </h4>

            <div>
              <label
                htmlFor='petName'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Naam *
              </label>
              <input
                type='text'
                id='petName'
                name='name'
                value={formData.name || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Naam van het huisdier'
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='breed'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Ras *
              </label>
              <select
                id='breed'
                name='breed'
                value={formData.breed || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.breed ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value=''>Selecteer ras</option>
                {(formData.type === 'cat' ? catBreeds : dogBreeds).map(
                  (breed) => (
                    <option key={breed} value={breed}>
                      {breed}
                    </option>
                  )
                )}
              </select>
              {errors.breed && (
                <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  {errors.breed}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='room'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Kamer *
              </label>
              <input
                type='text'
                id='room'
                name='room'
                value={formData.room || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.room ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Bijv. A-101'
              />
              {errors.room && (
                <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                  <AlertTriangle className='w-3 h-3' />
                  {errors.room}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact & Dates */}
        <div className='space-y-4'>
          <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
            <Phone className='w-4 h-4' />
            Contact & Datums
          </h4>

          {/* Phone and Email - Only for humans */}
          {formData.type === 'human' && (
            <>
              <div>
                <label
                  htmlFor='phone'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Telefoon *
                </label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='+31 6 12345678'
                />
                {errors.phone && (
                  <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='email@example.com'
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                    <AlertTriangle className='w-3 h-3' />
                    {errors.email}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label
              htmlFor='birthDate'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Geboortedatum {formData.type === 'human' ? '*' : '(optioneel)'}
            </label>
            <input
              type='date'
              id='birthDate'
              name='birthDate'
              value={formData.birthDate || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.birthDate && (
              <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3' />
                {errors.birthDate}
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
                        {formData.name || 'Deze bewoner'} is{' '}
                        {guardianWarning.age} jaar oud en heeft een volwassen
                        begeleider (18+) nodig.
                      </p>
                      <div className='mt-2 flex gap-2'>
                        <button
                          type='button'
                          onClick={() => {
                            // We'll implement this - opens a quick guardian form
                            setShowQuickGuardian(true);
                          }}
                          className='text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors flex items-center gap-1'
                        >
                          <UserPlus className='w-3 h-3' />
                          Snel begeleider toevoegen
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            // We'll implement this - searches for existing potential guardians
                            setShowGuardianSearch(true);
                          }}
                          className='text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1'
                        >
                          <Search className='w-3 h-3' />
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
              htmlFor='gender'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Geslacht
            </label>
            <select
              id='gender'
              name='gender'
              value={formData.gender || 'M'}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='M'>Man</option>
              <option value='F'>Vrouw</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='arrivalDate'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Aankomstdatum
            </label>
            <input
              type='date'
              id='arrivalDate'
              name='arrivalDate'
              value={formData.arrivalDate || ''}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='language'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Taal
            </label>
            <input
              type='text'
              id='language'
              name='language'
              value={formData.language || ''}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Moedertaal'
            />
          </div>

          <div>
            <label
              htmlFor='caseworker'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Begeleider *
            </label>
            <select
              id='caseworker'
              name='caseworker'
              value={formData.caseworker || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.caseworker ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value=''>Selecteer begeleider</option>
              {caseworkers.map((worker) => (
                <option key={worker} value={worker}>
                  {worker}
                </option>
              ))}
            </select>
            {errors.caseworker && (
              <p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
                <AlertTriangle className='w-3 h-3' />
                {errors.caseworker}
              </p>
            )}
          </div>
        </div>

        {/* Ooievaarspas Information - Only for humans */}
        {formData.type === 'human' && (
          <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h4 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
              <Shield className='w-4 h-4' />
              Ooievaarspas
            </h4>

            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='hasOoievaarspas'
                  checked={formData.hasOoievaarspas}
                  onChange={(e) => {
                    const hasPass = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      hasOoievaarspas: hasPass,
                      // Clear fields if unchecked
                      ooievaarspasnummer: hasPass
                        ? prev.ooievaarspasnummer
                        : '',
                      ooievaarspasExpiry: hasPass
                        ? prev.ooievaarspasExpiry
                        : '',
                    }));

                    // Auto-assign or remove label
                    if (hasPass) {
                      setFormData((prev) => ({
                        ...prev,
                        labels: [
                          ...prev.labels.filter((l) => l !== 'l17'),
                          'l17',
                        ],
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        labels: prev.labels.filter((l) => l !== 'l17'),
                      }));
                    }
                  }}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='hasOoievaarspas'
                  className='text-sm font-medium text-gray-700 cursor-pointer'
                >
                  Bewoner heeft een Ooievaarspas
                </label>
              </div>

              {formData.hasOoievaarspas && (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-7'>
                  <div>
                    <label
                      htmlFor='ooievaarspasnummer'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Pasnummer
                    </label>
                    <input
                      type='text'
                      id='ooievaarspasnummer'
                      value={formData.ooievaarspasnummer}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ooievaarspasnummer: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='0000 0000 0000'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='ooievaarspasExpiry'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Verloopdatum
                    </label>
                    <input
                      type='date'
                      id='ooievaarspasExpiry'
                      value={formData.ooievaarspasExpiry}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ooievaarspasExpiry: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className='text-xs text-gray-600 mt-3'>
              De Ooievaarspas is een kortingspas voor inwoners van Den Haag met
              een laag inkomen.
            </p>
          </div>
        )}

        {/* Work Status Information - Only for humans */}
        {formData.type === 'human' && (
          <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <h4 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
              <Briefcase className='w-4 h-4' />
              Werk & Inkomen Status
            </h4>

            <div className='space-y-4'>
              {/* Work status checkboxes */}
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='workZZP'
                    checked={formData.workStatus.includes('zzp')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...formData.workStatus, 'zzp']
                        : formData.workStatus.filter((s) => s !== 'zzp');
                      setFormData((prev) => ({
                        ...prev,
                        workStatus: newStatus,
                      }));

                      // Auto-assign/remove label
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l18'),
                            'l18',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l18'),
                          zzpDetails: '',
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                  />
                  <label
                    htmlFor='workZZP'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    ZZP'er (Zelfstandige)
                  </label>
                </div>

                {formData.workStatus.includes('zzp') && (
                  <div className='ml-7'>
                    <input
                      type='text'
                      id='zzpDetails'
                      value={formData.zzpDetails}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          zzpDetails: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
                      placeholder='Type werkzaamheden (bijv. ICT, Bouw, Zorg)'
                    />
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='workLoondienst'
                    checked={formData.workStatus.includes('loondienst')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...formData.workStatus, 'loondienst']
                        : formData.workStatus.filter((s) => s !== 'loondienst');
                      setFormData((prev) => ({
                        ...prev,
                        workStatus: newStatus,
                      }));

                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l19'),
                            'l19',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l19'),
                          employerName: '',
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                  />
                  <label
                    htmlFor='workLoondienst'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    In loondienst
                  </label>
                </div>

                {formData.workStatus.includes('loondienst') && (
                  <div className='ml-7'>
                    <input
                      type='text'
                      id='employerName'
                      value={formData.employerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          employerName: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
                      placeholder='Naam werkgever'
                    />
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='workLeefgeld'
                    checked={formData.workStatus.includes('leefgeld')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...formData.workStatus, 'leefgeld']
                        : formData.workStatus.filter((s) => s !== 'leefgeld');
                      setFormData((prev) => ({
                        ...prev,
                        workStatus: newStatus,
                      }));

                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l20'),
                            'l20',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l20'),
                          leefgeldAmount: '',
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-orange-600 focus:ring-orange-500'
                  />
                  <label
                    htmlFor='workLeefgeld'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    Ontvangt leefgeld
                  </label>
                </div>

                {formData.workStatus.includes('leefgeld') && (
                  <div className='ml-7'>
                    <input
                      type='text'
                      id='leefgeldAmount'
                      value={formData.leefgeldAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          leefgeldAmount: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm'
                      placeholder='Bedrag per week (bijv. €60)'
                    />
                  </div>
                )}

                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='workJumbo'
                    checked={formData.workStatus.includes('jumbo')}
                    onChange={(e) => {
                      const newStatus = e.target.checked
                        ? [...formData.workStatus, 'jumbo']
                        : formData.workStatus.filter((s) => s !== 'jumbo');
                      setFormData((prev) => ({
                        ...prev,
                        workStatus: newStatus,
                      }));

                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l21'),
                            'l21',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l21'),
                          jumboCardNumber: '',
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-yellow-600 focus:ring-yellow-500'
                  />
                  <label
                    htmlFor='workJumbo'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    Jumbo boodschappenkaart
                  </label>
                </div>

                {formData.workStatus.includes('jumbo') && (
                  <div className='ml-7'>
                    <input
                      type='text'
                      id='jumboCardNumber'
                      value={formData.jumboCardNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          jumboCardNumber: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm'
                      placeholder='Kaartnummer (optioneel)'
                    />
                  </div>
                )}
              </div>
            </div>

            <p className='text-xs text-gray-600 mt-3'>
              Selecteer alle van toepassing zijnde opties. Deze informatie helpt
              bij het bepalen van de juiste ondersteuning.
            </p>
          </div>
        )}

        {/* Pet Health Information - Only for cats and dogs */}
        {['cat', 'dog'].includes(formData.type) && (
          <div className='mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg'>
            <h4 className='font-semibold text-gray-800 flex items-center gap-2 mb-4'>
              <Heart className='w-4 h-4' />
              Gezondheid & Verzorging
            </h4>

            <div className='space-y-4'>
              <div className='space-y-3'>
                {/* Chip status */}
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='isChipped'
                    checked={formData.isChipped}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        isChipped: e.target.checked,
                      }));
                      // Auto-assign/remove chip label
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l14'),
                            'l14',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l14'),
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                  />
                  <label
                    htmlFor='isChipped'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    Gechipt
                  </label>
                </div>

                {/* Vaccination status */}
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='isVaccinated'
                    checked={formData.isVaccinated}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        isVaccinated: e.target.checked,
                      }));
                      // Auto-assign/remove vaccination label
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l12'),
                            'l12',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels
                            .filter((l) => l !== 'l12')
                            .filter((l) => l !== 'l13')
                            .concat('l13'),
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                  />
                  <label
                    htmlFor='isVaccinated'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    Volledig ingeënt
                  </label>
                </div>

                {!formData.isVaccinated && (
                  <div className='ml-7'>
                    <label
                      htmlFor='nextVaccinationDate'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Volgende vaccinatie datum
                    </label>
                    <input
                      type='date'
                      id='nextVaccinationDate'
                      value={formData.nextVaccinationDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nextVaccinationDate: e.target.value,
                        }))
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm'
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                {/* Sterilization status */}
                <div className='flex items-center gap-3'>
                  <input
                    type='checkbox'
                    id='isSterilized'
                    checked={formData.isSterilized}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        isSterilized: e.target.checked,
                      }));
                      // Auto-assign/remove sterilization label
                      if (e.target.checked) {
                        setFormData((prev) => ({
                          ...prev,
                          labels: [
                            ...prev.labels.filter((l) => l !== 'l15'),
                            'l15',
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          labels: prev.labels.filter((l) => l !== 'l15'),
                        }));
                      }
                    }}
                    className='rounded border-gray-300 text-pink-600 focus:ring-pink-500'
                  />
                  <label
                    htmlFor='isSterilized'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    Gesteriliseerd/Gecastreerd
                  </label>
                </div>
              </div>

              <p className='text-xs text-gray-600 mt-3'>
                Deze informatie helpt bij het plannen van dierenartsbezoeken en
                het waarborgen van de gezondheid.
              </p>
            </div>
          </div>
        )}

        {/* Medical Information */}
        <div className='mt-6 space-y-4'>
          <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
            <Activity className='w-4 h-4' />
            Medische Informatie
          </h4>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='allergies'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Allergieën
              </label>
              <div className='space-y-2'>
                {formData.medicalInfo.allergies.map((allergy, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='flex-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm'>
                      {allergy}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeAllergy(index)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <Minus className='w-4 h-4' />
                    </button>
                  </div>
                ))}
                <div className='flex gap-2'>
                  <input
                    type='text'
                    id='newAllergy'
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder='Nieuwe allergie'
                    className='flex-1 px-3 py-1 border border-gray-300 rounded text-sm'
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addAllergy())
                    }
                  />
                  <button
                    type='button'
                    onClick={addAllergy}
                    className='px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200'
                  >
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor='medications'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Medicatie
              </label>
              <div className='space-y-2'>
                {formData.medicalInfo.medications.map((medication, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='flex-1 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm'>
                      {medication}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeMedication(index)}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      <Minus className='w-4 h-4' />
                    </button>
                  </div>
                ))}
                <div className='flex gap-2'>
                  <input
                    type='text'
                    id='newMedication'
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder='Nieuwe medicatie'
                    className='flex-1 px-3 py-1 border border-gray-300 rounded text-sm'
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addMedication())
                    }
                  />
                  <button
                    type='button'
                    onClick={addMedication}
                    className='px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200'
                  >
                    <Plus className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor='emergencyContact'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Noodcontact
            </label>
            <input
              type='text'
              id='emergencyContact'
              value={formData.medicalInfo.emergencyContact || ''}
              onChange={(e) =>
                handleMedicalInfoChange('emergencyContact', e.target.value)
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Naam en telefoonnummer'
            />
          </div>
        </div>

        {/* Pets Section */}
        <div className='mt-6 space-y-4'>
          <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
            <Heart className='w-4 h-4' />
            Huisdieren
          </h4>

          {showPetForm ? (
            <PetForm
              onSave={(pet) => {
                // Auto-assign pet labels
                const petTypeLabel = availableLabels.find((label) =>
                  label.name.toLowerCase().includes(pet.type.toLowerCase())
                );

                if (
                  petTypeLabel &&
                  formData.labels &&
                  !formData.labels.includes(petTypeLabel.id)
                ) {
                  setFormData((prev) => ({
                    ...prev,
                    labels: [...prev.labels, petTypeLabel.id],
                  }));
                }

                setShowPetForm(false);
              }}
              onCancel={() => setShowPetForm(false)}
              residentId={initialData?.id || Date.now()}
              residentName={formData.name || 'Nieuwe bewoner'}
            />
          ) : (
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
              <div className='flex items-center justify-between mb-2'>
                <p className='text-sm text-amber-700'>
                  <strong>Huisdieren:</strong> Ras is verplicht om te kiezen
                </p>
                <button
                  type='button'
                  onClick={() => setShowPetForm(true)}
                  className='bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors flex items-center gap-1'
                >
                  <Plus className='w-3 h-3' />
                  Huisdier Toevoegen
                </button>
              </div>
              <p className='text-sm text-amber-600'>
                Huisdieren worden centraal beheerd en kunnen meerdere eigenaren
                hebben. Kies uit voorgestelde rassen of typ je eigen ras.
              </p>
            </div>
          )}
        </div>

        {/* Labels Section */}
        <div className='mt-6'>
          <label
            htmlFor='labels'
            className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'
          >
            <Tag className='w-4 h-4' />
            Labels
          </label>
          <EnhancedLabelSelector
            selectedLabels={formData.labels || []}
            onLabelsChange={(labels) =>
              setFormData((prev) => ({ ...prev, labels }))
            }
            availableLabels={availableLabels}
            labelUsageCounts={labelUsageCounts}
          />
        </div>

        {/* Notes */}
        <div className='mt-6'>
          <label
            htmlFor='notes'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Notities
          </label>
          <textarea
            id='notes'
            name='notes'
            value={formData.notes || ''}
            onChange={handleInputChange}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Belangrijke informatie over de bewoner...'
          />
        </div>

        {/* Guardian Confirmation Modal */}
        {showGuardianConfirmation && guardianWarning && (
          <div className='mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0'>
                <Shield className='w-6 h-6 text-amber-600' />
              </div>
              <div className='flex-1'>
                <h4 className='text-lg font-medium text-amber-800 mb-2'>
                  Bevestiging Vereist
                </h4>
                <p className='text-sm text-amber-700 mb-3'>
                  <strong>{formData.name}</strong> is {guardianWarning.age} jaar
                  oud en heeft geen volwassen begeleider gekoppeld.
                  Minderjarigen hebben normaliter een volwassen begeleider (18+)
                  nodig voor opvang.
                </p>
                <div className='space-y-2 mb-4'>
                  <p className='text-sm font-medium text-amber-800'>
                    Wat wilt u doen?
                  </p>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <Button
                      variant='secondary'
                      onClick={() => {
                        setShowGuardianConfirmation(false);
                        // Reset form to allow user to add guardian first
                      }}
                      className='text-sm'
                    >
                      Annuleren - Eerst begeleider toevoegen
                    </Button>
                    <Button
                      variant='primary'
                      onClick={async (e) => {
                        setShowGuardianConfirmation(false);
                        // Continue with submission
                        await handleSubmit(e);
                      }}
                      className='text-sm bg-amber-600 hover:bg-amber-700'
                    >
                      Toch doorgaan zonder begeleider
                    </Button>
                  </div>
                </div>
                <p className='text-xs text-amber-600'>
                  💡 Tip: U kunt later een familierelatie toevoegen via het
                  bewonersoverzicht
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Guardian Form */}
        {showQuickGuardian && (
          <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='text-lg font-medium text-green-800 flex items-center gap-2'>
                <UserPlus className='w-5 h-5' />
                Snel Begeleider Toevoegen
              </h4>
              <button
                onClick={() => setShowQuickGuardian(false)}
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
                  htmlFor='guardianName'
                  className='block text-sm font-medium text-green-700 mb-1'
                >
                  Naam begeleider *
                </label>
                <input
                  type='text'
                  id='guardianName'
                  value={quickGuardianData.name}
                  onChange={(e) =>
                    setQuickGuardianData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='Volledige naam'
                />
              </div>
              <div>
                <label
                  htmlFor='guardianRelationship'
                  className='block text-sm font-medium text-green-700 mb-1'
                >
                  Relatie tot {formData.name}
                </label>
                <select
                  id='guardianRelationship'
                  value={quickGuardianData.relationship}
                  onChange={(e) =>
                    setQuickGuardianData((prev) => ({
                      ...prev,
                      relationship: e.target.value,
                    }))
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
                  htmlFor='guardianBirthDate'
                  className='block text-sm font-medium text-green-700 mb-1'
                >
                  Geboortedatum begeleider *
                </label>
                <input
                  type='date'
                  id='guardianBirthDate'
                  value={quickGuardianData.birthDate}
                  onChange={(e) =>
                    setQuickGuardianData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
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
                  htmlFor='guardianPhone'
                  className='block text-sm font-medium text-green-700 mb-1'
                >
                  Telefoon begeleider
                </label>
                <input
                  type='tel'
                  id='guardianPhone'
                  value={quickGuardianData.phone}
                  onChange={(e) =>
                    setQuickGuardianData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                  placeholder='+31 6 12345678'
                />
              </div>
            </div>
            <div className='mt-4 flex justify-end gap-2'>
              <Button
                variant='secondary'
                onClick={() => setShowQuickGuardian(false)}
                className='text-sm'
              >
                Annuleren
              </Button>
              <Button
                variant='primary'
                onClick={() => {
                  // Validate guardian data
                  if (!quickGuardianData.name || !quickGuardianData.birthDate) {
                    notify('Vul alle verplichte velden in', { type: 'error' });
                    return;
                  }

                  // Create guardian in formData
                  const guardianId = Date.now().toString();
                  setFormData((prev) => ({
                    ...prev,
                    guardianId: guardianId,
                    guardianName: quickGuardianData.name,
                    guardianRelationship: quickGuardianData.relationship,
                    guardianPhone: quickGuardianData.phone,
                    guardianBirthDate: quickGuardianData.birthDate,
                  }));

                  // Reset guardian form
                  setQuickGuardianData({
                    name: '',
                    relationship: 'parent',
                    birthDate: '',
                    phone: '',
                  });

                  setShowQuickGuardian(false);
                  setGuardianWarning(null);
                }}
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
                onClick={() => setShowGuardianSearch(false)}
                className='text-blue-600 hover:text-blue-800'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
            <p className='text-sm text-blue-700 mb-4'>
              Zoek naar bestaande volwassen bewoners die als begeleider kunnen
              dienen voor {formData.name}.
            </p>
            <div className='space-y-3'>
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
                        <p className='font-medium text-gray-900'>
                          {adult.name}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {calculateAge(adult.birthDate)} jaar • Kamer{' '}
                          {adult.room}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant='primary'
                      onClick={() => {
                        // Link this adult as guardian
                        setFormData((prev) => ({
                          ...prev,
                          guardianId: adult.id,
                          guardianName: adult.name,
                        }));
                        setShowGuardianSearch(false);
                        setGuardianWarning(null);
                      }}
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

        {/* Action Buttons */}
        <div className='mt-8 flex justify-end gap-3 pt-6 border-t'>
          <Button
            variant='secondary'
            onClick={modalClose.cancel}
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
    </Modal>
  );
};

export default AddResidentModal;
