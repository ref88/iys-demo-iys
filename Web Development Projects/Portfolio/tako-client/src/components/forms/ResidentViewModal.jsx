import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Shield,
  // Calendar, // Unused
  // Clock, // Unused
  User,
  FileText,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Edit,
  // Download, // Unused
  // Star, // Unused
  CheckCircle,
  // XCircle, // Unused
  Tag,
  Copy,
  // ExternalLink, // Unused
  Heart,
  // MessageCircle, // Unused
  // UserCheck, // Unused
  Globe,
  // Home, // Unused
  // Briefcase, // Unused
  // BookOpen, // Unused
  Heart as Hospital,
  // AlertCircle, // Unused
  // Settings, // Unused
  // MoreVertical, // Unused
  // Search, // Unused
  // Filter, // Unused
  // TrendingUp, // Unused
  // BarChart3, // Unused
  // PieChart, // Unused
  // Target, // Unused
  // Zap, // Unused
  // Award, // Unused
  // Flag, // Unused
  // Eye, // Unused
  // EyeOff, // Unused
  Maximize2,
  Minimize2,
  Printer,
  Share2,
  // Camera, // Unused
  // ChevronLeft, // Unused
  // ChevronRight, // Unused
  // RotateCcw, // Unused
  // Save, // Unused
  // Upload, // Unused
  Download as DownloadIcon,
} from 'lucide-react';
// import ProfileImage from '../ui/ProfileImage.jsx'; // Unused
import LabelSelector from '../features/LabelSelector.jsx';
import LabelChip from '../ui/LabelChip.jsx';
import PetsForResident from '../features/PetsForResident.jsx';
import PetForm from './PetForm.jsx';

// 🧮 Utility function to calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) {
    return null;
  }
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// 🎨 Modern Tab Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`relative inline-flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
      active
        ? 'border-blue-500 text-blue-600 bg-blue-50'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
    }`}
  >
    <Icon className='w-4 h-4 mr-2' />
    {label}
    {count !== undefined && (
      <span
        className={`ml-2 px-2 py-1 text-xs rounded-full ${
          active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// 📊 Info Card Component
const InfoCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = 'blue',
  action,
}) => (
  <div className='bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <h3 className='text-sm font-medium text-gray-500'>{title}</h3>
          <p className='text-lg font-semibold text-gray-900'>{value}</p>
          {subtitle && <p className='text-sm text-gray-500 mt-1'>{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
          {action}
        </button>
      )}
    </div>
  </div>
);

// 🏷️ Status Badge Component
const StatusBadge = ({ status, color }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
      color === 'green'
        ? 'bg-green-100 text-green-800'
        : color === 'yellow'
          ? 'bg-yellow-100 text-yellow-800'
          : color === 'blue'
            ? 'bg-blue-100 text-blue-800'
            : color === 'red'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
    }`}
  >
    {status}
  </span>
);

// 📋 Detail Section Component
const DetailSection = ({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      <div
        className={`p-6 ${collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }
              }
            : undefined
        }
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
      >
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          {collapsible && (
            <button className='p-1 text-gray-400 hover:text-gray-600 transition-colors'>
              {isOpen ? (
                <ChevronUp className='w-5 h-5' />
              ) : (
                <ChevronDown className='w-5 h-5' />
              )}
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <div className='px-6 pb-6 border-t border-gray-100'>{children}</div>
      )}
    </div>
  );
};

// 📱 Action Button Component
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
        : variant === 'danger'
          ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <Icon className='w-4 h-4 mr-2' />
    {label}
  </button>
);

// 🔄 Loading Skeleton Component
// const LoadingSkeleton = ({ className = 'h-4 bg-gray-200 rounded' }) => (
//   <div className={`animate-pulse ${className}`} />
// );

// 🎯 Main ResidentViewModal Component
const ResidentViewModal = ({
  resident,
  isOpen,
  onClose,
  onEdit,
  onLabelsUpdate,
  availableLabels = [],
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  // const [_showTooltip, _setShowTooltip] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState(resident?.labels || []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [showPetForm, setShowPetForm] = useState(false);
  const [, setPets] = useState([]);
  const [petsRefreshTrigger, setPetsRefreshTrigger] = useState(0);
  const modalRef = useRef(null);

  // 📊 Computed values
  const age = useMemo(
    () => calculateAge(resident?.birthDate),
    [resident?.birthDate]
  );
  const documentCount = useMemo(
    () => resident?.documents?.length || 0,
    [resident?.documents]
  );
  const labelCount = useMemo(
    () => selectedLabels?.length || 0,
    [selectedLabels]
  );

  // 🎨 Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Vergunninghouder':
        return 'green';
      case 'In procedure':
        return 'yellow';
      case 'Tijdelijke bescherming':
        return 'blue';
      case 'Afgewezen':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getAttendanceColor = (attendance) => {
    switch (attendance) {
      case 'Aanwezig':
        return 'green';
      case 'Op verlof':
        return 'blue';
      case 'Afwezig':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'red';
      case 'Normal':
        return 'blue';
      case 'Low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // 🗓️ Format date helper
  const formatDate = (dateString) => {
    if (!dateString) {
      return '-';
    }
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 🎯 Event handlers
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handlePrintProfile = () => {
    window.print();
  };

  const handleShareProfile = () => {
    // Share functionality
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 🐾 Load pets for this resident
  useEffect(() => {
    if (resident?.id) {
      const savedPets = localStorage.getItem('vms_pets');
      if (savedPets) {
        const allPets = JSON.parse(savedPets);
        const residentPets = allPets.filter(
          (pet) => pet.owners && pet.owners.includes(resident.id)
        );
        setPets(residentPets);
      }
    }
  }, [resident?.id]);

  // 🔒 Close handler with escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 📱 Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !resident) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl shadow-2xl transition-all duration-300 transform ${
          isFullscreen
            ? 'w-full h-full max-w-none max-h-none'
            : 'w-full max-w-6xl max-h-[95vh]'
        } overflow-hidden`}
      >
        {/* 🎨 Header */}
        <div className='relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <img
                  src={resident.photo}
                  alt={resident.name}
                  className='w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover'
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    resident.attendance === 'Aanwezig'
                      ? 'bg-green-500'
                      : resident.attendance === 'Op verlof'
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{resident.name}</h2>
                <p className='text-blue-100 flex items-center gap-2'>
                  <Globe className='w-4 h-4' />
                  {resident.nationality}
                  {age && <span>• {age} jaar</span>}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <ActionButton
                icon={Edit}
                label='Bewerken'
                onClick={() => onEdit(resident)}
                variant='secondary'
              />
              <button
                onClick={handleFullscreen}
                className='p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
              >
                {isFullscreen ? (
                  <Minimize2 className='w-5 h-5' />
                ) : (
                  <Maximize2 className='w-5 h-5' />
                )}
              </button>
              <button
                onClick={onClose}
                className='p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 Quick Stats */}
        <div className='p-6 border-b border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {resident.room}
              </div>
              <div className='text-sm text-gray-500'>Kamer</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {resident.leaveBalance || 0}
              </div>
              <div className='text-sm text-gray-500'>Verlof dagen</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {documentCount}
              </div>
              <div className='text-sm text-gray-500'>Documenten</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {labelCount}
              </div>
              <div className='text-sm text-gray-500'>Labels</div>
            </div>
          </div>
        </div>

        {/* 🎯 Navigation Tabs */}
        <div className='border-b border-gray-200 px-6'>
          <div className='flex space-x-1 overflow-x-auto'>
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={User}
              label='Overzicht'
            />
            <TabButton
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
              icon={FileText}
              label='Documenten'
              count={documentCount}
            />
            <TabButton
              active={activeTab === 'medical'}
              onClick={() => setActiveTab('medical')}
              icon={Hospital}
              label='Medisch'
            />
            <TabButton
              active={activeTab === 'labels'}
              onClick={() => setActiveTab('labels')}
              icon={Tag}
              label='Labels'
              count={labelCount}
            />
            <TabButton
              active={activeTab === 'activity'}
              onClick={() => setActiveTab('activity')}
              icon={Activity}
              label='Activiteit'
            />
          </div>
        </div>

        {/* 📄 Content Area */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* 👤 Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Status & Priority */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <InfoCard
                  icon={CheckCircle}
                  title='Status'
                  value={
                    <StatusBadge
                      status={resident.status}
                      color={getStatusColor(resident.status)}
                    />
                  }
                  subtitle={`Sinds ${formatDate(resident.arrivalDate)}`}
                  color={getStatusColor(resident.status)}
                />
                <InfoCard
                  icon={AlertTriangle}
                  title='Prioriteit'
                  value={resident.priority}
                  subtitle={
                    resident.priority === 'High'
                      ? 'Verhoogde aandacht vereist'
                      : 'Standaard behandeling'
                  }
                  color={getPriorityColor(resident.priority)}
                />
              </div>

              {/* Contact Information */}
              <DetailSection title='Contactgegevens'>
                <div className='space-y-4 mt-4'>
                  <div className='flex items-center space-x-3'>
                    <Phone className='w-5 h-5 text-gray-400' />
                    <span className='text-gray-900'>{resident.phone}</span>
                    <button
                      onClick={() => handleCopyToClipboard(resident.phone)}
                      className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <Copy className='w-4 h-4' />
                    </button>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Mail className='w-5 h-5 text-gray-400' />
                    <span className='text-gray-900'>{resident.email}</span>
                    <button
                      onClick={() => handleCopyToClipboard(resident.email)}
                      className='p-1 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <Copy className='w-4 h-4' />
                    </button>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <MapPin className='w-5 h-5 text-gray-400' />
                    <span className='text-gray-900'>Kamer {resident.room}</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Shield className='w-5 h-5 text-gray-400' />
                    <span className='text-gray-900'>
                      {resident.vNumber || resident.bsnNumber || 'Geen nummer'}
                    </span>
                  </div>
                </div>
              </DetailSection>

              {/* Personal Information */}
              <DetailSection title='Persoonlijke informatie'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                  <div>
                    <label
                      htmlFor='resident-view-birthdate'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Geboortedatum
                    </label>
                    <p className='text-gray-900'>
                      {formatDate(resident.birthDate)}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor='resident-view-age'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Leeftijd
                    </label>
                    <p className='text-gray-900'>{age || '-'} jaar</p>
                  </div>
                  <div>
                    <label
                      htmlFor='resident-view-gender'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Geslacht
                    </label>
                    <p className='text-gray-900'>
                      {resident.gender === 'M' ? 'Man' : 'Vrouw'}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor='resident-view-language'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Taal
                    </label>
                    <p className='text-gray-900'>{resident.language || '-'}</p>
                  </div>
                </div>
              </DetailSection>

              {/* Case Management */}
              <DetailSection title='Begeleiding'>
                <div className='space-y-4 mt-4'>
                  <div>
                    <label
                      htmlFor='resident-view-caseworker'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Begeleider
                    </label>
                    <p className='text-gray-900'>
                      {resident.caseworker || '-'}
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor='resident-view-attendance'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Aanwezigheid
                    </label>
                    <StatusBadge
                      status={resident.attendance}
                      color={getAttendanceColor(resident.attendance)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='resident-view-last-seen'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Laatst gezien
                    </label>
                    <p className='text-gray-900'>{resident.lastSeen || '-'}</p>
                  </div>
                  {resident.notes && (
                    <div>
                      <label
                        htmlFor='resident-view-notes'
                        className='block text-sm font-medium text-gray-500 mb-1'
                      >
                        Opmerkingen
                      </label>
                      <p className='text-gray-900 bg-gray-50 p-3 rounded-lg'>
                        {resident.notes}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          )}

          {/* 📋 Documents Tab */}
          {activeTab === 'documents' && (
            <div className='space-y-6'>
              <DetailSection title='Documenten overzicht'>
                <div className='mt-4'>
                  {resident.documents && resident.documents.length > 0 ? (
                    <div className='space-y-3'>
                      {resident.documents.map((doc, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                        >
                          <div className='flex items-center space-x-3'>
                            <FileText className='w-5 h-5 text-gray-400' />
                            <div>
                              <p className='font-medium text-gray-900'>
                                {doc.name}
                              </p>
                              <p className='text-sm text-gray-500'>
                                {doc.type}
                              </p>
                            </div>
                          </div>
                          <StatusBadge
                            status={doc.status}
                            color={
                              doc.status === 'Geverifieerd' ? 'green' : 'yellow'
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-gray-500'>
                      <FileText className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                      <p>Geen documenten beschikbaar</p>
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          )}

          {/* 🏥 Medical Tab */}
          {activeTab === 'medical' && (
            <div className='space-y-6'>
              <DetailSection title='Medische informatie'>
                <div className='mt-4 space-y-6'>
                  <div>
                    <label
                      htmlFor='resident-view-allergies'
                      className='block text-sm font-medium text-gray-500 mb-2'
                    >
                      Allergieën
                    </label>
                    {resident.medicalInfo?.allergies?.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {resident.medicalInfo.allergies.map(
                          (allergy, index) => (
                            <span
                              key={index}
                              className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm'
                            >
                              {allergy}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-gray-500'>Geen bekende allergieën</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='resident-view-medications'
                      className='block text-sm font-medium text-gray-500 mb-2'
                    >
                      Medicatie
                    </label>
                    {resident.medicalInfo?.medications?.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {resident.medicalInfo.medications.map(
                          (medication, index) => (
                            <span
                              key={index}
                              className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                            >
                              {medication}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className='text-gray-500'>Geen huidige medicatie</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='resident-view-pets'
                      className='block text-sm font-medium text-gray-500 mb-2'
                    >
                      Huisdieren
                    </label>
                    {showPetForm ? (
                      <PetForm
                        onSave={(pet) => {
                          // Update pets state
                          setPets((prev) => [...prev, pet]);

                          // Trigger refresh of PetsForResident
                          setPetsRefreshTrigger((prev) => prev + 1);

                          // Auto-assign pet labels if available
                          const petTypeLabel = availableLabels.find((label) =>
                            label.name
                              .toLowerCase()
                              .includes(pet.type.toLowerCase())
                          );

                          if (
                            petTypeLabel &&
                            selectedLabels &&
                            !selectedLabels.includes(petTypeLabel.id)
                          ) {
                            const newLabels = [
                              ...selectedLabels,
                              petTypeLabel.id,
                            ];
                            setSelectedLabels(newLabels);
                            onLabelsUpdate && onLabelsUpdate(newLabels);
                          }

                          setShowPetForm(false);
                        }}
                        onCancel={() => setShowPetForm(false)}
                        residentId={resident.id}
                        residentName={resident.name}
                      />
                    ) : (
                      <div className='space-y-3'>
                        <PetsForResident
                          residentId={resident.id}
                          refreshTrigger={petsRefreshTrigger}
                        />
                        <button
                          onClick={() => setShowPetForm(true)}
                          className='w-full bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium'
                        >
                          <Heart className='w-4 h-4' />
                          Huisdier Toevoegen
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='resident-view-emergency-contact'
                      className='block text-sm font-medium text-gray-500 mb-1'
                    >
                      Contactpersoon bij noodgeval
                    </label>
                    <p className='text-gray-900'>
                      {resident.medicalInfo?.emergencyContact || '-'}
                    </p>
                  </div>
                </div>
              </DetailSection>
            </div>
          )}

          {/* 🏷️ Labels Tab */}
          {activeTab === 'labels' && (
            <div className='space-y-6'>
              <DetailSection title='Labels beheer'>
                <div className='mt-4'>
                  {selectedLabels?.length > 0 ? (
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {selectedLabels.map((labelId, index) => {
                        const label = availableLabels.find(
                          (l) => l.id === labelId
                        );
                        return label ? (
                          <LabelChip key={index} label={label} />
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className='text-gray-500 mb-4'>Geen labels toegewezen</p>
                  )}

                  <ActionButton
                    icon={Tag}
                    label='Labels bewerken'
                    onClick={() => setShowLabelsModal(true)}
                    variant='secondary'
                  />
                </div>
              </DetailSection>
            </div>
          )}

          {/* 📊 Activity Tab */}
          {activeTab === 'activity' && (
            <div className='space-y-6'>
              <DetailSection title='Recente activiteit'>
                <div className='mt-4'>
                  <div className='space-y-4'>
                    <div className='flex items-center space-x-3 text-sm'>
                      <div className='w-2 h-2 bg-green-500 rounded-full' />
                      <span className='text-gray-600'>Profiel bekeken</span>
                      <span className='text-gray-400 ml-auto'>Nu</span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm'>
                      <div className='w-2 h-2 bg-blue-500 rounded-full' />
                      <span className='text-gray-600'>
                        Aanwezigheid gecontroleerd
                      </span>
                      <span className='text-gray-400 ml-auto'>
                        2 uur geleden
                      </span>
                    </div>
                    <div className='flex items-center space-x-3 text-sm'>
                      <div className='w-2 h-2 bg-yellow-500 rounded-full' />
                      <span className='text-gray-600'>Document geüpload</span>
                      <span className='text-gray-400 ml-auto'>
                        1 dag geleden
                      </span>
                    </div>
                  </div>
                </div>
              </DetailSection>
            </div>
          )}
        </div>

        {/* 🎯 Footer Actions */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center space-x-3'>
            <ActionButton
              icon={Printer}
              label='Afdrukken'
              onClick={handlePrintProfile}
              variant='secondary'
            />
            <ActionButton
              icon={Share2}
              label='Delen'
              onClick={handleShareProfile}
              variant='secondary'
            />
            <ActionButton
              icon={DownloadIcon}
              label='Exporteren'
              onClick={() => {}}
              variant='secondary'
            />
          </div>

          <div className='flex items-center space-x-3'>
            <ActionButton
              icon={Edit}
              label='Bewerken'
              onClick={() => onEdit(resident)}
              variant='primary'
            />
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>

      {/* 🏷️ Labels Modal */}
      {showLabelsModal && (
        <div className='fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-50'>
          <div className='bg-white rounded-xl max-w-md w-full p-6'>
            <h3 className='text-lg font-semibold mb-4'>Labels bewerken</h3>
            <LabelSelector
              selectedLabels={selectedLabels}
              onLabelsChange={setSelectedLabels}
              availableLabels={availableLabels}
            />
            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => setShowLabelsModal(false)}
                className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors'
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  onLabelsUpdate && onLabelsUpdate(selectedLabels);
                  setShowLabelsModal(false);
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors'
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default ResidentViewModal;
