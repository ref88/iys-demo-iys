import React, { useState /*, useEffect */ } from 'react';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  // User, // Unused
  Baby,
  // Calendar, // Unused
  // Phone, // Unused
  // Mail, // Unused
  // MapPin, // Unused
  Home,
  // Camera, // Unused
  Plus,
  // Minus, // Unused
  X,
  Save,
  Shield,
  Heart,
  // Star, // Unused
  // AlertTriangle, // Unused
  // Upload, // Unused
  CheckCircle,
  Cat,
  Dog,
} from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import ProfileImage from '../ui/ProfileImage.jsx';
import AutoComplete from '../ui/AutoComplete.jsx';
import RoommateLogic from '../shared/RoommateLogic.jsx';
import useModalClose from '../../hooks/useModalClose.js';
import { searchNationalities } from '../../utils/nationalities.js';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const FamilySetupWizard = ({
  isOpen,
  onClose,
  onSave,
  locationType = 'CNO',
  caseworkers = [],
  existingResidents = [],
  roomCapacities = {}, // Object with room numbers as keys and capacities as values
}) => {
  // Helper function for keyboard accessibility
  const handleKeyboardClick = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const modalClose = useModalClose(onClose);
  const { notify } = useNotifications();
  const [currentStep, setCurrentStep] = useState(0);
  const [connectionType, setConnectionType] = useState('new_family'); // 'new_family', 'join_family', 'new_roommate', 'financial_dependent', 'complex'
  const [selectedExistingResidents, setSelectedExistingResidents] = useState(
    []
  );

  // Roommate logic state
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoommates, setSelectedRoommates] = useState([]);
  const [roommateFinancialArrangement, setRoommateFinancialArrangement] =
    useState('independent');
  const [familyData, setFamilyData] = useState({
    // Family Dimension
    familyName: '',
    familyId: null,
    nationality: '', // Default/fallback nationality

    // Housing Dimension
    roomArrangement: 'new_room', // 'new_room', 'join_room', 'multiple_rooms'
    targetRoomId: null,
    roommates: [], // Non-family roommates

    // Financial Dimension
    financialArrangement: 'independent', // 'independent', 'shared', 'dependent', 'mixed'
    financialUnitId: null,

    // General
    arrivalDate: new Date().toISOString().split('T')[0],
    notes: '',
    labels: [],

    // Members
    adults: [],
    children: [],
    pets: [],

    // Legacy/Selected
    existingFamilyId: null,
    selectedResidents: [],
  });

  const [tempAdult, setTempAdult] = useState({
    name: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    email: '',
    role: 'parent',
    photo: '',
    nationality: '',
    relationshipToExisting: {}, // Family relationships
    roomPreference: 'default', // 'default', 'specific_room', 'own_room'
    financialStatus: 'default', // 'default', 'independent', 'dependent_on'
    dependentOn: null, // ID of person they're financially dependent on
  });

  const [tempChild, setTempChild] = useState({
    name: '',
    birthDate: '',
    gender: 'M',
    guardians: [],
    nationality: '',
    relationshipToExisting: {}, // Family relationships
    roomPreference: 'with_guardians', // 'with_guardians', 'specific_room', 'own_room'
    financialStatus: 'dependent', // 'dependent', 'independent'
    dependentOn: null, // ID of guardian they're financially dependent on
  });

  const [tempPet, setTempPet] = useState({
    name: '',
    type: 'cat', // 'cat' or 'dog'
    breed: '',
    isChipped: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { id: 0, title: 'Aansluiting Type', icon: Users },
    { id: 1, title: 'Familie Connecties', icon: Heart },
    { id: 2, title: 'Woon Arrangement', icon: Home },
    { id: 3, title: 'Financiële Regeling', icon: Shield },
    { id: 4, title: 'Volwassenen', icon: Users },
    { id: 5, title: 'Kinderen', icon: Baby },
    { id: 6, title: 'Huisdieren (Optioneel)', icon: Cat },
    { id: 7, title: 'Overzicht & Afronding', icon: CheckCircle },
  ];

  // Helper functions
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

  const generateFamilyId = () => `fam_${Date.now()}`;

  // Pet breed lists (simplified from PetForm.jsx)
  const dogBreeds = [
    'Chihuahua',
    'Franse Bulldog',
    'Yorkshire Terrier',
    'Shih Tzu',
    'Mopshond (Pug)',
    'Golden Retriever',
    'Labrador Retriever',
    'Duitse Herder',
    'Beagle',
    'Boxer',
    'Border Collie',
    'Husky',
    'Kruising/Mix',
  ];

  const catBreeds = [
    'Britse Korthaar',
    'Perzische Kat',
    'Maine Coon',
    'Ragdoll',
    'Siamese',
    'Scottish Fold',
    'Bengaal',
    'Russisch Blauw',
    'Noorse Boskat',
    'Kruising/Mix',
  ];

  const searchExistingResidents = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const filtered = existingResidents
      .filter((resident) => {
        const searchTerm = query.toLowerCase();
        return (
          resident.name?.toLowerCase().includes(searchTerm) ||
          resident.firstName?.toLowerCase().includes(searchTerm) ||
          resident.lastName?.toLowerCase().includes(searchTerm) ||
          resident.nationality?.toLowerCase().includes(searchTerm) ||
          resident.room?.toLowerCase().includes(searchTerm) ||
          resident.roomNumber?.toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, 10); // Limit to 10 results

    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  };

  const selectExistingResident = (resident) => {
    // Check if resident is already selected
    if (selectedExistingResidents.some((r) => r.id === resident.id)) {
      return; // Don't add duplicates
    }

    const updatedResidents = [...selectedExistingResidents, resident];
    setSelectedExistingResidents(updatedResidents);
    setSearchQuery('');
    setShowResults(false);

    // Use the first selected resident's info for family data
    if (selectedExistingResidents.length === 0) {
      setFamilyData((prev) => ({
        ...prev,
        existingFamilyId: resident.familyId,
        familyName: resident.familyId
          ? resident.name.split(' ').pop()
          : resident.name.split(' ').pop(),
        nationality: resident.nationality,
        room: resident.room || resident.roomNumber,
        arrivalDate:
          resident.arrivalDate || new Date().toISOString().split('T')[0],
        selectedResidents: updatedResidents,
      }));
    } else {
      setFamilyData((prev) => ({
        ...prev,
        selectedResidents: updatedResidents,
      }));
    }

    // Clear error when a resident is selected
    if (errors.existingResident) {
      setErrors((prev) => ({ ...prev, existingResident: undefined }));
    }

    // Update family data based on connection type
    if (connectionType === 'join_family') {
      // Check if any selected resident is a minor and show warning
      const hasMinor = updatedResidents.some(
        (r) => calculateAge(r.birthDate) < 18
      );
      const hasAdult = updatedResidents.some(
        (r) => calculateAge(r.birthDate) >= 18
      );

      if (hasMinor && !hasAdult) {
        setErrors((prev) => ({
          ...prev,
          minorWarning: `Let op: Je sluit aan bij minderjarige(n). Zorg ervoor dat er een volwassen voogd in het gezin komt.`,
        }));
      } else {
        // Clear minor warning if adult is selected
        setErrors((prev) => ({ ...prev, minorWarning: undefined }));
      }
    }
  };

  const removeExistingResident = (residentId) => {
    const updatedResidents = selectedExistingResidents.filter(
      (r) => r.id !== residentId
    );
    setSelectedExistingResidents(updatedResidents);

    // Update family data
    if (updatedResidents.length === 0) {
      // Reset family data if no residents selected
      setFamilyData((prev) => ({
        ...prev,
        existingFamilyId: null,
        familyName: '',
        nationality: '',
        room: '',
        arrivalDate: new Date().toISOString().split('T')[0],
        selectedResidents: [],
      }));
    } else {
      // Use the first remaining resident's info
      const firstResident = updatedResidents[0];
      setFamilyData((prev) => ({
        ...prev,
        existingFamilyId: firstResident.familyId,
        familyName: firstResident.familyId
          ? firstResident.name.split(' ').pop()
          : firstResident.name.split(' ').pop(),
        nationality: firstResident.nationality,
        room: firstResident.room || firstResident.roomNumber,
        arrivalDate:
          firstResident.arrivalDate || new Date().toISOString().split('T')[0],
        selectedResidents: updatedResidents,
      }));
    }

    // Update warnings
    const hasMinor = updatedResidents.some(
      (r) => calculateAge(r.birthDate) < 18
    );
    const hasAdult = updatedResidents.some(
      (r) => calculateAge(r.birthDate) >= 18
    );

    if (hasMinor && !hasAdult) {
      setErrors((prev) => ({
        ...prev,
        minorWarning: `Let op: Je sluit aan bij minderjarige(n). Zorg ervoor dat er een volwassen voogd in het gezin komt.`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, minorWarning: undefined }));
    }
  };

  const getRandomPhoto = (gender, _age) => {
    const photos = {
      male: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      ],
      female: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      ],
    };

    const genderPhotos = photos[gender] || photos.male;
    const randomIndex = Math.floor(Math.random() * genderPhotos.length);
    return genderPhotos[randomIndex];
  };

  // Validation functions
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0: // Connection Type
        if (
          ['join_family', 'new_roommate', 'financial_dependent'].includes(
            connectionType
          ) &&
          selectedExistingResidents.length === 0
        ) {
          newErrors.existingResident =
            'Selecteer minimaal één bestaande bewoner om aan te sluiten';
        }
        break;

      case 1: // Family Connections
        if (['new_family', 'join_family'].includes(connectionType)) {
          if (!familyData.familyName.trim()) {
            newErrors.familyName = 'Familie naam is verplicht';
          }
          if (!familyData.nationality.trim()) {
            newErrors.nationality = 'Basis nationaliteit is verplicht';
          }
        }
        break;

      case 2: // Room Arrangement
        if (
          familyData.roomArrangement === 'join_room' &&
          !familyData.targetRoomId
        ) {
          newErrors.targetRoom = 'Selecteer een kamer om aan te sluiten';
        }
        break;

      case 3: {
        // Financial Arrangement
        if (
          familyData.financialArrangement === 'dependent' &&
          !familyData.financialUnitId
        ) {
          newErrors.financialUnit =
            'Selecteer van wie men financiël afhankelijk is';
        }
        break;
      }

      case 4: {
        // Adults
        // Skip adult requirement if joining existing adults or being roommate only
        const isJoiningAdult =
          ['join_family', 'new_roommate'].includes(connectionType) &&
          selectedExistingResidents.length > 0 &&
          selectedExistingResidents.some(
            (r) => calculateAge(r.birthDate) >= 18
          );
        if (!isJoiningAdult && familyData.adults.length === 0) {
          newErrors.adults = 'Minimaal één volwassene is verplicht';
        }
        break;
      }

      case 7: // Final Overview
        // Validate complete setup
        if (
          familyData.roomArrangement === 'new_room' &&
          !familyData.targetRoomId
        ) {
          newErrors.room = 'Kamer toewijzing is verplicht';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step handlers
  const nextStep = () => {
    if (validateStep(currentStep)) {
      let nextStepIndex = currentStep + 1;

      // Skip Step 1 (Family Connections) for non-family connection types
      if (
        nextStepIndex === 1 &&
        !['new_family', 'join_family'].includes(connectionType)
      ) {
        nextStepIndex = 2; // Skip to Room Arrangement
      }

      setCurrentStep(Math.min(nextStepIndex, steps.length - 1));

      // Success notification for step completion
      if (nextStepIndex < steps.length) {
        notify(`Stap ${currentStep + 1} voltooid`, {
          type: 'success',
        });
      }
    } else {
      // Validation failed notification
      notify('Controleer de verplichte velden voordat u verder gaat', {
        type: 'warning',
      });
    }
  };

  const prevStep = () => {
    let prevStepIndex = currentStep - 1;

    // Skip Step 1 (Family Connections) for non-family connection types when going back
    if (
      prevStepIndex === 1 &&
      !['new_family', 'join_family'].includes(connectionType)
    ) {
      prevStepIndex = 0; // Skip back to Connection Type
    }

    setCurrentStep(Math.max(prevStepIndex, 0));
  };

  const addAdult = () => {
    const newErrors = {};

    if (!tempAdult.name.trim()) {
      newErrors.adultName = 'Naam is verplicht';
    }

    if (!tempAdult.birthDate) {
      newErrors.adultBirthDate = 'Geboortedatum is verplicht';
    } else {
      const age = calculateAge(tempAdult.birthDate);
      const today = new Date();
      const birthDate = new Date(tempAdult.birthDate);

      if (birthDate > today) {
        newErrors.adultBirthDate =
          'Geboortedatum kan niet in de toekomst liggen';
      } else if (age < 18) {
        newErrors.adultBirthDate = 'Begeleider moet minimaal 18 jaar oud zijn';
      } else if (age > 120) {
        newErrors.adultBirthDate = 'Ongeldige leeftijd';
      }
    }

    // Check nationality
    if (!tempAdult.nationality.trim()) {
      newErrors.adultNationality = 'Nationaliteit is verplicht';
    }

    // Check contact info - at least one required
    const hasPhone = tempAdult.phone.trim().length > 0;
    const hasEmail = tempAdult.email.trim().length > 0;

    if (!hasPhone && !hasEmail) {
      newErrors.contact =
        'Minimaal één contactmethode (telefoon of email) is verplicht';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const age = calculateAge(tempAdult.birthDate);
    const newAdult = {
      ...tempAdult,
      id: Date.now(),
      age,
      photo: tempAdult.photo || getRandomPhoto(tempAdult.gender, age),
      nationality: tempAdult.nationality,
      relationshipToExisting: tempAdult.relationshipToExisting,
    };

    setFamilyData((prev) => ({
      ...prev,
      adults: [...prev.adults, newAdult],
    }));

    // Success notification
    notify(`Volwassene ${newAdult.name} toegevoegd aan familie`, {
      type: 'success',
    });

    setTempAdult({
      name: '',
      birthDate: '',
      gender: 'M',
      phone: '',
      email: '',
      role: 'parent',
      photo: '',
      nationality: '',
      relationshipToExisting: {},
    });
    setErrors({});
  };

  const removeAdult = (id) => {
    setFamilyData((prev) => ({
      ...prev,
      adults: prev.adults.filter((a) => a.id !== id),
    }));
  };

  const addChild = () => {
    const newErrors = {};

    if (!tempChild.name.trim()) {
      newErrors.childName = 'Naam is verplicht';
    }

    if (!tempChild.birthDate) {
      newErrors.childBirthDate = 'Geboortedatum is verplicht';
    } else {
      const age = calculateAge(tempChild.birthDate);
      const today = new Date();
      const birthDate = new Date(tempChild.birthDate);

      if (birthDate > today) {
        newErrors.childBirthDate =
          'Geboortedatum kan niet in de toekomst liggen';
      } else if (age >= 18) {
        newErrors.childBirthDate = 'Kinderen moeten jonger dan 18 jaar zijn';
      } else if (age < 0) {
        newErrors.childBirthDate = 'Ongeldige geboortedatum';
      }
    }

    // Check nationality
    if (!tempChild.nationality.trim()) {
      newErrors.childNationality = 'Nationaliteit is verplicht';
    }

    // Check guardian selection - only if adults exist or existing residents can be guardians
    const availableGuardians = [
      ...familyData.adults,
      ...(connectionType === 'join_family'
        ? selectedExistingResidents.filter(
            (r) => calculateAge(r.birthDate) >= 18
          )
        : []),
    ];

    if (availableGuardians.length > 0 && tempChild.guardians.length === 0) {
      newErrors.guardians = 'Selecteer minimaal één voogd voor dit kind';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const age = calculateAge(tempChild.birthDate);
    const newChild = {
      ...tempChild,
      id: Date.now(),
      age,
      photo: getRandomPhoto(tempChild.gender, age),
      guardians: [...tempChild.guardians], // Use selected guardians
      nationality: tempChild.nationality,
      relationshipToExisting: tempChild.relationshipToExisting,
    };

    setFamilyData((prev) => ({
      ...prev,
      children: [...prev.children, newChild],
    }));

    // Success notification
    notify(`Kind ${newChild.name} toegevoegd aan familie`, {
      type: 'success',
    });

    setTempChild({
      name: '',
      birthDate: '',
      gender: 'M',
      guardians: [],
      nationality: '',
      relationshipToExisting: {},
    });
    setErrors({});
  };

  const removeChild = (id) => {
    setFamilyData((prev) => ({
      ...prev,
      children: prev.children.filter((c) => c.id !== id),
    }));
  };

  const addPet = () => {
    if (!tempPet.name.trim()) {
      setErrors({ petName: 'Naam is verplicht' });
      return;
    }

    const newPet = {
      ...tempPet,
      id: Date.now(),
      familyId: null, // Will be set when family is saved
    };

    setFamilyData((prev) => ({
      ...prev,
      pets: [...prev.pets, newPet],
    }));

    // Success notification
    notify(
      `${newPet.type === 'cat' ? 'Kat' : 'Hond'} ${newPet.name} toegevoegd aan familie`,
      {
        type: 'success',
      }
    );

    setTempPet({
      name: '',
      type: 'cat',
      breed: '',
      isChipped: false,
    });
    setErrors({});
  };

  const removePet = (id) => {
    setFamilyData((prev) => ({
      ...prev,
      pets: prev.pets.filter((p) => p.id !== id),
    }));
  };

  // Roommate logic handlers
  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    setFamilyData((prev) => ({ ...prev, targetRoomId: roomId }));
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
    setFamilyData((prev) => ({ ...prev, financialArrangement: arrangement }));
  };

  // Validate room capacity and financial dependencies
  const validateRoomAndFinancialConstraints = () => {
    const errors = {};

    // Room capacity validation
    if (familyData.roomArrangement === 'join_room' && familyData.targetRoomId) {
      const targetRoom = existingResidents.find(
        (r) => r.room === familyData.targetRoomId
      );
      if (targetRoom) {
        const currentOccupants = existingResidents.filter(
          (r) => r.room === familyData.targetRoomId
        ).length;
        const newOccupants =
          familyData.adults.length + familyData.children.length;
        const totalOccupants = currentOccupants + newOccupants;

        // Get room capacity from roomCapacities prop, default to 3 if not specified
        const roomCapacity = roomCapacities[familyData.targetRoomId] || 3;
        if (totalOccupants > roomCapacity) {
          errors.roomCapacity = `Kamer ${familyData.targetRoomId} heeft een capaciteit van ${roomCapacity} personen. Huidige bewoners: ${currentOccupants}, nieuwe bewoners: ${newOccupants}. Totaal zou ${totalOccupants} zijn.`;
        }
      }
    }

    // Financial dependency validation
    if (
      familyData.financialArrangement === 'dependent' &&
      familyData.financialUnitId
    ) {
      // Check if trying to be dependent on someone who doesn't exist yet
      const dependentOnId = familyData.financialUnitId;
      const isExistingResident = selectedExistingResidents.some(
        (r) => r.id === dependentOnId
      );
      const isNewAdult = familyData.adults.some(
        (adult, index) => `adult-${index}` === dependentOnId
      );

      if (!isExistingResident && !isNewAdult) {
        errors.financialDependency =
          'De persoon waar bewoner financieel afhankelijk van is moet bestaan.';
      }

      // Check for circular dependencies (simplified)
      if (isNewAdult) {
        const adultIndex = parseInt(dependentOnId.split('-')[1]);
        const targetAdult = familyData.adults[adultIndex];
        if (targetAdult?.financialStatus === 'dependent') {
          errors.circularDependency =
            'Circulaire financiële afhankelijkheid gedetecteerd. Persoon kan niet afhankelijk zijn van iemand die ook afhankelijk is.';
        }
      }
    }

    // Check if adults being added have valid financial dependencies
    familyData.adults.forEach((adult, index) => {
      if (adult.financialStatus === 'dependent' && adult.dependentOn) {
        const dependentOnId = adult.dependentOn;
        const isExistingResident = selectedExistingResidents.some(
          (r) => r.id === dependentOnId
        );
        const isOtherAdult = familyData.adults.some(
          (otherAdult, otherIndex) =>
            otherIndex !== index && `adult-${otherIndex}` === dependentOnId
        );

        if (!isExistingResident && !isOtherAdult) {
          errors[`adult${index}Dependency`] =
            `${adult.name} kan niet financieel afhankelijk zijn van een persoon die niet bestaat.`;
        }
      }
    });

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Check if final family has at least one adult and at least one member total
  const validateFinalFamily = () => {
    // Count all members being added
    const totalMembers =
      familyData.adults.length +
      familyData.children.length +
      familyData.pets.length;
    const hasExistingMember =
      ['join_family', 'new_roommate', 'financial_dependent'].includes(
        connectionType
      ) && selectedExistingResidents.length > 0;
    const finalCount = totalMembers + (hasExistingMember ? 1 : 0);

    // Check for empty family
    if (finalCount === 0) {
      setErrors({
        emptyFamily:
          'Een gezin moet minimaal één lid hebben (persoon of huisdier)',
      });
      return false;
    }

    // Count adults being added
    const newAdults = familyData.adults.length;

    // If joining existing resident, check if they or their family has adults
    if (
      ['join_family', 'new_roommate', 'financial_dependent'].includes(
        connectionType
      ) &&
      selectedExistingResidents.length > 0
    ) {
      const hasExistingAdult = selectedExistingResidents.some(
        (r) => calculateAge(r.birthDate) >= 18
      );

      // If selected resident is adult OR we're adding adults, we're good
      if (hasExistingAdult || newAdults > 0) {
        return true;
      }

      // Check if existing family already has other adults
      const existingFamilyIds = selectedExistingResidents
        .map((r) => r.familyId)
        .filter(Boolean);
      if (existingFamilyIds.length > 0) {
        const hasAdultInFamily = existingFamilyIds.some((familyId) => {
          const familyMembers = existingResidents.filter(
            (r) => r.familyId === familyId
          );
          return familyMembers.some(
            (member) => calculateAge(member.birthDate) >= 18
          );
        });
        if (hasAdultInFamily) {
          return true;
        }
      }

      setErrors({
        familyAdult:
          'Familie moet minimaal één volwassen voogd (18+) hebben. Voeg een volwassene toe of kies een andere bewoner.',
      });
      return false;
    }

    return true; // New families already have adult validation in step 2
  };

  const handleSubmit = async () => {
    // eslint-disable-next-line no-console
    console.log('handleSubmit called');
    if (!validateStep(currentStep) || !validateFinalFamily()) {
      // eslint-disable-next-line no-console
      console.log('Validation failed');
      return;
    }
    // eslint-disable-next-line no-console
    console.log('Validation passed');

    // Validate room capacity and financial dependencies
    const constraintValidation = validateRoomAndFinancialConstraints();
    if (!constraintValidation.isValid) {
      setErrors(constraintValidation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate family ID based on connection type and 3-dimensional structure
      const familyId = generateFamilyId();

      // Create metadata object that captures the 3-dimensional structure
      const familyMetadata = {
        connectionType,

        // Family Dimension
        familyConnections: {
          familyName: familyData.familyName,
          baseFamilyId:
            connectionType === 'join_family' &&
            selectedExistingResidents.length > 0 &&
            selectedExistingResidents[0]?.familyId
              ? selectedExistingResidents[0].familyId
              : null,
          baseNationality: familyData.nationality,
          connectedResidents: selectedExistingResidents.map((r) => ({
            id: r.id,
            name: r.name,
            relationship: 'family', // This will be enhanced in individual data steps
          })),
        },

        // Housing Dimension
        housingArrangement: {
          type: familyData.roomArrangement,
          targetRoomId: familyData.targetRoomId,
          roommates: familyData.roommates || [],
          roomCapacity: familyData.roomCapacity || null,
        },

        // Financial Dimension
        financialArrangement: {
          type: familyData.financialArrangement,
          financialUnitId: familyData.financialUnitId,
          dependentOn: familyData.dependentOn || null,
          sharedWith: familyData.sharedWith || [],
        },

        // General metadata
        createdAt: new Date().toISOString(),
        arrivalDate: familyData.arrivalDate,
        labels: familyData.labels || [],
        notes: familyData.notes || '',
      };

      const allMembers = [];

      // Create adults with 3-dimensional structure
      familyData.adults.forEach((adult) => {
        const residentData = {
          id: Date.now() + Math.random(),
          name: adult.name,
          nationality: adult.nationality || familyData.nationality,
          status: 'In procedure',
          statusColor: 'yellow',

          // Housing Dimension - determine room based on arrangement
          room:
            familyData.roomArrangement === 'join_room' &&
            familyData.targetRoomId
              ? familyData.targetRoomId
              : familyData.roomArrangement === 'new_room'
                ? `NEW_${familyId}` // Will be assigned by system
                : adult.roomPreference || `NEW_${familyId}`,

          arrivalDate: familyData.arrivalDate,
          birthDate: adult.birthDate,
          gender: adult.gender,
          phone: adult.phone,
          email: adult.email,
          language: '',
          priority: 'Normal',
          caseworker: caseworkers[0] || '',
          notes: familyData.notes,

          // Family Dimension - relationship data
          relationshipToExisting: adult.relationshipToExisting || {},
          familyId,
          familyRole: adult.role,

          // Financial Dimension - per-person financial status
          financialStatus:
            adult.financialStatus || familyData.financialArrangement,
          financialDependentOn: adult.dependentOn || familyData.financialUnitId,

          // Housing Dimension - per-person room preferences
          roomPreference: adult.roomPreference || 'default',

          // Standard resident fields
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: '',
          },
          documents: [],
          photo: adult.photo,
          nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
          nummerWaarde:
            locationType === 'CNO'
              ? `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
              : '',
          bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined,
          labels: familyData.labels || [],
          pets: [],
          locationType,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 20,

          // 3-Dimensional metadata reference
          familyMetadata: familyMetadata,
        };

        if (locationType === 'CNO') {
          residentData.vNumber = residentData.nummerWaarde;
          residentData.bsnNumber = null;
        } else {
          residentData.bsnNumber = residentData.nummerWaarde;
          residentData.vNumber = null;
        }

        allMembers.push(residentData);
      });

      // Create children with 3-dimensional structure
      familyData.children.forEach((child) => {
        const residentData = {
          id: Date.now() + Math.random(),
          name: child.name,
          nationality: child.nationality || familyData.nationality,
          status: 'In procedure',
          statusColor: 'yellow',

          // Housing Dimension - determine room based on arrangement and child preferences
          room:
            child.roomPreference === 'with_guardians'
              ? familyData.roomArrangement === 'join_room' &&
                familyData.targetRoomId
                ? familyData.targetRoomId
                : `NEW_${familyId}`
              : child.roomPreference === 'own_room'
                ? `NEW_${familyId}_${child.name.replace(/\s+/g, '_')}`
                : familyData.roomArrangement === 'join_room' &&
                    familyData.targetRoomId
                  ? familyData.targetRoomId
                  : `NEW_${familyId}`,

          arrivalDate: familyData.arrivalDate,
          birthDate: child.birthDate,
          gender: child.gender,
          phone: '',
          email: '',
          language: '',
          priority: 'Normal',
          caseworker: caseworkers[0] || '',
          notes: familyData.notes,

          // Family Dimension - relationship data
          relationshipToExisting: child.relationshipToExisting || {},
          familyId,
          familyRole: 'child',
          guardians: child.guardians,

          // Financial Dimension - children are typically dependent
          financialStatus: child.financialStatus || 'dependent',
          financialDependentOn:
            child.dependentOn ||
            (child.guardians && child.guardians.length > 0
              ? child.guardians[0]
              : null),

          // Housing Dimension - per-child room preferences
          roomPreference: child.roomPreference || 'with_guardians',

          // Standard resident fields
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: '',
          },
          documents: [],
          photo: child.photo,
          nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
          nummerWaarde:
            locationType === 'CNO'
              ? `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
              : '',
          bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined,
          labels: familyData.labels || [],
          pets: [],
          locationType,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 20,

          // 3-Dimensional metadata reference
          familyMetadata: familyMetadata,
        };

        if (locationType === 'CNO') {
          residentData.vNumber = residentData.nummerWaarde;
          residentData.bsnNumber = null;
        } else {
          residentData.bsnNumber = residentData.nummerWaarde;
          residentData.vNumber = null;
        }

        allMembers.push(residentData);
      });

      // Create pets with 3-dimensional structure
      familyData.pets.forEach((pet) => {
        const petData = {
          id: Date.now() + Math.random(),
          name: pet.name,
          firstName: pet.name,
          lastName: '',
          type: pet.type,
          breed: pet.breed,
          isChipped: pet.isChipped,
          nationality: familyData.nationality,
          status: 'In procedure',
          statusColor: 'yellow',

          // Housing Dimension - pets follow family room arrangement
          room:
            familyData.roomArrangement === 'join_room' &&
            familyData.targetRoomId
              ? familyData.targetRoomId
              : familyData.roomArrangement === 'multiple_rooms'
                ? `NEW_${familyId}_main` // Assign to main family room
                : `NEW_${familyId}`,

          arrivalDate: familyData.arrivalDate,
          birthDate: null,
          gender: '',
          phone: '',
          email: '',
          language: '',
          priority: 'Normal',
          caseworker: caseworkers[0] || '',
          notes: familyData.notes,

          // Family Dimension - pets belong to family
          familyId,
          familyRole: 'pet',

          // Financial Dimension - pets are dependent on family
          financialStatus: 'dependent',
          financialDependentOn: familyData.financialUnitId || 'family',

          // Standard resident fields
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: '',
          },
          documents: [],
          photo:
            pet.type === 'cat'
              ? 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=face'
              : 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop&crop=face',
          nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
          nummerWaarde: '',
          bsnStatus: undefined,
          labels: pet.type === 'cat' ? ['l10', 'l16'] : ['l11', 'l16'], // Auto pet labels + incomplete profile
          pets: [],
          locationType,

          // 3-Dimensional metadata reference
          familyMetadata: familyMetadata,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 0,
          isArchived: false,
        };

        if (locationType === 'CNO') {
          petData.vNumber = null;
          petData.bsnNumber = null;
        }

        allMembers.push(petData);
      });

      // Save all family members with 3-dimensional metadata
      // eslint-disable-next-line no-console
      console.log('Calling onSave with:', allMembers, familyId, familyMetadata);
      onSave(allMembers, familyId, familyMetadata);
      // eslint-disable-next-line no-console
      console.log('onSave completed');

      // Success notification
      const memberTypes = [];
      if (familyData.adults.length > 0)
        memberTypes.push(`${familyData.adults.length} volwassene(n)`);
      if (familyData.children.length > 0)
        memberTypes.push(`${familyData.children.length} kind(eren)`);
      if (familyData.pets.length > 0)
        memberTypes.push(`${familyData.pets.length} huisdier(en)`);

      notify(
        `Familie ${familyId} succesvol aangemaakt met ${memberTypes.join(', ')}`,
        {
          type: 'success',
          persistent: true,
        }
      );
      // eslint-disable-next-line no-console
      console.log('Notification sent');

      // eslint-disable-next-line no-console
      console.log('Calling modalClose.saveAndClose');
      modalClose.saveAndClose();
      // eslint-disable-next-line no-console
      console.log('modalClose.saveAndClose completed');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating family:', error);
      notify('Er is een fout opgetreden bij het aanmaken van de familie', {
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return (
      familyData.familyName ||
      familyData.nationality ||
      familyData.adults.length > 0 ||
      familyData.children.length > 0 ||
      familyData.pets.length > 0 ||
      selectedExistingResidents.length > 0 ||
      currentStep > 0
    );
  };

  const handleClose = () => {
    // Show warning if there are unsaved changes
    if (hasUnsavedChanges()) {
      notify('Formulier gesloten - wijzigingen niet opgeslagen', {
        type: 'warning',
      });
    }

    setCurrentStep(0);
    setConnectionType('new_family');
    setSelectedExistingResidents([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setFamilyData({
      // Family Dimension
      familyName: '',
      familyId: null,
      nationality: '',

      // Housing Dimension
      roomArrangement: 'new_room',
      targetRoomId: null,
      roommates: [],

      // Financial Dimension
      financialArrangement: 'independent',
      financialUnitId: null,

      // General
      arrivalDate: new Date().toISOString().split('T')[0],
      notes: '',
      labels: [],

      // Members
      adults: [],
      children: [],
      pets: [],

      // Legacy/Selected
      existingFamilyId: null,
      selectedResidents: [],
    });
    setTempPet({
      name: '',
      type: 'cat',
      breed: '',
      isChipped: false,
    });
    setErrors({});
    modalClose.cancel();
  };

  // Add handler for connection type change to reset state
  const handleConnectionTypeChange = (newType) => {
    setConnectionType(newType);

    // Always reset these when switching connection types
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setErrors({});

    // Reset selected residents if new type doesn't need them
    if (newType === 'new_family') {
      setSelectedExistingResidents([]);
    }
    // For complex, keep the selected residents as they might be needed

    // Reset family data appropriately for new connection type
    setFamilyData((prev) => ({
      // Family Dimension - keep if family-related, reset otherwise
      familyName: ['new_family', 'join_family'].includes(newType)
        ? prev.familyName
        : '',
      familyId: ['new_family', 'join_family'].includes(newType)
        ? prev.familyId
        : null,
      nationality: ['new_family', 'join_family'].includes(newType)
        ? prev.nationality
        : '',

      // Housing Dimension - set smart defaults
      roomArrangement:
        newType === 'new_roommate'
          ? 'join_room'
          : newType === 'new_family'
            ? 'new_room'
            : prev.roomArrangement,
      targetRoomId: newType === 'new_family' ? null : prev.targetRoomId,
      roommates: [],

      // Financial Dimension - set smart defaults
      financialArrangement:
        newType === 'financial_dependent'
          ? 'dependent'
          : newType === 'new_roommate'
            ? 'independent'
            : newType === 'new_family'
              ? 'independent'
              : prev.financialArrangement,
      financialUnitId:
        newType === 'financial_dependent' ? prev.financialUnitId : null,

      // General - preserve these
      arrivalDate: prev.arrivalDate,
      notes: prev.notes,
      labels: prev.labels,

      // Members - preserve these unless switching to pure connection types
      adults:
        newType === 'new_roommate' || newType === 'financial_dependent'
          ? []
          : prev.adults,
      children:
        newType === 'new_roommate' || newType === 'financial_dependent'
          ? []
          : prev.children,
      pets:
        newType === 'new_roommate' || newType === 'financial_dependent'
          ? []
          : prev.pets,

      // Legacy/Selected - reset if not joining
      existingFamilyId: [
        'join_family',
        'new_roommate',
        'financial_dependent',
      ].includes(newType)
        ? prev.existingFamilyId
        : null,
      selectedResidents: [
        'join_family',
        'new_roommate',
        'financial_dependent',
      ].includes(newType)
        ? prev.selectedResidents
        : [],
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Connection Type Selection
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Users className='w-16 h-16 text-blue-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Aansluiting Type
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Wat voor situatie wil je aanmaken?
              </p>
            </div>

            <div className='space-y-4'>
              {/* New Family */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'new_family'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() => handleConnectionTypeChange('new_family')}
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    handleConnectionTypeChange('new_family')
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='connectionType'
                    value='new_family'
                    checked={connectionType === 'new_family'}
                    onChange={() => handleConnectionTypeChange('new_family')}
                    className='w-4 h-4 text-blue-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Nieuwe Familie Aanmaken
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Start een volledig nieuwe familie registratie - nieuwe
                      mensen, nieuwe kamer, eigen financiën
                    </p>
                  </div>
                </div>
              </div>

              {/* Join Family */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'join_family'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() => handleConnectionTypeChange('join_family')}
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    handleConnectionTypeChange('join_family')
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='connectionType'
                    value='join_family'
                    checked={connectionType === 'join_family'}
                    onChange={() => handleConnectionTypeChange('join_family')}
                    className='w-4 h-4 text-green-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Gezinshereniging
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Voeg familieleden toe aan bestaande bewoner -
                      bloed/huwelijk verwantschap
                    </p>
                  </div>
                </div>
              </div>

              {/* New Roommate */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'new_roommate'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() => handleConnectionTypeChange('new_roommate')}
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    handleConnectionTypeChange('new_roommate')
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='connectionType'
                    value='new_roommate'
                    checked={connectionType === 'new_roommate'}
                    onChange={() => handleConnectionTypeChange('new_roommate')}
                    className='w-4 h-4 text-orange-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Nieuwe Kamergenoot
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Voeg onbekende persoon toe aan bestaande kamer - geen
                      familie, eigen financiën
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Dependent */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'financial_dependent'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  handleConnectionTypeChange('financial_dependent')
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    handleConnectionTypeChange('financial_dependent')
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='connectionType'
                    value='financial_dependent'
                    checked={connectionType === 'financial_dependent'}
                    onChange={() =>
                      handleConnectionTypeChange('financial_dependent')
                    }
                    className='w-4 h-4 text-purple-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Financiële Afhankelijke
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Voeg persoon toe die financiël afhankelijk is van
                      bestaande bewoner
                    </p>
                  </div>
                </div>
              </div>

              {/* Complex Situation */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'complex'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() => handleConnectionTypeChange('complex')}
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    handleConnectionTypeChange('complex')
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='connectionType'
                    value='complex'
                    checked={connectionType === 'complex'}
                    onChange={() => handleConnectionTypeChange('complex')}
                    className='w-4 h-4 text-red-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Complexe Situatie
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Gemengde familie/woon/financiële arrangementen -
                      handmatige configuratie
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {['join_family', 'new_roommate', 'financial_dependent'].includes(
              connectionType
            ) && (
              <div className='space-y-4'>
                <label
                  htmlFor='searchResident'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                >
                  Zoek Bestaande Bewoners
                  <span className='text-xs font-normal text-gray-500 ml-2'>
                    (Je kunt meerdere bewoners selecteren)
                  </span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    id='searchResident'
                    value={searchQuery}
                    placeholder='Typ naam, nationaliteit of kamer om te zoeken... (meerdere bewoners mogelijk)'
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.existingResident
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchExistingResidents(e.target.value);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowResults(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay hiding to allow clicking on results
                      setTimeout(() => setShowResults(false), 150);
                    }}
                  />

                  {showResults && searchResults.length > 0 && (
                    <div className='absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto'>
                      {searchResults.map((resident) => (
                        <div
                          key={resident.id}
                          className='flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0'
                          onClick={() => selectExistingResident(resident)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectExistingResident(resident);
                            }
                          }}
                          role='button'
                          tabIndex={0}
                        >
                          <ProfileImage
                            src={resident.photo}
                            name={resident.name}
                            className='w-10 h-10 rounded-full'
                          />
                          <div className='flex-1'>
                            <p className='font-medium text-gray-900 dark:text-white'>
                              {resident.name}
                            </p>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              {resident.nationality} • Kamer{' '}
                              {resident.room || resident.roomNumber}
                              {resident.familyId && (
                                <span className='text-blue-600'>
                                  {' '}
                                  • Familie #{resident.familyId.slice(-3)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                              {calculateAge(resident.birthDate)} jaar
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedExistingResidents.length > 0 && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium text-gray-700'>
                        Geselecteerde bewoners (
                        {selectedExistingResidents.length}):
                      </p>
                      <p className='text-xs text-gray-500'>
                        Klik op het X om een bewoner te verwijderen
                      </p>
                    </div>
                    {selectedExistingResidents.map((resident) => (
                      <div
                        key={resident.id}
                        className='p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <ProfileImage
                            src={resident.photo}
                            name={resident.name}
                            className='w-12 h-12 rounded-full'
                          />
                          <div className='flex-1'>
                            <p className='font-medium text-green-900'>
                              {resident.name}
                            </p>
                            <p className='text-sm text-green-700'>
                              {resident.nationality} • Kamer{' '}
                              {resident.room || resident.roomNumber}
                              {resident.familyId && (
                                <span>
                                  {' '}
                                  • Bestaande familie #
                                  {resident.familyId.slice(-3)}
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => removeExistingResident(resident.id)}
                            className='text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors'
                            title='Verwijder uit selectie'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.existingResident && (
                  <p className='text-red-500 text-sm'>
                    {errors.existingResident}
                  </p>
                )}

                {errors.minorWarning && (
                  <div className='p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg'>
                    <p className='text-sm text-orange-700'>
                      ⚠️ {errors.minorWarning}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 1: // Familie Connecties
        // Skip this step for pure roommate or financial dependent scenarios
        if (!['new_family', 'join_family'].includes(connectionType)) {
          return null; // This will be handled by the step navigation logic
        }

        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Heart className='w-16 h-16 text-red-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Familie Connecties
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                {connectionType === 'join_family'
                  ? 'Bevestig de familie informatie gebaseerd op de geselecteerde bewoner'
                  : 'Basis informatie over de nieuwe familie'}
              </p>
            </div>

            {connectionType === 'join_family' &&
              selectedExistingResidents.length > 0 && (
                <div className='p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                  <h4 className='font-medium text-blue-900 mb-2'>
                    Aansluiten bij familie van (
                    {selectedExistingResidents.length} bewoner
                    {selectedExistingResidents.length > 1 ? 's' : ''}):
                  </h4>
                  <div className='space-y-2'>
                    {selectedExistingResidents.map((resident) => (
                      <div
                        key={resident.id}
                        className='flex items-center space-x-3'
                      >
                        <ProfileImage
                          src={resident.photo}
                          name={resident.name}
                          className='w-10 h-10 rounded-full'
                        />
                        <div>
                          <p className='font-medium text-blue-900'>
                            {resident.name}
                          </p>
                          <p className='text-sm text-blue-700'>
                            {resident.nationality} • Kamer{' '}
                            {resident.room || resident.roomNumber}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='familyName'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Familie Naam *
                </label>
                <input
                  type='text'
                  id='familyName'
                  value={familyData.familyName}
                  onChange={(e) =>
                    setFamilyData((prev) => ({
                      ...prev,
                      familyName: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.familyName
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={
                    connectionType === 'join_family'
                      ? 'Bijv. Familie Al-Hassan (pas aan indien nodig)'
                      : 'Bijv. Familie Al-Hassan'
                  }
                />
                {connectionType === 'join_family' && (
                  <p className='text-xs text-blue-600 mt-1'>
                    Tip: Familie naam is automatisch ingevuld, maar je kunt deze
                    aanpassen als nieuwe gezinsleden een andere achternaam
                    hebben
                  </p>
                )}
                {errors.familyName && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.familyName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='familyNationality'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Basis Nationaliteit *
                </label>
                <AutoComplete
                  id='familyNationality'
                  value={familyData.nationality}
                  onChange={(value) => {
                    setFamilyData((prev) => ({ ...prev, nationality: value }));
                    // Clear error when user starts typing
                    if (errors.nationality) {
                      setErrors((prev) => ({
                        ...prev,
                        nationality: '',
                      }));
                    }
                  }}
                  onSearch={searchNationalities}
                  placeholder='Type om nationaliteit te zoeken...'
                  error={!!errors.nationality}
                  allowCustom={true}
                  maxResults={8}
                />
                <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                  Dit is de standaard nationaliteit. Individuele personen kunnen
                  een andere nationaliteit hebben.
                </p>
                {errors.nationality && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.nationality}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='familyArrivalDate'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Aankomstdatum
                </label>
                <input
                  type='date'
                  id='familyArrivalDate'
                  value={familyData.arrivalDate}
                  onChange={(e) =>
                    setFamilyData((prev) => ({
                      ...prev,
                      arrivalDate: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                />
              </div>
            </div>
          </div>
        );

      case 2: // Room Arrangement
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Home className='w-16 h-16 text-blue-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Woon Arrangement
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Hoe wil je de kamer situatie regelen?
              </p>
            </div>

            <div className='space-y-4'>
              {/* New Room */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.roomArrangement === 'new_room'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    roomArrangement: 'new_room',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      roomArrangement: 'new_room',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='roomArrangement'
                    value='new_room'
                    checked={familyData.roomArrangement === 'new_room'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        roomArrangement: 'new_room',
                      }))
                    }
                    className='w-4 h-4 text-blue-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Nieuwe Kamer
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Krijg een nieuwe kamer toegewezen - alleen voor deze groep
                    </p>
                  </div>
                </div>
              </div>

              {/* Join Room */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.roomArrangement === 'join_room'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    roomArrangement: 'join_room',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      roomArrangement: 'join_room',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='roomArrangement'
                    value='join_room'
                    checked={familyData.roomArrangement === 'join_room'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        roomArrangement: 'join_room',
                      }))
                    }
                    className='w-4 h-4 text-green-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Aansluiten bij Bestaande Kamer
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Delen van kamer met bestaande bewoners
                    </p>
                  </div>
                </div>
              </div>

              {/* Multiple Rooms */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.roomArrangement === 'multiple_rooms'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    roomArrangement: 'multiple_rooms',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      roomArrangement: 'multiple_rooms',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='roomArrangement'
                    value='multiple_rooms'
                    checked={familyData.roomArrangement === 'multiple_rooms'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        roomArrangement: 'multiple_rooms',
                      }))
                    }
                    className='w-4 h-4 text-purple-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Meerdere Kamers
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Familie verdeeld over verschillende kamers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Selection for join_room */}
            {/* Enhanced Roommate Logic for join_room or new_roommate */}
            {(familyData.roomArrangement === 'join_room' ||
              connectionType === 'new_roommate') && (
              <div className='p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg'>
                <RoommateLogic
                  existingResidents={existingResidents}
                  roomCapacities={roomCapacities}
                  selectedRoomId={selectedRoomId}
                  onRoomSelect={handleRoomSelect}
                  selectedRoommates={selectedRoommates}
                  onRoommateSelect={handleRoommateSelect}
                  newOccupants={
                    familyData.adults.length + familyData.children.length
                  }
                  showFinancialArrangement={connectionType === 'new_roommate'}
                  financialArrangement={roommateFinancialArrangement}
                  onFinancialArrangementChange={handleRoommateFinancialChange}
                  errors={{
                    roomSelection: errors.targetRoom,
                  }}
                />
              </div>
            )}

            {/* Instructions based on connection type */}
            {connectionType === 'new_roommate' && (
              <div className='p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg'>
                <p className='text-sm text-orange-700 flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  Als kamergenoot wordt verwacht dat je een bestaande kamer
                  deelt.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Financial Arrangement
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Shield className='w-16 h-16 text-green-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Financiële Regeling
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Hoe wordt de financiële situatie geregeld?
              </p>
            </div>

            <div className='space-y-4'>
              {/* Independent */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.financialArrangement === 'independent'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    financialArrangement: 'independent',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      financialArrangement: 'independent',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='financialArrangement'
                    value='independent'
                    checked={familyData.financialArrangement === 'independent'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        financialArrangement: 'independent',
                      }))
                    }
                    className='w-4 h-4 text-blue-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Onafhankelijk
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Eigen financiën - krijgen eigen leefgeld/uitkering
                    </p>
                  </div>
                </div>
              </div>

              {/* Shared */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.financialArrangement === 'shared'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    financialArrangement: 'shared',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      financialArrangement: 'shared',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='financialArrangement'
                    value='shared'
                    checked={familyData.financialArrangement === 'shared'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        financialArrangement: 'shared',
                      }))
                    }
                    className='w-4 h-4 text-green-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Gedeeld
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Gedeelde financiën - gezamenlijk leefgeld/uitkering
                    </p>
                  </div>
                </div>
              </div>

              {/* Dependent */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.financialArrangement === 'dependent'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    financialArrangement: 'dependent',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      financialArrangement: 'dependent',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='financialArrangement'
                    value='dependent'
                    checked={familyData.financialArrangement === 'dependent'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        financialArrangement: 'dependent',
                      }))
                    }
                    className='w-4 h-4 text-purple-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Afhankelijk
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Financieel afhankelijk van bestaande bewoner
                    </p>
                  </div>
                </div>
              </div>

              {/* Mixed */}
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  familyData.financialArrangement === 'mixed'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onClick={() =>
                  setFamilyData((prev) => ({
                    ...prev,
                    financialArrangement: 'mixed',
                  }))
                }
                onKeyDown={(e) =>
                  handleKeyboardClick(e, () =>
                    setFamilyData((prev) => ({
                      ...prev,
                      financialArrangement: 'mixed',
                    }))
                  )
                }
                role='button'
                tabIndex={0}
              >
                <div className='flex items-center space-x-3'>
                  <input
                    type='radio'
                    name='financialArrangement'
                    value='mixed'
                    checked={familyData.financialArrangement === 'mixed'}
                    onChange={() =>
                      setFamilyData((prev) => ({
                        ...prev,
                        financialArrangement: 'mixed',
                      }))
                    }
                    className='w-4 h-4 text-orange-600'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
                      Gemengd
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Verschillende financiële arrangementen per persoon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Unit Selection for dependent */}
            {familyData.financialArrangement === 'dependent' && (
              <div className='p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg'>
                <label
                  htmlFor='financialUnit'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Van wie is bewoner financieel afhankelijk? *
                </label>
                <select
                  id='financialUnit'
                  value={familyData.financialUnitId || ''}
                  onChange={(e) =>
                    setFamilyData((prev) => ({
                      ...prev,
                      financialUnitId: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${
                    errors.financialUnit
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value=''>
                    Selecteer van wie men financieel afhankelijk is...
                  </option>
                  {selectedExistingResidents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} - Kamer{' '}
                      {resident.room || resident.roomNumber}
                    </option>
                  ))}
                  {familyData.adults.map((adult, index) => (
                    <option key={`adult-${index}`} value={`adult-${index}`}>
                      {adult.name} (nieuw toe te voegen)
                    </option>
                  ))}
                </select>
                {errors.financialUnit && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.financialUnit}
                  </p>
                )}
                {selectedExistingResidents.length === 0 &&
                  familyData.adults.length === 0 && (
                    <div className='mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200'>
                      ⚠️ Er zijn nog geen personen beschikbaar. Voeg eerst
                      volwassenen toe in de volgende stappen.
                    </div>
                  )}
              </div>
            )}

            {/* Instructions based on connection type */}
            {connectionType === 'financial_dependent' && (
              <div className='p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg'>
                <p className='text-sm text-purple-700 flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  Als financieel afhankelijke wordt verwacht dat bewoner
                  ondersteuning krijgt van een bestaande bewoner.
                </p>
              </div>
            )}
          </div>
        );

      case 4: // Adults
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Users className='w-16 h-16 text-green-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Volwassenen
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Voeg alle volwassen personen toe (18+)
              </p>

              {/* Skip notice for join mode with adult */}
              {['join_family', 'new_roommate'].includes(connectionType) &&
                selectedExistingResidents.length > 0 &&
                selectedExistingResidents.some(
                  (r) => calculateAge(r.birthDate) >= 18
                ) && (
                  <div className='mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                    <p className='text-sm text-blue-700 flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4' />
                      Je sluit aan bij{' '}
                      {
                        selectedExistingResidents.filter(
                          (r) => calculateAge(r.birthDate) >= 18
                        ).length
                      }{' '}
                      volwassene(n). Je kunt deze stap overslaan of extra
                      volwassenen toevoegen.
                    </p>
                  </div>
                )}
            </div>

            {/* Current Adults */}
            <div className='space-y-3'>
              {familyData.adults.map((adult) => (
                <div
                  key={adult.id}
                  className='flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg'
                >
                  <ProfileImage
                    src={adult.photo}
                    name={adult.name}
                    className='w-12 h-12 rounded-full'
                  />
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900 dark:text-white'>
                      {adult.name}
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {adult.age} jaar •{' '}
                      {adult.role === 'parent' ? 'Ouder' : 'Voogd'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAdult(adult.id)}
                    className='text-red-600 hover:text-red-800'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Adult Form */}
            <div className='p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg'>
              <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
                Nieuwe volwassene toevoegen
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <label
                    htmlFor='adultName'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Naam *
                  </label>
                  <input
                    type='text'
                    id='adultName'
                    value={tempAdult.name}
                    onChange={(e) => {
                      setTempAdult((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.adultName) {
                        setErrors((prev) => ({
                          ...prev,
                          adultName: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.adultName
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='Volledige naam'
                  />
                  {errors.adultName && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.adultName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='adultBirthDate'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Geboortedatum *
                  </label>
                  <input
                    type='date'
                    id='adultBirthDate'
                    value={tempAdult.birthDate}
                    onChange={(e) => {
                      setTempAdult((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }));
                      if (errors.adultBirthDate) {
                        setErrors((prev) => ({
                          ...prev,
                          adultBirthDate: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.adultBirthDate
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split('T')[0]
                    }
                  />
                  {errors.adultBirthDate && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.adultBirthDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='adultGender'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Geslacht
                  </label>
                  <select
                    id='adultGender'
                    value={tempAdult.gender}
                    onChange={(e) =>
                      setTempAdult((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value='M'>Man</option>
                    <option value='F'>Vrouw</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor='adultRole'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Rol
                  </label>
                  <select
                    id='adultRole'
                    value={tempAdult.role}
                    onChange={(e) =>
                      setTempAdult((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value='parent'>Ouder</option>
                    <option value='guardian'>Voogd</option>
                    <option value='relative'>Familie</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor='adultPhone'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Telefoon{' '}
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      (minimaal één vereist)
                    </span>
                  </label>
                  <input
                    type='tel'
                    id='adultPhone'
                    value={tempAdult.phone}
                    onChange={(e) => {
                      setTempAdult((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }));
                      if (errors.contact) {
                        setErrors((prev) => ({ ...prev, contact: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contact
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='+31 6 12345678'
                  />
                </div>
                <div>
                  <label
                    htmlFor='adultEmail'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Email{' '}
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      (minimaal één vereist)
                    </span>
                  </label>
                  <input
                    type='email'
                    id='adultEmail'
                    value={tempAdult.email}
                    onChange={(e) => {
                      setTempAdult((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      if (errors.contact) {
                        setErrors((prev) => ({ ...prev, contact: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contact
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='email@example.com'
                  />
                  {errors.contact && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.contact}
                    </p>
                  )}
                </div>

                {/* Nationality Field */}
                <div className='md:col-span-2'>
                  <label
                    htmlFor='adultNationality'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Nationaliteit *
                  </label>
                  <AutoComplete
                    id='adultNationality'
                    value={tempAdult.nationality}
                    onChange={(value) => {
                      setTempAdult((prev) => ({ ...prev, nationality: value }));
                      // Clear error when user starts typing
                      if (errors.adultNationality) {
                        setErrors((prev) => ({
                          ...prev,
                          adultNationality: '',
                        }));
                      }
                    }}
                    onSearch={searchNationalities}
                    placeholder='Type om nationaliteit te zoeken...'
                    error={!!errors.adultNationality}
                    allowCustom={true}
                    maxResults={8}
                  />
                  {errors.adultNationality && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.adultNationality}
                    </p>
                  )}
                </div>
              </div>

              {/* Relationship Section for Join Mode */}
              {connectionType === 'join_family' &&
                selectedExistingResidents.length > 0 && (
                  <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                    <h5 className='font-medium text-blue-800 mb-3'>
                      Relatie tot bestaande bewoners
                    </h5>
                    <div className='space-y-3'>
                      {selectedExistingResidents.map((resident) => (
                        <div
                          key={resident.id}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-2'>
                            <ProfileImage
                              src={resident.photo}
                              name={resident.name}
                              className='w-8 h-8 rounded-full'
                            />
                            <span className='text-sm font-medium text-gray-700'>
                              {resident.name}
                            </span>
                          </div>
                          <div className='flex-1 max-w-xs ml-3'>
                            <select
                              value={
                                tempAdult.relationshipToExisting[resident.id] ||
                                ''
                              }
                              onChange={(e) =>
                                setTempAdult((prev) => ({
                                  ...prev,
                                  relationshipToExisting: {
                                    ...prev.relationshipToExisting,
                                    [resident.id]: e.target.value,
                                  },
                                }))
                              }
                              className='w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                            >
                              <option value=''>Selecteer relatie...</option>
                              <option value='partner'>
                                Partner/Echtgenoot
                              </option>
                              <option value='parent'>Ouder</option>
                              <option value='child'>Volwassen kind</option>
                              <option value='sibling'>Broer/Zus</option>
                              <option value='grandparent'>Grootouder</option>
                              <option value='uncle_aunt'>Oom/Tante</option>
                              <option value='cousin'>Neef/Nicht</option>
                              <option value='friend'>Vriend/Kennis</option>
                              <option value='other'>Anders</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className='text-xs text-blue-600 mt-2'>
                      Specificeer de relatie van deze nieuwe volwassene tot elke
                      bestaande bewoner
                    </p>
                  </div>
                )}

              {/* Per-Person Settings Section */}
              {(familyData.roomArrangement === 'multiple_rooms' ||
                familyData.financialArrangement === 'mixed') && (
                <div className='mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg'>
                  <h5 className='font-medium text-purple-800 mb-3'>
                    Individuele Instellingen
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {/* Room Preference */}
                    {familyData.roomArrangement === 'multiple_rooms' && (
                      <div>
                        <label
                          htmlFor='roomPreference'
                          className='block text-sm font-medium text-purple-700 mb-1'
                        >
                          Kamer Voorkeur
                        </label>
                        <select
                          id='roomPreference'
                          value={tempAdult.roomPreference || 'default'}
                          onChange={(e) =>
                            setTempAdult((prev) => ({
                              ...prev,
                              roomPreference: e.target.value,
                            }))
                          }
                          className='w-full px-2 py-1 text-sm border border-purple-300 rounded'
                        >
                          <option value='default'>
                            Standaard (bij familie)
                          </option>
                          <option value='specific_room'>
                            Specifieke kamer
                          </option>
                          <option value='own_room'>Eigen kamer</option>
                        </select>
                      </div>
                    )}

                    {/* Financial Status */}
                    {familyData.financialArrangement === 'mixed' && (
                      <div>
                        <label
                          htmlFor='financialStatus'
                          className='block text-sm font-medium text-purple-700 mb-1'
                        >
                          Financiële Status
                        </label>
                        <select
                          id='financialStatus'
                          value={tempAdult.financialStatus || 'default'}
                          onChange={(e) =>
                            setTempAdult((prev) => ({
                              ...prev,
                              financialStatus: e.target.value,
                            }))
                          }
                          className='w-full px-2 py-1 text-sm border border-purple-300 rounded'
                        >
                          <option value='default'>
                            Standaard (volg familie)
                          </option>
                          <option value='independent'>Onafhankelijk</option>
                          <option value='dependent_on'>
                            Afhankelijk van...
                          </option>
                        </select>

                        {/* Financial Dependent On */}
                        {tempAdult.financialStatus === 'dependent_on' && (
                          <div className='mt-2'>
                            <select
                              value={tempAdult.dependentOn || ''}
                              onChange={(e) =>
                                setTempAdult((prev) => ({
                                  ...prev,
                                  dependentOn: e.target.value,
                                }))
                              }
                              className='w-full px-2 py-1 text-sm border border-purple-300 rounded'
                            >
                              <option value=''>Selecteer persoon...</option>
                              {selectedExistingResidents.map((resident) => (
                                <option key={resident.id} value={resident.id}>
                                  {resident.name}
                                </option>
                              ))}
                              {familyData.adults.map((adult) => (
                                <option key={adult.id} value={adult.id}>
                                  {adult.name} (nieuw)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className='text-xs text-purple-600 mt-2'>
                    Deze instellingen zijn specifiek voor deze persoon en kunnen
                    afwijken van de familie instellingen
                  </p>
                </div>
              )}

              <div className='mt-3'>
                <Button
                  onClick={addAdult}
                  variant='primary'
                  disabled={!tempAdult.name.trim() || !tempAdult.birthDate}
                  className='text-sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Volwassene Toevoegen
                </Button>
              </div>
            </div>

            {errors.adults && (
              <p className='text-red-500 text-sm'>{errors.adults}</p>
            )}
          </div>
        );

      case 5: // Children
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Baby className='w-16 h-16 text-blue-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Kinderen
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Voeg alle kinderen toe (onder 18 jaar)
              </p>
            </div>

            {/* Current Children */}
            <div className='space-y-3'>
              {familyData.children.map((child) => (
                <div
                  key={child.id}
                  className='flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'
                >
                  <ProfileImage
                    src={child.photo}
                    name={child.name}
                    className='w-12 h-12 rounded-full'
                  />
                  <div className='flex-1'>
                    <p className='font-medium text-gray-900 dark:text-white'>
                      {child.name}
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {child.age} jaar
                    </p>
                  </div>
                  <button
                    onClick={() => removeChild(child.id)}
                    className='text-red-600 hover:text-red-800'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Child Form */}
            <div className='p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg'>
              <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
                Nieuw kind toevoegen
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div>
                  <label
                    htmlFor='childName'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Naam *
                  </label>
                  <input
                    type='text'
                    id='childName'
                    value={tempChild.name}
                    onChange={(e) => {
                      setTempChild((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                      if (errors.childName) {
                        setErrors((prev) => ({
                          ...prev,
                          childName: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.childName
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='Volledige naam'
                  />
                  {errors.childName && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.childName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='childBirthDate'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Geboortedatum *
                  </label>
                  <input
                    type='date'
                    id='childBirthDate'
                    value={tempChild.birthDate}
                    onChange={(e) => {
                      setTempChild((prev) => ({
                        ...prev,
                        birthDate: e.target.value,
                      }));
                      if (errors.childBirthDate) {
                        setErrors((prev) => ({
                          ...prev,
                          childBirthDate: undefined,
                        }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.childBirthDate
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.childBirthDate && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.childBirthDate}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor='childGender'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Geslacht
                  </label>
                  <select
                    id='childGender'
                    value={tempChild.gender}
                    onChange={(e) =>
                      setTempChild((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value='M'>Jongen</option>
                    <option value='F'>Meisje</option>
                  </select>
                </div>
              </div>

              {/* Nationality Field for Child */}
              <div className='mt-4'>
                <label
                  htmlFor='childNationality'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Nationaliteit *
                </label>
                <AutoComplete
                  id='childNationality'
                  value={tempChild.nationality}
                  onChange={(value) => {
                    setTempChild((prev) => ({ ...prev, nationality: value }));
                    // Clear error when user starts typing
                    if (errors.childNationality) {
                      setErrors((prev) => ({
                        ...prev,
                        childNationality: '',
                      }));
                    }
                  }}
                  onSearch={searchNationalities}
                  placeholder='Type om nationaliteit te zoeken...'
                  error={!!errors.childNationality}
                  allowCustom={true}
                  maxResults={8}
                />
                {errors.childNationality && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.childNationality}
                  </p>
                )}
              </div>

              {/* Relationship Section for Join Mode */}
              {connectionType === 'join_family' &&
                selectedExistingResidents.length > 0 && (
                  <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                    <h5 className='font-medium text-blue-800 mb-3'>
                      Relatie tot bestaande bewoners
                    </h5>
                    <div className='space-y-3'>
                      {selectedExistingResidents.map((resident) => (
                        <div
                          key={resident.id}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-2'>
                            <ProfileImage
                              src={resident.photo}
                              name={resident.name}
                              className='w-8 h-8 rounded-full'
                            />
                            <span className='text-sm font-medium text-gray-700'>
                              {resident.name}
                            </span>
                          </div>
                          <div className='flex-1 max-w-xs ml-3'>
                            <select
                              value={
                                tempChild.relationshipToExisting[resident.id] ||
                                ''
                              }
                              onChange={(e) =>
                                setTempChild((prev) => ({
                                  ...prev,
                                  relationshipToExisting: {
                                    ...prev.relationshipToExisting,
                                    [resident.id]: e.target.value,
                                  },
                                }))
                              }
                              className='w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                            >
                              <option value=''>Selecteer relatie...</option>
                              <option value='child'>Kind</option>
                              <option value='stepchild'>Stiefkind</option>
                              <option value='grandchild'>Kleinkind</option>
                              <option value='sibling'>Broer/Zus</option>
                              <option value='nephew_niece'>Neef/Nicht</option>
                              <option value='foster_child'>Pleegkind</option>
                              <option value='other'>Anders</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className='text-xs text-blue-600 mt-2'>
                      Specificeer de relatie van dit kind tot elke bestaande
                      bewoner
                    </p>
                  </div>
                )}

              {/* Guardian Selection */}
              {(familyData.adults.length > 0 ||
                (connectionType === 'join_family' &&
                  selectedExistingResidents.length > 0 &&
                  selectedExistingResidents.some(
                    (r) => calculateAge(r.birthDate) >= 18
                  ))) && (
                <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                  <label
                    htmlFor='guardianSelection'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Voogden selecteren (minimaal 1) *
                  </label>
                  <div className='space-y-2'>
                    {/* Show existing residents as guardian options if in join mode */}
                    {connectionType === 'join_family' &&
                      selectedExistingResidents.length > 0 &&
                      selectedExistingResidents
                        .filter((r) => calculateAge(r.birthDate) >= 18)
                        .map((resident) => (
                          <label
                            key={resident.id}
                            className='flex items-center space-x-2 cursor-pointer'
                          >
                            <input
                              type='checkbox'
                              checked={tempChild.guardians.includes(
                                resident.id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTempChild((prev) => ({
                                    ...prev,
                                    guardians: [...prev.guardians, resident.id],
                                  }));
                                } else {
                                  setTempChild((prev) => ({
                                    ...prev,
                                    guardians: prev.guardians.filter(
                                      (id) => id !== resident.id
                                    ),
                                  }));
                                }
                                if (errors.guardians) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    guardians: undefined,
                                  }));
                                }
                              }}
                              className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              {resident.name} (
                              {calculateAge(resident.birthDate)} jaar) -
                              Bestaande bewoner
                            </span>
                          </label>
                        ))}

                    {/* Show new adults */}
                    {familyData.adults.map((adult) => (
                      <label
                        key={adult.id}
                        className='flex items-center space-x-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={tempChild.guardians.includes(adult.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempChild((prev) => ({
                                ...prev,
                                guardians: [...prev.guardians, adult.id],
                              }));
                            } else {
                              setTempChild((prev) => ({
                                ...prev,
                                guardians: prev.guardians.filter(
                                  (id) => id !== adult.id
                                ),
                              }));
                            }
                            // Clear guardian error when user selects
                            if (errors.guardians) {
                              setErrors((prev) => ({
                                ...prev,
                                guardians: undefined,
                              }));
                            }
                          }}
                          className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700 dark:text-gray-300'>
                          {adult.name} ({adult.age} jaar)
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.guardians && (
                    <p className='text-red-500 text-sm mt-2'>
                      {errors.guardians}
                    </p>
                  )}
                </div>
              )}

              {familyData.adults.length === 0 &&
                !(
                  connectionType === 'join_family' &&
                  selectedExistingResidents.length > 0 &&
                  selectedExistingResidents.some(
                    (r) => calculateAge(r.birthDate) >= 18
                  )
                ) && (
                  <div className='mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg'>
                    <p className='text-sm text-amber-700'>
                      Voeg eerst volwassenen toe om voogden te kunnen selecteren
                    </p>
                  </div>
                )}

              <div className='mt-3'>
                <Button
                  onClick={addChild}
                  variant='primary'
                  disabled={!tempChild.name.trim() || !tempChild.birthDate}
                  className='text-sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Kind Toevoegen
                </Button>
              </div>
            </div>

            {familyData.adults.length === 0 &&
              !(
                connectionType === 'join_family' &&
                selectedExistingResidents.length > 0 &&
                selectedExistingResidents.some(
                  (r) => calculateAge(r.birthDate) >= 18
                )
              ) && (
                <div className='p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg'>
                  <p className='text-sm text-amber-700'>
                    Voeg eerst volwassenen toe voordat je kinderen toevoegt
                  </p>
                </div>
              )}
          </div>
        );

      case 6: // Pets
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <Cat className='w-16 h-16 text-orange-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Huisdieren (Optioneel)
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Voeg eventuele huisdieren toe aan de familie
              </p>
            </div>

            {/* Current Pets */}
            <div className='space-y-3'>
              {familyData.pets.map((pet) => {
                const Icon = pet.type === 'cat' ? Cat : Dog;
                return (
                  <div
                    key={pet.id}
                    className='flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg'
                  >
                    <Icon className='w-8 h-8 text-orange-600' />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {pet.name}
                      </p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {pet.type === 'cat' ? 'Kat' : 'Hond'}
                        {pet.breed && ` • ${pet.breed}`}
                        {pet.isChipped && ' • Gechipt'}
                      </p>
                    </div>
                    <button
                      onClick={() => removePet(pet.id)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add New Pet Form */}
            <div className='p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg'>
              <h4 className='font-medium text-gray-900 dark:text-white mb-3'>
                Nieuw huisdier toevoegen
              </h4>

              {/* Pet Type Selector */}
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <button
                  type='button'
                  onClick={() =>
                    setTempPet((prev) => ({ ...prev, type: 'cat', breed: '' }))
                  }
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    tempPet.type === 'cat'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Cat className='w-5 h-5 mr-2' />
                  Kat
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setTempPet((prev) => ({ ...prev, type: 'dog', breed: '' }))
                  }
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    tempPet.type === 'dog'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Dog className='w-5 h-5 mr-2' />
                  Hond
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div>
                  <label
                    htmlFor='petName'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Naam *
                  </label>
                  <input
                    type='text'
                    id='petName'
                    value={tempPet.name}
                    onChange={(e) => {
                      setTempPet((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.petName) {
                        setErrors((prev) => ({ ...prev, petName: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.petName
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={
                      tempPet.type === 'cat' ? 'Bijv. Whiskers' : 'Bijv. Bella'
                    }
                  />
                  {errors.petName && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.petName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='petBreed'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Ras (optioneel)
                  </label>
                  <select
                    id='petBreed'
                    value={tempPet.breed}
                    onChange={(e) =>
                      setTempPet((prev) => ({ ...prev, breed: e.target.value }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Kies ras...</option>
                    {(tempPet.type === 'cat' ? catBreeds : dogBreeds).map(
                      (breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className='flex items-center pt-6'>
                  <label
                    htmlFor='petChipped'
                    className='flex items-center space-x-2'
                  >
                    <input
                      type='checkbox'
                      id='petChipped'
                      checked={tempPet.isChipped}
                      onChange={(e) =>
                        setTempPet((prev) => ({
                          ...prev,
                          isChipped: e.target.checked,
                        }))
                      }
                      className='rounded border-gray-300 dark:border-gray-600'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      Gechipt
                    </span>
                  </label>
                </div>
              </div>

              <div className='mt-3'>
                <Button
                  onClick={addPet}
                  variant='primary'
                  disabled={!tempPet.name.trim()}
                  className='text-sm'
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Huisdier Toevoegen
                </Button>
              </div>
            </div>

            {/* Skip Option */}
            <div className='text-center'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                Geen huisdieren of later toevoegen?
              </p>
              <Button
                onClick={nextStep}
                variant='secondary'
                className='text-sm'
              >
                Overslaan - Naar locatie →
              </Button>
            </div>
          </div>
        );

      case 7: // 3-Dimensional Overview & Final Confirmation
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <CheckCircle className='w-16 h-16 text-green-600 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Overzicht & Bevestiging
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Controleer de 3-dimensionale configuratie voordat je opslaat
              </p>
            </div>

            {/* Connection Type Summary */}
            <div className='p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg'>
              <h4 className='font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2'>
                <Users className='w-4 h-4' />
                Aansluiting Type
              </h4>
              <div className='text-sm'>
                <span className='font-medium'>
                  {connectionType === 'new_family' && 'Nieuwe Familie Aanmaken'}
                  {connectionType === 'join_family' && 'Gezinshereniging'}
                  {connectionType === 'new_roommate' && 'Nieuwe Kamergenoot'}
                  {connectionType === 'financial_dependent' &&
                    'Financiële Afhankelijke'}
                  {connectionType === 'complex' && 'Complexe Situatie'}
                </span>
                {selectedExistingResidents.length > 0 && (
                  <div className='mt-2'>
                    <span className='text-slate-600 dark:text-slate-400'>
                      Aansluitend bij:{' '}
                    </span>
                    {selectedExistingResidents.map((r) => r.name).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Three Dimensions */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Family Dimension */}
              {['new_family', 'join_family'].includes(connectionType) && (
                <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg'>
                  <h4 className='font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2'>
                    <Heart className='w-4 h-4' />
                    Familie Relaties
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div>
                      <span className='text-red-600 dark:text-red-400'>
                        Familie naam:
                      </span>
                      <span className='ml-2 font-medium'>
                        {familyData.familyName}
                      </span>
                    </div>
                    <div>
                      <span className='text-red-600 dark:text-red-400'>
                        Basis nationaliteit:
                      </span>
                      <span className='ml-2 font-medium'>
                        {familyData.nationality}
                      </span>
                    </div>
                    {familyData.adults.some(
                      (a) =>
                        a.relationshipToExisting &&
                        Object.keys(a.relationshipToExisting).length > 0
                    ) && (
                      <div>
                        <span className='text-red-600 dark:text-red-400'>
                          Familie connecties:
                        </span>
                        <div className='ml-2 text-xs'>
                          {
                            familyData.adults.filter(
                              (a) =>
                                a.relationshipToExisting &&
                                Object.keys(a.relationshipToExisting).length > 0
                            ).length
                          }{' '}
                          personen met familie relaties
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Housing Dimension */}
              <div className='p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg'>
                <h4 className='font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2'>
                  <Home className='w-4 h-4' />
                  Woon Arrangement
                </h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Type:
                    </span>
                    <span className='ml-2 font-medium'>
                      {familyData.roomArrangement === 'new_room' &&
                        'Nieuwe Kamer'}
                      {familyData.roomArrangement === 'join_room' &&
                        'Aansluiten bij Bestaande Kamer'}
                      {familyData.roomArrangement === 'multiple_rooms' &&
                        'Meerdere Kamers'}
                    </span>
                  </div>
                  {familyData.roomArrangement === 'join_room' &&
                    familyData.targetRoomId && (
                      <div>
                        <span className='text-blue-600 dark:text-blue-400'>
                          Target kamer:
                        </span>
                        <span className='ml-2 font-medium'>
                          {familyData.targetRoomId}
                        </span>
                      </div>
                    )}
                  <div>
                    <span className='text-blue-600 dark:text-blue-400'>
                      Personen:
                    </span>
                    <span className='ml-2 font-medium'>
                      {familyData.adults.length + familyData.children.length}{' '}
                      nieuwe bewoners
                    </span>
                  </div>
                  {familyData.roomArrangement === 'multiple_rooms' && (
                    <div className='text-xs text-blue-600 dark:text-blue-400'>
                      Individuele kamer voorkeuren per persoon geconfigureerd
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Dimension */}
              <div className='p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg'>
                <h4 className='font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2'>
                  <Shield className='w-4 h-4' />
                  Financiële Regeling
                </h4>
                <div className='space-y-2 text-sm'>
                  <div>
                    <span className='text-green-600 dark:text-green-400'>
                      Type:
                    </span>
                    <span className='ml-2 font-medium'>
                      {familyData.financialArrangement === 'independent' &&
                        'Onafhankelijk'}
                      {familyData.financialArrangement === 'shared' &&
                        'Gedeeld'}
                      {familyData.financialArrangement === 'dependent' &&
                        'Afhankelijk'}
                      {familyData.financialArrangement === 'mixed' && 'Gemengd'}
                    </span>
                  </div>
                  {familyData.financialArrangement === 'dependent' &&
                    familyData.financialUnitId && (
                      <div>
                        <span className='text-green-600 dark:text-green-400'>
                          Afhankelijk van:
                        </span>
                        <span className='ml-2 font-medium'>
                          {selectedExistingResidents.find(
                            (r) => r.id === familyData.financialUnitId
                          )?.name || 'Bestaande bewoner'}
                        </span>
                      </div>
                    )}
                  {familyData.financialArrangement === 'mixed' && (
                    <div className='text-xs text-green-600 dark:text-green-400'>
                      Individuele financiële status per persoon geconfigureerd
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Members Overview */}
            <div className='space-y-4'>
              {/* Adults */}
              {familyData.adults.length > 0 && (
                <div className='p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg'>
                  <h4 className='font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2'>
                    <Users className='w-4 h-4' />
                    Volwassenen ({familyData.adults.length})
                  </h4>
                  <div className='space-y-2'>
                    {familyData.adults.map((adult) => (
                      <div
                        key={adult.id}
                        className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded'
                      >
                        <div className='flex items-center gap-3'>
                          <ProfileImage
                            src={adult.photo}
                            name={adult.name}
                            className='w-8 h-8 rounded-full'
                          />
                          <div>
                            <div className='text-sm font-medium'>
                              {adult.name} ({adult.age} jaar)
                            </div>
                            <div className='text-xs text-gray-600 dark:text-gray-400'>
                              {adult.nationality || familyData.nationality}
                              {adult.roomPreference &&
                                adult.roomPreference !== 'default' && (
                                  <span> • Kamer: {adult.roomPreference}</span>
                                )}
                              {adult.financialStatus &&
                                adult.financialStatus !== 'default' && (
                                  <span>
                                    {' '}
                                    • Financieel: {adult.financialStatus}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Children */}
              {familyData.children.length > 0 && (
                <div className='p-4 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700 rounded-lg'>
                  <h4 className='font-medium text-cyan-800 dark:text-cyan-200 mb-3 flex items-center gap-2'>
                    <Baby className='w-4 h-4' />
                    Kinderen ({familyData.children.length})
                  </h4>
                  <div className='space-y-2'>
                    {familyData.children.map((child) => (
                      <div
                        key={child.id}
                        className='flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded'
                      >
                        <div className='flex items-center gap-3'>
                          <ProfileImage
                            src={child.photo}
                            name={child.name}
                            className='w-8 h-8 rounded-full'
                          />
                          <div>
                            <div className='text-sm font-medium'>
                              {child.name} ({child.age} jaar)
                            </div>
                            <div className='text-xs text-gray-600 dark:text-gray-400'>
                              {child.nationality || familyData.nationality}
                              {child.guardians &&
                                child.guardians.length > 0 && (
                                  <span>
                                    {' '}
                                    • {child.guardians.length} voogd(en)
                                  </span>
                                )}
                              {child.roomPreference &&
                                child.roomPreference !== 'with_guardians' && (
                                  <span> • Kamer: {child.roomPreference}</span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pets */}
              {familyData.pets.length > 0 && (
                <div className='p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg'>
                  <h4 className='font-medium text-orange-800 dark:text-orange-200 mb-3 flex items-center gap-2'>
                    <Cat className='w-4 h-4' />
                    Huisdieren ({familyData.pets.length})
                  </h4>
                  <div className='space-y-2'>
                    {familyData.pets.map((pet) => {
                      const Icon = pet.type === 'cat' ? Cat : Dog;
                      return (
                        <div
                          key={pet.id}
                          className='flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded'
                        >
                          <Icon className='w-6 h-6 text-orange-600' />
                          <span className='text-sm'>
                            {pet.name} ({pet.type === 'cat' ? 'Kat' : 'Hond'})
                            {pet.breed && ` - ${pet.breed}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Final Notes */}
            <div>
              <label
                htmlFor='familyNotes'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Familie Notities (Optioneel)
              </label>
              <textarea
                id='familyNotes'
                value={familyData.notes}
                onChange={(e) =>
                  setFamilyData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                placeholder='Belangrijke informatie over deze familie...'
              />
            </div>

            {/* Final Confirmation */}
            <div className='p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg'>
              <h4 className='font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2'>
                <CheckCircle className='w-4 h-4' />
                Klaar om op te slaan
              </h4>
              <p className='text-sm text-green-700 dark:text-green-300'>
                {connectionType === 'new_family' &&
                  `Nieuwe familie "${familyData.familyName}" wordt aangemaakt met ${familyData.adults.length + familyData.children.length} leden.`}
                {connectionType === 'join_family' &&
                  `Gezinshereniging: ${familyData.adults.length + familyData.children.length} nieuwe leden sluiten aan bij bestaande familie.`}
                {connectionType === 'new_roommate' &&
                  `Nieuwe kamergenoot(oten) worden toegevoegd aan bestaande kamer.`}
                {connectionType === 'financial_dependent' &&
                  `Financieel afhankelijke personen worden gekoppeld aan bestaande bewoner.`}
                {connectionType === 'complex' &&
                  `Complexe situatie met aangepaste configuratie wordt opgeslagen.`}
              </p>
              {/* Validation Warnings */}
              {familyData.roomArrangement === 'join_room' &&
                !familyData.targetRoomId && (
                  <div className='mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200'>
                    ⚠️ Waarschuwing: Geen target kamer geselecteerd voor kamer
                    arrangement
                  </div>
                )}
              {familyData.financialArrangement === 'dependent' &&
                !familyData.financialUnitId && (
                  <div className='mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-sm text-yellow-800 dark:text-yellow-200'>
                    ⚠️ Waarschuwing: Geen financiële afhankelijkheid
                    gespecificeerd
                  </div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={modalClose.dismiss}
      title='Gezinsregistratie'
      size='xl'
      showCloseButton={true}
    >
      <div className='p-6'>
        {/* Progress Steps */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className='w-5 h-5' />
                    ) : (
                      <Icon className='w-5 h-5' />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className='flex justify-between mt-2'>
            {steps.map((step) => (
              <div
                key={step.id}
                className='text-xs text-center'
                style={{ width: '10%' }}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className='min-h-[400px] overflow-visible'>{renderStep()}</div>

        {/* Validation Errors */}
        {errors.familyAdult && (
          <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'>
            <p className='text-sm text-red-700'>❌ {errors.familyAdult}</p>
          </div>
        )}

        {errors.emptyFamily && (
          <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'>
            <p className='text-sm text-red-700'>❌ {errors.emptyFamily}</p>
          </div>
        )}

        {errors.roomCapacity && (
          <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'>
            <p className='text-sm text-red-700'>❌ {errors.roomCapacity}</p>
          </div>
        )}

        {errors.financialDependency && (
          <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'>
            <p className='text-sm text-red-700'>
              ❌ {errors.financialDependency}
            </p>
          </div>
        )}

        {errors.circularDependency && (
          <div className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'>
            <p className='text-sm text-red-700'>
              ❌ {errors.circularDependency}
            </p>
          </div>
        )}

        {/* Individual adult dependency errors */}
        {Object.keys(errors)
          .filter((key) => key.includes('adult') && key.includes('Dependency'))
          .map((errorKey) => (
            <div
              key={errorKey}
              className='p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg mt-6'
            >
              <p className='text-sm text-red-700'>❌ {errors[errorKey]}</p>
            </div>
          ))}

        {/* Navigation */}
        <div className='flex justify-between pt-6 border-t mt-8'>
          <Button
            variant='secondary'
            onClick={currentStep === 0 ? handleClose : prevStep}
            disabled={isSubmitting}
          >
            {currentStep === 0 ? (
              <>
                <X className='w-4 h-4 mr-1' />
                Annuleren
              </>
            ) : (
              <>
                <ArrowLeft className='w-4 h-4 mr-1' />
                Vorige
              </>
            )}
          </Button>

          <Button
            variant='primary'
            onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Save className='w-4 h-4 mr-1' />
                Familie Opslaan
              </>
            ) : (
              <>
                Volgende
                <ArrowRight className='w-4 h-4 ml-1' />
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FamilySetupWizard;
