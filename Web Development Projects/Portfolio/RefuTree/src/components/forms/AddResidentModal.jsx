import React, { useState, useEffect } from 'react';
import { 
  User, MapPin, Globe, Calendar, Phone, Mail, FileText, 
  AlertTriangle, CheckCircle, Upload, Plus, Minus, Save, 
  Shield, UserCheck, Star, Activity, Camera
} from 'lucide-react';
import ProfileImage from '../ui/ProfileImage.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const AddResidentModal = ({ isOpen, onClose, onSave, caseworkers = [], initialData, locationType = 'CNO' }) => {
  const [formData, setFormData] = useState({
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
      emergencyContact: ''
    },
    documents: [],
    photo: '',
    nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
    nummerWaarde: '',
    bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [bsnRequested, setBsnRequested] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      // Map vNumber/bsnNumber back to nummerWaarde for editing
      const mappedData = {
        ...initialData,
        nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
        nummerWaarde: locationType === 'CNO' ? initialData.vNumber : initialData.bsnNumber
      };
      setFormData(mappedData);
      setPhotoPreview(initialData.photo || '');
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
          emergencyContact: ''
        },
        documents: [],
        photo: '',
        nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
        nummerWaarde: locationType === 'CNO' ? `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}` : '',
        bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined
      });
      setPhotoPreview('');
      setBsnRequested(false);
    }
  }, [isOpen, initialData, locationType]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationaliteit is verplicht';
    }

    if (!formData.room.trim()) {
      newErrors.room = 'Kamer is verplicht';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Geboortedatum is verplicht';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefoonnummer is verplicht';
    }

    if (!formData.caseworker) {
      newErrors.caseworker = 'Begeleider is verplicht';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig email adres';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Ongeldig telefoonnummer';
    }

    // Nummer validatie
    if (locationType === 'CNO') {
      if (!formData.nummerWaarde.trim()) {
        newErrors.nummerWaarde = 'V-nummer is verplicht';
      }
    } else if (locationType === 'OEKRAINE') {
      if (!bsnRequested && !formData.nummerWaarde.trim()) {
        newErrors.nummerWaarde = 'BSN is verplicht of vink aan dat het is aangevraagd';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMedicalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: value
      }
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.medicalInfo.allergies.includes(newAllergy.trim())) {
      handleMedicalInfoChange('allergies', [...formData.medicalInfo.allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    const updatedAllergies = formData.medicalInfo.allergies.filter((_, i) => i !== index);
    handleMedicalInfoChange('allergies', updatedAllergies);
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.medicalInfo.medications.includes(newMedication.trim())) {
      handleMedicalInfoChange('medications', [...formData.medicalInfo.medications, newMedication.trim()]);
      setNewMedication('');
    }
  };

  const removeMedication = (index) => {
    const updatedMedications = formData.medicalInfo.medications.filter((_, i) => i !== index);
    handleMedicalInfoChange('medications', updatedMedications);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let newResident;
      if (initialData) {
        // Bewerk-modus: behoud id, vNumber, photo, etc.
        const updatedData = {
          ...initialData,
          ...formData,
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
        // Bereken leeftijd voor foto selectie
        const age = formData.birthDate ? new Date().getFullYear() - new Date(formData.birthDate).getFullYear() : 30;
        
        // Genereer automatisch een foto gebaseerd op gender en leeftijd
        const getRandomPhoto = (gender, age) => {
          // Gebruik Unsplash voor echte foto's
          const photos = {
            male: [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            ],
            female: [
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
              'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face'
            ]
          };
          
          const genderPhotos = photos[gender] || photos.male;
          const randomIndex = Math.floor(Math.random() * genderPhotos.length);
          return genderPhotos[randomIndex];
        };
        
        const generatedPhoto = formData.photo || getRandomPhoto(formData.gender, age);
        console.log('Generated photo URL:', generatedPhoto);
        
        // Map nummer fields correctly
        const residentData = {
          id: Date.now(),
          ...formData,
          locationType: locationType,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 20,
          photo: generatedPhoto
        };

        // Add correct number field based on locationType
        if (locationType === 'CNO') {
          residentData.vNumber = formData.nummerWaarde || `V-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
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
      onClose();
    } catch (error) {
      console.error('Error adding resident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
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
          emergencyContact: ''
        },
        documents: [],
        photo: '',
        nummerType: locationType === 'CNO' ? 'V-nummer' : 'BSN',
        nummerWaarde: '',
        bsnStatus: locationType === 'OEKRAINE' ? 'toegekend' : undefined
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Bewoner wijzigen' : 'Nieuwe Bewoner Toevoegen'}
      size="xl"
      showCloseButton={true}
    >

        <form onSubmit={handleSubmit} className="p-6">
          {/* Locatie type info */}
          <div className="mb-4">
            <span className="text-xs text-gray-500">Locatie type: <b>{locationType === 'CNO' ? 'CNO' : 'Oekraïense opvang'}</b></span>
          </div>
          {/* Nummer veld */}
          {locationType === 'CNO' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">V-nummer *</label>
              <input
                type="text"
                name="nummerWaarde"
                value={formData.nummerWaarde}
                onChange={e => setFormData(prev => ({ ...prev, nummerWaarde: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nummerWaarde ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Bijv. V-2024-001"
              />
              {errors.nummerWaarde && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  {errors.nummerWaarde}
                </p>
              )}
            </div>
          )}
          {locationType === 'OEKRAINE' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">BSN *</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="nummerWaarde"
                  value={bsnRequested ? '' : formData.nummerWaarde}
                  onChange={e => setFormData(prev => ({ ...prev, nummerWaarde: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nummerWaarde ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="BSN-nummer"
                  disabled={bsnRequested}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={bsnRequested}
                    onChange={e => {
                      setBsnRequested(e.target.checked);
                      setFormData(prev => ({ ...prev, bsnStatus: e.target.checked ? 'aangevraagd' : 'toegekend', nummerWaarde: e.target.checked ? '' : prev.nummerWaarde }));
                    }}
                  />
                  BSN is aangevraagd
                </label>
              </div>
              {errors.nummerWaarde && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  {errors.nummerWaarde}
                </p>
              )}
            </div>
          )}
          {/* Profielfoto upload en preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-[75px] h-[75px] mb-2">
              <ProfileImage
                src={formData.photo}
                name={formData.name}
                className="w-[75px] h-[75px] rounded-full object-cover border"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-xs text-gray-500">Klik op het camera-icoon om een foto te kiezen</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4" />
                Basis Informatie
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Volledige naam"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationaliteit *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nationality ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Land van herkomst"
                />
                {errors.nationality && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.nationality}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kamer *
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.room ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Bijv. A-101"
                />
                {errors.room && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.room}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="In procedure">In procedure</option>
                  <option value="Vergunninghouder">Vergunninghouder</option>
                  <option value="Tijdelijke bescherming">Tijdelijke bescherming</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioriteit
                </label>
                <select
                  name="priority"
                  value={formData.priority || "Normal"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normaal</option>
                  <option value="High">Hoog</option>
                  <option value="Low">Laag</option>
                </select>
              </div>
            </div>

            {/* Contact & Dates */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact & Datums
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+31 6 12345678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geboortedatum *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.birthDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geslacht
                </label>
                <select
                  name="gender"
                  value={formData.gender || "M"}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="M">Man</option>
                  <option value="F">Vrouw</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aankomstdatum
                </label>
                <input
                  type="date"
                  name="arrivalDate"
                  value={formData.arrivalDate || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taal
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Moedertaal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Begeleider *
                </label>
                <select
                  name="caseworker"
                  value={formData.caseworker || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.caseworker ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecteer begeleider</option>
                  {caseworkers.map(worker => (
                    <option key={worker} value={worker}>{worker}</option>
                  ))}
                </select>
                {errors.caseworker && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.caseworker}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Medische Informatie
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergieën
                </label>
                <div className="space-y-2">
                  {formData.medicalInfo.allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
                        {allergy}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Nieuwe allergie"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicatie
                </label>
                <div className="space-y-2">
                  {formData.medicalInfo.medications.map((medication, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {medication}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Nieuwe medicatie"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    />
                    <button
                      type="button"
                      onClick={addMedication}
                      className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Noodcontact
              </label>
              <input
                type="text"
                value={formData.medicalInfo.emergencyContact || ""}
                onChange={(e) => handleMedicalInfoChange('emergencyContact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam en telefoonnummer"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notities
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Belangrijke informatie over de bewoner..."
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              variant="primary"
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