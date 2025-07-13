// @ts-nocheck
/* eslint-disable */
/*
=================================================================
🗄️ ARCHIVED COMPONENT - DO NOT USE IN PRODUCTION
=================================================================
This component has been archived and replaced by VMSLayout.jsx + VMSRefactored.jsx
It contains valuable code patterns and implementations that may
be useful for future development.

Original Features:
- Complex state management with useReducer (6,646 lines)
- Advanced sidebar with collapsible functionality
- Comprehensive resident management system
- Modal management and form handling
- Dashboard with real-time statistics
- Label management system
- Document handling
- Advanced filtering and search
- Audit trail functionality
- Multi-language support foundations

⚠️  IMPORTANT: This code is NOT maintained and may be outdated
✅  Safe to reference for code patterns and ideas
❌  Do NOT import or use directly

Replaced by: VMSLayout.jsx + VMSRefactored.jsx
Last Active: January 2025
Archived: Contains proven patterns for state management, complex UI, business logic
=================================================================
*/

// ARCHIVED CODE - DO NOT USE
/*
import React, { useState, useReducer, useCallback } from 'react';
import {
  User,
  Users,
  Bell,
  Check,
  Eye,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Archive,
  List,
  LayoutGrid,
  ArrowUpDown,
  SlidersHorizontal,
  Cat,
  Dog,
  FileText,
  Home,
  Calendar,
  Tag,
  BarChart,
  Activity,
  Settings,
  Sun,
  Moon,
  LogOut,
  Search,
  Grid3X3,
  Filter,
  ChevronDown,
  Heart,
  Baby,
  Clock,
  Shield,
  Crown,
  UserCog,
  X,
  Globe,
  Phone,
  Trash2,
  Star,
  Camera,
  Mail,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useDarkMode } from '../../contexts/DarkModeContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import useAuditNotifications from '../../hooks/useAuditNotifications.js';
import { auditHelpers } from '../../utils/auditLogger.js';
import AutocompleteSelect from '../ui/AutocompleteSelect.jsx';
import FamilySetupWizard from '../forms/FamilySetupWizard.jsx';
import AuditTrail from './AuditTrail.jsx';
import LabelsManager from './LabelsManager.jsx';
import Tooltip from '../ui/Tooltip.jsx';

// Helper function to calculate age from birth date
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

// Helper function to get automatic age-based labels
const getAutomaticLabels = (
  birthDate,
  registrationDate = null,
  type = 'human',
  isVaccinated = false,
  nextVaccinationDate = null,
  isChipped = false,
  isSterilized = false
) => {
  const automaticLabels = [];

  // Animal type labels
  if (type === 'cat') {
    automaticLabels.push('l10'); // Kat
  } else if (type === 'dog') {
    automaticLabels.push('l11'); // Hond
  }

  // Vaccination labels for animals
  if (type !== 'human') {
    if (isVaccinated) {
      automaticLabels.push('l12'); // Ingeënt
    } else if (nextVaccinationDate) {
      const nextVacDate = new Date(nextVaccinationDate);
      const today = new Date();
      if (
        nextVacDate <= today ||
        nextVacDate - today <= 7 * 24 * 60 * 60 * 1000
      ) {
        automaticLabels.push('l13'); // Vaccinatie Nodig
      }
    }

    // Chip status
    if (isChipped) {
      automaticLabels.push('l14'); // Gechipt
    }

    // Sterilization status
    if (isSterilized) {
      automaticLabels.push('l15'); // Gesteriliseerd
    }
  }

  // Human age-based labels
  if (type === 'human') {
    const age = calculateAge(birthDate);
    if (age !== null) {
      if (age < 2) {
        automaticLabels.push('l8'); // Baby
      }
      if (age < 18) {
        automaticLabels.push('l3'); // Minderjarig
      }
      if (age >= 65) {
        automaticLabels.push('l7'); // Senior
      }
    }
  }

  // New resident label (for 1 month after registration)
  if (registrationDate) {
    const regDate = new Date(registrationDate);
    const oneMonthLater = new Date(regDate);
    oneMonthLater.setMonth(regDate.getMonth() + 1);
    const today = new Date();

    if (today <= oneMonthLater) {
      automaticLabels.push('l4'); // Nieuw
    }
  }

  return automaticLabels;
};

// Helper function to update pet owner labels
const updatePetOwnerLabels = (residents) => {
  return residents.map((resident) => {
    if (resident.type === 'human') {
      // Check if this human has any active (non-archived) pets in their family
      const hasPets = residents.some(
        (r) =>
          r.type !== 'human' &&
          !r.isArchived && // Only count active pets
          r.familyId === resident.familyId &&
          r.familyMembers &&
          r.familyMembers.includes(resident.id)
      );

      // Only adults (18+) can be pet owners
      const age = calculateAge(resident.birthDate);
      const isAdult = age !== null && age >= 18;

      // Add or remove pet owner label
      const hasOwnerLabel = resident.labels.includes('l24');
      if (hasPets && isAdult && !hasOwnerLabel) {
        return { ...resident, labels: [...resident.labels, 'l24'] };
      } else if ((!hasPets || !isAdult) && hasOwnerLabel) {
        return {
          ...resident,
          labels: resident.labels.filter((l) => l !== 'l24'),
        };
      }
    }
    return resident;
  });
};

// Initial state structure
const initialState = {
  // Navigation & UI
  activeView: 'dashboard',
  sidebarCollapsed: false,

  // Data
  residents: [
    {
      id: 'r1',
      name: 'Ahmed Hassan',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      birthDate: '1989-03-15',
      gender: 'M',
      type: 'human',
      nationality: 'Syria',
      roomNumber: '204',
      labels: ['l1', 'l2', 'l24'], // Urgent, Medisch, Huisdier Eigenaar
      registrationDate: '2024-01-15',
      familyId: 'fam_001',
      familyRole: 'parent',
      familyMembers: ['r4', 'r5', 'r7'], // References to Sara (child), Maria (spouse), and Buddy (pet)
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    {
      id: 'r2',
      name: 'Fatima Al-Rashid',
      firstName: 'Fatima',
      lastName: 'Al-Rashid',
      birthDate: '2007-08-22',
      gender: 'V',
      type: 'human',
      nationality: 'Afghanistan',
      roomNumber: '108',
      labels: ['l3', 'l4', 'l6'], // Minderjarig, Nieuw, Kwetsbaar
      registrationDate: '2024-02-01',
      familyId: null,
      familyRole: null,
      familyMembers: [],
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    {
      id: 'r3',
      name: 'Ivan Petrov',
      firstName: 'Ivan',
      lastName: 'Petrov',
      birthDate: '1982-11-08',
      gender: 'M',
      type: 'human',
      nationality: 'Ukraine',
      roomNumber: '312',
      labels: ['l5'], // Meldplicht
      registrationDate: '2023-12-10',
      familyId: null,
      familyRole: null,
      familyMembers: [],
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    // Add sample child to demonstrate family
    {
      id: 'r4',
      name: 'Sara Hassan',
      firstName: 'Sara',
      lastName: 'Hassan',
      birthDate: '2015-12-10',
      gender: 'V',
      type: 'human',
      nationality: 'Syria',
      roomNumber: '204',
      labels: ['l3'], // Minderjarig
      registrationDate: '2024-01-15',
      familyId: 'fam_001',
      familyRole: 'child',
      familyMembers: ['r1', 'r5', 'r7'], // References to Ahmed (father), Maria (stepmother), and Buddy (family pet)
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    // Add sample couple with different surnames
    {
      id: 'r5',
      name: 'Maria Santos',
      firstName: 'Maria',
      lastName: 'Santos',
      birthDate: '1991-09-25',
      gender: 'V',
      type: 'human',
      nationality: 'Colombia',
      roomNumber: '204', // Same room as Ahmed
      labels: ['l4', 'l24'], // Nieuw, Huisdier Eigenaar
      registrationDate: '2024-01-15', // Same arrival date as Ahmed
      familyId: 'fam_001',
      familyRole: 'spouse',
      familyMembers: ['r1', 'r4', 'r7'], // References to Ahmed (husband), Sara (stepdaughter), and Buddy (family pet)
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    // Add another test couple
    {
      id: 'r6',
      name: 'Elena Popović',
      firstName: 'Elena',
      lastName: 'Popović',
      birthDate: '1995-06-14',
      gender: 'V',
      type: 'human',
      nationality: 'Serbia',
      roomNumber: '115',
      labels: [],
      registrationDate: '2024-02-15',
      familyId: null,
      familyRole: null,
      familyMembers: [],
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    {
      id: 'r6',
      name: 'Whiskers',
      firstName: 'Whiskers',
      lastName: '',
      birthDate: '2020-05-15',
      gender: 'F',
      type: 'cat',
      breed: 'Europese Korthaar',
      roomNumber: '108',
      labels: ['l10', 'l12', 'l14'], // Cat, Vaccinated, Chipped
      registrationDate: '2024-02-15',
      familyId: null,
      familyRole: null,
      familyMembers: [],
      isVaccinated: true,
      isChipped: true,
      isSterilized: true,
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
    {
      id: 'r7',
      name: 'Buddy',
      firstName: 'Buddy',
      lastName: '',
      birthDate: '2019-08-10',
      gender: 'M',
      type: 'dog',
      breed: 'Franse Bulldog',
      roomNumber: '204',
      labels: ['l11', 'l13', 'l14'], // Dog, Needs vaccination, Chipped
      registrationDate: '2024-01-20',
      familyId: 'fam_001',
      familyRole: 'pet',
      familyMembers: ['r1'],
      isVaccinated: false,
      isChipped: true,
      isSterilized: false,
      nextVaccinationDate: '2024-04-15',
      labelHistory: [],
      isArchived: false,
      archiveReason: '',
      archiveDate: '',
      archiveCustomText: '',
    },
  ],
  leaveRequests: [],
  documents: [],
  incidents: [],
  labels: [
    { id: 'l1', name: 'Urgent', color: 'red', icon: 'AlertCircle' },
    { id: 'l2', name: 'Medisch', color: 'blue', icon: 'Heart' },
    {
      id: 'l3',
      name: 'Minderjarig',
      color: 'purple',
      icon: 'Baby',
      automatic: true,
    },
    {
      id: 'l4',
      name: 'Nieuw',
      color: 'green',
      icon: 'UserPlus',
      automatic: true,
    },
    { id: 'l5', name: 'Meldplicht', color: 'orange', icon: 'Clock' },
    { id: 'l6', name: 'Kwetsbaar', color: 'pink', icon: 'Shield' },
    {
      id: 'l7',
      name: 'Senior',
      color: 'orange',
      icon: 'Crown',
      automatic: true,
    },
    { id: 'l8', name: 'Baby', color: 'pink', icon: 'Baby', automatic: true },
    { id: 'l9', name: 'Rolstoel', color: 'blue', icon: 'UserCog' },
    { id: 'l10', name: 'Kat', color: 'purple', icon: 'Cat', automatic: true },
    { id: 'l11', name: 'Hond', color: 'orange', icon: 'Dog', automatic: true },
    {
      id: 'l12',
      name: 'Ingeënt',
      color: 'green',
      icon: 'Shield',
      automatic: true,
    },
    {
      id: 'l13',
      name: 'Vaccinatie Nodig',
      color: 'red',
      icon: 'AlertCircle',
      automatic: true,
    },
    { id: 'l14', name: 'Gechipt', color: 'blue', icon: 'Zap', automatic: true },
    {
      id: 'l15',
      name: 'Gesteriliseerd',
      color: 'pink',
      icon: 'Shield',
      automatic: true,
    },
    {
      id: 'l16',
      name: 'Incompleet Profiel',
      color: 'amber',
      icon: 'AlertTriangle',
      automatic: true,
    },
    {
      id: 'l17',
      name: 'Ooievaarspas',
      color: 'blue',
      icon: 'CreditCard',
      automatic: true,
    },
    {
      id: 'l18',
      name: 'ZZP',
      color: 'green',
      icon: 'Briefcase',
      automatic: true,
    },
    {
      id: 'l19',
      name: 'Loondienst',
      color: 'green',
      icon: 'Building',
      automatic: true,
    },
    {
      id: 'l20',
      name: 'Leefgeld',
      color: 'orange',
      icon: 'Euro',
      automatic: true,
    },
    {
      id: 'l21',
      name: 'Jumbo Kaarten',
      color: 'yellow',
      icon: 'ShoppingCart',
      automatic: true,
    },
    {
      id: 'l22',
      name: 'Incomplete Huisdieren',
      color: 'amber',
      icon: 'AlertTriangle',
      automatic: true,
    },
    {
      id: 'l23',
      name: 'Alleen Huisdieren',
      color: 'purple',
      icon: 'Heart',
      automatic: true,
    },
    {
      id: 'l24',
      name: 'Huisdier Eigenaar',
      color: 'green',
      icon: 'Heart',
      automatic: true,
    },
  ],
  labelGroups: {
    urgent: ['l1', 'l5'],
    medical: ['l2'],
    administrative: ['l4', 'l5'],
    social: ['l3', 'l6'],
  },

  // Modals
  modals: {
    addResident: false,
    viewResident: false,
    addLeaveRequest: false,
    addDocument: false,
    addLabel: false,
    labelsManager: false,
    familyWizard: false,
    archiveResident: false,
  },

  // Selected items
  selectedResident: null,
  selectedDocument: null,

  // Form data
  residentForm: {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '', // 'M', 'V', ''
    nationality: '',
    roomNumber: '',
    labels: [],
    arrivalDate: new Date().toISOString().split('T')[0],
    phone: '',
    email: '',
    emergencyContact: {
      firstName: '',
      lastName: '',
      gender: '',
      relationship: '',
      phone: '',
    },
    bsn: '',
    notes: '',
    // Animal-specific fields
    type: 'human', // 'human', 'cat', 'dog'
    breed: '',
    weight: '',
    isVaccinated: false,
    vaccinationDate: '',
    nextVaccinationDate: '',
    isChipped: false,
    chipNumber: '',
    isSterilized: false,
    sterilizationDate: '',
    isArchived: false,
    archiveReason: '', // 'overleden', 'verhuisd', 'overgedragen', 'vermist', 'medisch', 'andere'
    archiveDate: '',
    archiveCustomText: '',
    documents: {
      hasPassport: false,
      hasResidencePermit: false,
      hasRegistration: false,
    },
    // Label form data
    newLabel: {
      name: '',
      color: 'blue',
      icon: 'Tag',
    },
    editLabel: null,
    // Family form data
    familySuggestions: [],
    showFamilySuggestions: false,
  },

  // Filters & Search
  searchQuery: '',
  viewMode: 'cards', // 'table', 'cards', 'grid'
  sortBy: 'name',
  sortOrder: 'asc', // 'asc', 'desc'
  filtersExpanded: false,
  filterSearchQuery: '',
  filters: {
    status: 'all',
    location: 'all',
    labels: [],
    ageRange: { min: '', max: '' },
    nationality: 'all',
    hasDocuments: 'all', // 'all', 'complete', 'incomplete'
    arrivalDateRange: { start: '', end: '' },
    familyStatus: 'all', // 'all', 'families', 'individuals', 'parents', 'children'
    archiveStatus: 'active', // 'active', 'archived', 'all'
  },

  // Loading states
  loading: {
    residents: false,
    leaveRequests: false,
    documents: false,
  },
};

// Reducer function to handle state updates
function vmsReducer(state, action) {
  switch (action.type) {
    // Navigation actions
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    // Modal actions
    case 'OPEN_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true },
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: false },
      };

    // Resident actions
    case 'SET_RESIDENTS':
      return { ...state, residents: action.payload };

    case 'ADD_RESIDENT': {
      const newResidentRegDate = new Date().toISOString();
      const automaticLabels = getAutomaticLabels(
        action.payload.birthDate,
        newResidentRegDate,
        action.payload.type || 'human',
        action.payload.isVaccinated || false,
        action.payload.nextVaccinationDate,
        action.payload.isChipped || false,
        action.payload.isSterilized || false
      );
      const manualLabels = action.payload.labels || [];
      const allLabels = [...new Set([...automaticLabels, ...manualLabels])]; // Remove duplicates

      const newResident = {
        ...action.payload,
        id: `r${Date.now()}`,
        name:
          action.payload.type === 'human'
            ? `${action.payload.firstName} ${action.payload.lastName}`
            : action.payload.firstName, // Animals only have first name
        labels: allLabels,
        registrationDate: newResidentRegDate,
        labelHistory: action.payload.labelHistory || [],
        familyMembers: action.payload.familyMembers || [],
        isArchived: action.payload.isArchived || false,
        archiveReason: action.payload.archiveReason || '',
        archiveDate: action.payload.archiveDate || '',
        archiveCustomText: action.payload.archiveCustomText || '',
        // Clean up temporary fields
        tempFamilyConnection: undefined,
      };

      // Update family members if this resident has family
      let updatedResidents = state.residents;
      if (newResident.familyId && newResident.familyMembers) {
        updatedResidents = state.residents.map((r) => {
          if (newResident.familyMembers.includes(r.id)) {
            return {
              ...r,
              familyId: newResident.familyId,
              familyMembers: [...(r.familyMembers || []), newResident.id],
            };
          }
          return r;
        });
      }

      const residentsWithNewResident = [...updatedResidents, newResident];
      const residentsWithUpdatedLabels = updatePetOwnerLabels(
        residentsWithNewResident
      );

      return {
        ...state,
        residents: residentsWithUpdatedLabels,
        modals: { ...state.modals, addResident: false },
        residentForm: initialState.residentForm, // Reset form
      };
    }

    case 'UPDATE_RESIDENT': {
      const updateAutomaticLabels = getAutomaticLabels(
        action.payload.birthDate,
        action.payload.registrationDate,
        action.payload.type || 'human',
        action.payload.isVaccinated || false,
        action.payload.nextVaccinationDate,
        action.payload.isChipped || false,
        action.payload.isSterilized || false
      );
      const updateManualLabels = action.payload.labels
        ? action.payload.labels.filter((labelId) => {
            const label = state.labels.find((l) => l.id === labelId);
            return !label?.automatic; // Keep only manual labels
          })
        : [];
      const updateAllLabels = [
        ...new Set([...updateAutomaticLabels, ...updateManualLabels]),
      ];

      const updatedResidentsUpdate = state.residents.map((r) =>
        r.id === action.payload.id
          ? { ...action.payload, labels: updateAllLabels }
          : r
      );
      const residentsWithUpdatedLabelsUpdate = updatePetOwnerLabels(
        updatedResidentsUpdate
      );

      return {
        ...state,
        residents: residentsWithUpdatedLabelsUpdate,
      };
    }

    case 'DELETE_RESIDENT':
      return {
        ...state,
        residents: state.residents.filter((r) => r.id !== action.payload),
      };

    // Search & Filter actions
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'TOGGLE_FILTERS_EXPANDED':
      return { ...state, filtersExpanded: !state.filtersExpanded };

    case 'SET_FILTER_SEARCH_QUERY':
      return { ...state, filterSearchQuery: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        searchQuery: '',
        filters: {
          status: 'all',
          location: 'all',
          labels: [],
          ageRange: { min: '', max: '' },
          nationality: 'all',
          hasDocuments: 'all',
          arrivalDateRange: { start: '', end: '' },
          familyStatus: 'all',
          archiveStatus: 'active',
        },
      };

    // Loading actions
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    // Label actions
    case 'CREATE_LABEL':
      return {
        ...state,
        labels: [...state.labels, { ...action.payload, id: `l${Date.now()}` }],
      };

    case 'UPDATE_LABEL':
      return {
        ...state,
        labels: state.labels.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };

    case 'DELETE_LABEL':
      return {
        ...state,
        labels: state.labels.filter((l) => l.id !== action.payload),
        // Also remove from residents
        residents: state.residents.map((r) => ({
          ...r,
          labels: r.labels.filter((labelId) => labelId !== action.payload),
        })),
      };

    case 'TOGGLE_RESIDENT_LABEL':
      return {
        ...state,
        residents: state.residents.map((r) => {
          if (r.id === action.payload.residentId) {
            const hasLabel = r.labels.includes(action.payload.labelId);
            const labelName =
              state.labels.find((l) => l.id === action.payload.labelId)?.name ||
              'Onbekend';

            // Create history entry
            const historyEntry = {
              id: Date.now(),
              labelId: action.payload.labelId,
              labelName,
              action: hasLabel ? 'removed' : 'added',
              timestamp: new Date().toISOString(),
              reason: action.payload.reason || 'Manual change',
            };

            return {
              ...r,
              labels: hasLabel
                ? r.labels.filter((id) => id !== action.payload.labelId)
                : [...r.labels, action.payload.labelId],
              labelHistory: [
                ...(Array.isArray(r.labelHistory) ? r.labelHistory : []),
                historyEntry,
              ],
            };
          }
          return r;
        }),
      };

    // Archive actions
    case 'ARCHIVE_RESIDENT': {
      const updatedResidentsArchive = state.residents.map((r) => {
        if (r.id === action.payload.residentId) {
          // Create history entry for archiving
          const historyEntry = {
            id: Date.now(),
            labelId: null,
            labelName: null,
            action: 'archived',
            timestamp: new Date().toISOString(),
            reason: `Gearchiveerd: ${action.payload.reason}${action.payload.customText ? ` - ${action.payload.customText}` : ''}`,
          };

          return {
            ...r,
            isArchived: true,
            archiveReason: action.payload.reason,
            archiveDate: new Date().toISOString(),
            archiveCustomText: action.payload.customText || '',
            labelHistory: [
              ...(Array.isArray(r.labelHistory) ? r.labelHistory : []),
              historyEntry,
            ],
          };
        }
        return r;
      });

      // Update pet owner labels after archiving
      const residentsWithUpdatedLabelsArchive = updatePetOwnerLabels(
        updatedResidentsArchive
      );

      return {
        ...state,
        residents: residentsWithUpdatedLabelsArchive,
      };
    }

    case 'RESTORE_RESIDENT': {
      const updatedResidentsRestore = state.residents.map((r) => {
        if (r.id === action.payload.residentId) {
          // Create history entry for restoring
          const historyEntry = {
            id: Date.now(),
            labelId: null,
            labelName: null,
            action: 'restored',
            timestamp: new Date().toISOString(),
            reason: action.payload.reason || 'Hersteld uit archief',
          };

          return {
            ...r,
            isArchived: false,
            archiveReason: '',
            archiveDate: '',
            archiveCustomText: '',
            labelHistory: [
              ...(Array.isArray(r.labelHistory) ? r.labelHistory : []),
              historyEntry,
            ],
          };
        }
        return r;
      });

      // Update pet owner labels after restoring
      const residentsWithUpdatedLabelsRestore = updatePetOwnerLabels(
        updatedResidentsRestore
      );

      return {
        ...state,
        residents: residentsWithUpdatedLabelsRestore,
      };
    }

    // Family actions
    case 'SET_FAMILY_SUGGESTIONS':
      return {
        ...state,
        residentForm: {
          ...state.residentForm,
          familySuggestions: Array.isArray(action.payload)
            ? action.payload
            : [],
          showFamilySuggestions:
            Array.isArray(action.payload) && action.payload.length > 0,
        },
      };

    case 'CREATE_FAMILY': {
      const familyId = `fam_${Date.now()}`;
      const { parentId, childIds, familyRole } = action.payload;

      return {
        ...state,
        residents: state.residents.map((r) => {
          if (r.id === parentId) {
            return {
              ...r,
              familyId,
              familyRole: 'parent',
              familyMembers: childIds,
            };
          }
          if (childIds.includes(r.id)) {
            return {
              ...r,
              familyId,
              familyRole: familyRole || 'child',
              familyMembers: [
                parentId,
                ...childIds.filter((id) => id !== r.id),
              ],
            };
          }
          return r;
        }),
      };
    }

    case 'ADD_TO_FAMILY': {
      const { residentId, targetFamilyId, role } = action.payload;

      return {
        ...state,
        residents: state.residents.map((r) => {
          if (r.id === residentId) {
            // Add resident to family
            return {
              ...r,
              familyId: targetFamilyId,
              familyRole: role,
              familyMembers: state.residents
                .filter(
                  (resident) =>
                    resident.familyId === targetFamilyId &&
                    resident.id !== residentId
                )
                .map((resident) => resident.id),
            };
          }
          if (r.familyId === targetFamilyId) {
            // Update existing family members
            return {
              ...r,
              familyMembers: [
                ...r.familyMembers.filter((id) => id !== residentId),
                residentId,
              ],
            };
          }
          return r;
        }),
      };
    }

    case 'REMOVE_FROM_FAMILY':
      return {
        ...state,
        residents: state.residents.map((r) => {
          if (r.id === action.payload) {
            return {
              ...r,
              familyId: null,
              familyRole: null,
              familyMembers: [],
            };
          }
          if (r.familyMembers.includes(action.payload)) {
            return {
              ...r,
              familyMembers: r.familyMembers.filter(
                (id) => id !== action.payload
              ),
            };
          }
          return r;
        }),
      };

    // Form actions
    case 'UPDATE_RESIDENT_FORM':
      return {
        ...state,
        residentForm: { ...state.residentForm, ...action.payload },
      };

    case 'RESET_RESIDENT_FORM':
      return {
        ...state,
        residentForm: initialState.residentForm,
      };

    case 'SET_SELECTED_RESIDENT':
      return {
        ...state,
        selectedResident: action.payload,
        residentForm: action.payload
          ? {
              ...action.payload,
              firstName:
                action.payload.firstName ||
                action.payload.name?.split(' ')?.[0] ||
                '',
              lastName:
                action.payload.lastName ||
                action.payload.name?.split(' ')?.slice(1)?.join(' ') ||
                '',
              birthDate: action.payload.birthDate || '',
              arrivalDate:
                action.payload.arrivalDate ||
                action.payload.registrationDate?.split('T')?.[0],
              labels: Array.isArray(action.payload.labels)
                ? action.payload.labels
                : [],
              familyMembers: Array.isArray(action.payload.familyMembers)
                ? action.payload.familyMembers
                : [],
              labelHistory: Array.isArray(action.payload.labelHistory)
                ? action.payload.labelHistory
                : [],
            }
          : initialState.residentForm,
      };

    // Default
    default:
      return state;
  }
}

// Basic VMS Component - Starting from scratch
const VMS = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { notify } = useNotifications();
  const {
    processAuditEntry,
    getNotificationSettings,
    saveNotificationSettings,
    // DEFAULT_SETTINGS: _DEFAULT_SETTINGS,
  } = useAuditNotifications();
  const [state, dispatch] = useReducer(vmsReducer, initialState);

  // Helper functions
  const setView = (view) => dispatch({ type: 'SET_VIEW', payload: view });
  const openModal = (modal) => dispatch({ type: 'OPEN_MODAL', payload: modal });
  const closeModal = (modal) =>
    dispatch({ type: 'CLOSE_MODAL', payload: modal });

  // BSN validation function
  const validateBSN = (bsn) => {
    if (!bsn) {
      return { valid: true, message: '' };
    } // Empty is allowed

    // Remove spaces and validate format
    const cleanBSN = bsn.replace(/\s/g, '');

    // Must be exactly 9 digits
    if (!/^\d{9}$/.test(cleanBSN)) {
      return { valid: false, message: 'BSN moet exact 9 cijfers bevatten' };
    }

    // BSN 11-proof check (elfproef)
    const digits = cleanBSN.split('').map(Number);
    const checksum =
      digits
        .slice(0, 8)
        .reduce((sum, digit, index) => sum + digit * (9 - index), 0) -
      digits[8];

    if (checksum % 11 !== 0) {
      return { valid: false, message: 'Ongeldig BSN nummer (11-proef)' };
    }

    // Check uniqueness
    const existingResident = state.residents.find(
      (r) => r.bsn === cleanBSN && r.id !== state.selectedResident?.id
    );

    if (existingResident) {
      return {
        valid: false,
        message: `BSN al in gebruik door ${existingResident.name}`,
      };
    }

    return { valid: true, message: 'Geldig BSN nummer' };
  };

  // Format BSN for display (add spaces)
  const formatBSN = (bsn) => {
    if (!bsn) {
      return '';
    }
    const cleaned = bsn.replace(/\s/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  // Family suggestion engine
  const findFamilySuggestions = useCallback(
    (newResident) => {
      if (
        !newResident.firstName ||
        !newResident.lastName ||
        !newResident.birthDate
      ) {
        return [];
      }

      const suggestions = [];

      // Find potential family members using multiple detection methods
      const potentialFamily = state.residents.filter((r) => {
        if (r.id === newResident.id) {
          return false;
        } // Not self

        // Method 1: Traditional surname matching
        const surnameMatch = r.lastName === newResident.lastName;

        // Method 2: Couple detection (same arrival date + similar age)
        const arrivalDate1 = new Date(r.registrationDate || r.arrivalDate);
        const arrivalDate2 = new Date(
          newResident.arrivalDate || newResident.registrationDate
        );
        const sameArrival =
          Math.abs(arrivalDate1 - arrivalDate2) <= 24 * 60 * 60 * 1000; // Within 1 day
        const ageDiff = Math.abs(r.age - newResident.age);
        const similarAge = ageDiff <= 15; // Within 15 years for couples
        const bothAdults = r.age >= 18 && newResident.age >= 18;
        const couplePattern = sameArrival && similarAge && bothAdults;

        // Method 3: Same room/address
        const sameRoom = r.roomNumber === newResident.roomNumber;

        // Method 4: Existing family connection
        const familyConnection =
          r.familyId && newResident.familyId === r.familyId;

        // Method 5: Emergency contact pattern (if implemented)
        // const rEmergencyContact = String(
        //   r.medicalInfo?.emergencyContact || r.emergencyContact || ''
        // );
        // const newEmergencyContact = String(
        //   newResident.medicalInfo?.emergencyContact ||
        //     newResident.emergencyContact ||
        //     ''
        // );
        // const emergencyPattern =
        //   rEmergencyContact &&
        //   newEmergencyContact &&
        //   (rEmergencyContact.includes(newResident.name?.split(' ')[0] || '') ||
        //     newEmergencyContact.includes(r.name?.split(' ')[0] || ''));

        const nationalityMatch =
          !newResident.nationality || r.nationality === newResident.nationality;

        // eslint-disable-next-line no-console
        console.log(`🔍 Checking ${r.name}:`, {
          surnameMatch,
          couplePattern: {
            sameArrival,
            similarAge,
            bothAdults,
            result: couplePattern,
          },
          sameRoom,
          familyConnection,
          nationalityMatch,
          resident: r,
        });

        // Include if any pattern matches
        return (
          (surnameMatch || couplePattern || sameRoom || familyConnection) &&
          (nationalityMatch || couplePattern)
        ); // Nationality less strict for couples
      });

      potentialFamily.forEach((resident) => {
        const residentAge = calculateAge(resident.birthDate);
        const newResidentAge = calculateAge(newResident.birthDate);
        const ageDiff = Math.abs(residentAge - newResidentAge);
        const suggestion = {
          resident,
          relationships: [],
          confidence: 0,
        };

        // Check for surname-based relationships first
        const surnameMatch = resident.lastName === newResident.lastName;

        // Parent-child relationship (surname + age gap)
        if (surnameMatch && ageDiff >= 16 && ageDiff <= 50) {
          if (residentAge > newResidentAge) {
            suggestion.relationships.push({ type: 'parent', label: 'Ouder' });
          } else {
            suggestion.relationships.push({ type: 'child', label: 'Kind' });
          }
          suggestion.confidence += 0.8;
        }

        // Sibling relationship (surname + similar age)
        if (surnameMatch && ageDiff <= 15) {
          suggestion.relationships.push({
            type: 'sibling',
            label: 'Broer/Zus',
          });
          suggestion.confidence += 0.6;
        }

        // Couple detection (enhanced for different surnames)
        const bothAdults = residentAge >= 18 && newResidentAge >= 18;
        const arrivalDate1 = new Date(
          resident.registrationDate || resident.arrivalDate
        );
        const arrivalDate2 = new Date(
          newResident.arrivalDate || newResident.registrationDate
        );
        const sameArrival =
          Math.abs(arrivalDate1 - arrivalDate2) <= 24 * 60 * 60 * 1000;
        const sameRoom = resident.roomNumber === newResident.roomNumber;

        if (bothAdults && ageDiff <= 15) {
          // High confidence couple indicators
          if (sameArrival && sameRoom) {
            suggestion.relationships.push({
              type: 'spouse',
              label: 'Echtgenoot/Echtgenote',
            });
            suggestion.confidence += 0.9;
          } else if (sameArrival) {
            suggestion.relationships.push({
              type: 'partner',
              label: 'Partner',
            });
            suggestion.confidence += 0.8;
          } else if (sameRoom) {
            suggestion.relationships.push({
              type: 'partner',
              label: 'Kamergenoot/Partner',
            });
            suggestion.confidence += 0.7;
          } else if (surnameMatch) {
            suggestion.relationships.push({ type: 'spouse', label: 'Partner' });
            suggestion.confidence += 0.7;
          }
        }

        // Guardian relationship
        if (newResident.age < 18 && ageDiff >= 10) {
          suggestion.relationships.push({ type: 'guardian', label: 'Voogd' });
          suggestion.confidence += 0.5;
        }

        // Stepparent relationship (different surname but in same family)
        if (
          resident.familyId &&
          newResident.age < 18 &&
          ageDiff >= 16 &&
          !surnameMatch
        ) {
          suggestion.relationships.push({
            type: 'stepparent',
            label: 'Stiefouder',
          });
          suggestion.confidence += 0.6;
        }

        // Bonus points for same arrival date
        if (sameArrival) {
          suggestion.confidence += 0.3;
        }

        // Bonus points for same room
        if (sameRoom) {
          suggestion.confidence += 0.2;
        }

        // Bonus points if they're already in a family
        if (resident.familyId) {
          suggestion.confidence += 0.2;
          suggestion.existingFamilyId = resident.familyId;
        }

        // Bonus for mixed nationality couples (common in refugee situations)
        if (
          !surnameMatch &&
          resident.nationality !== newResident.nationality &&
          sameArrival
        ) {
          suggestion.confidence += 0.1;
          suggestion.mixedNationality = true;
        }

        // eslint-disable-next-line no-console
        console.log(`📊 Suggestion for ${resident.name}:`, {
          relationships: suggestion.relationships,
          confidence: suggestion.confidence,
        });

        if (
          suggestion.relationships.length > 0 &&
          suggestion.confidence > 0.3
        ) {
          // Lowered threshold
          suggestions.push(suggestion);
        }
      });

      const finalSuggestions = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      return finalSuggestions; // Top 5 suggestions
    },
    [state.residents]
  );

  // Trigger family suggestions when form data changes
  React.useEffect(() => {
    if (
      state.residentForm.firstName &&
      state.residentForm.lastName &&
      state.residentForm.birthDate
    ) {
      const suggestions = findFamilySuggestions(state.residentForm);
      dispatch({ type: 'SET_FAMILY_SUGGESTIONS', payload: suggestions });
    } else {
      dispatch({ type: 'SET_FAMILY_SUGGESTIONS', payload: [] });
    }
  }, [
    state.residentForm.firstName,
    state.residentForm.lastName,
    state.residentForm.birthDate,
    state.residentForm.nationality,
    state.residents,
    findFamilySuggestions,
    state.residentForm,
  ]);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    {
      id: 'residents',
      label: 'Bewoners',
      icon: Users,
      color: 'text-green-600',
    },
    {
      id: 'leave-requests',
      label: 'Verlofaanvragen',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      id: 'documents',
      label: 'Documenten',
      icon: FileText,
      color: 'text-orange-600',
    },
    {
      id: 'labels',
      label: 'Label Beheer',
      icon: Tag,
      color: 'text-indigo-600',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart,
      color: 'text-pink-600',
    },
    {
      id: 'audit-trail',
      label: 'Audit Trail',
      icon: Activity,
      color: 'text-gray-600',
    },
    {
      id: 'settings',
      label: 'Instellingen',
      icon: Settings,
      color: 'text-gray-600 dark:text-gray-400',
    },
  ];

  // Notification Settings Component
  const NotificationSettings = () => {
    const [settings, setSettings] = useState(getNotificationSettings());

    const actionLabels = {
      CREATE: 'Nieuwe bewoner',
      UPDATE: 'Bewoner bijgewerkt',
      ARCHIVE: 'Archivering',
      RESTORE: 'Herstelling',
      ASSIGN: 'Label toegewezen',
      INCIDENT: 'Incident aangemaakt',
      WARNING: 'Waarschuwing toegevoegd',
    };

    const handleToggle = (actionType) => {
      const newSettings = {
        ...settings,
        [actionType]: {
          ...settings[actionType],
          enabled: !settings[actionType].enabled,
        },
      };
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
    };

    return (
      <div className='space-y-3'>
        {Object.entries(settings).map(([actionType, config]) => (
          <div
            key={actionType}
            className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'
          >
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={config.enabled}
                onChange={() => handleToggle(actionType)}
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <span className='ml-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
                {actionLabels[actionType] || actionType}
              </span>
            </div>
            {config.persistent && (
              <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                Permanent
              </span>
            )}
          </div>
        ))}

        <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
          <p className='text-xs text-blue-700 dark:text-blue-300'>
            💡 <strong>Tip:</strong> Permanente notificaties blijven zichtbaar
            in het notificatie centrum. Andere notificaties verdwijnen
            automatisch na een paar seconden.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-700 dark:bg-gray-900'>
      <div className='flex h-screen'>
        {/* Sidebar */}
        <div
          className={`${state.sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}
        >
          {/* Logo/Header */}
          <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between'>
              <h1
                className={`font-bold text-gray-800 dark:text-white transition-all ${state.sidebarCollapsed ? 'text-sm' : 'text-xl'}`}
              >
                {state.sidebarCollapsed ? 'T' : 'TAKO VMS'}
              </h1>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
                className='p-1 rounded hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-700'
              >
                {state.sidebarCollapsed ? (
                  <ArrowRight size={20} />
                ) : (
                  <ArrowLeft size={20} />
                )}
              </button>
            </div>
          </div>

          {/* User info */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                <User className='w-6 h-6 text-blue-600' />
              </div>
              {!state.sidebarCollapsed && (
                <div>
                  <p className='font-semibold text-sm'>
                    {user?.name || 'Gebruiker'}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {user?.role || 'Medewerker'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 p-4'>
            <ul className='space-y-2'>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = state.activeView === item.id;

                return (
                  <li key={item.id}>
                    <Tooltip
                      content={item.label}
                      position="right"
                      className={state.sidebarCollapsed ? 'w-full' : 'w-full pointer-events-none'}
                    >
                      <button
                        onClick={() => setView(item.id)}
                        className={`w-full flex items-center ${state.sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 hover:text-gray-900 dark:text-gray-100'
                          }
                        `}
                      >
                        <Icon
                          className={`${item.color}`}
                          size={20}
                        />
                        {!state.sidebarCollapsed && <span>{item.label}</span>}
                      </button>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Dark mode toggle and Logout button */}
          <div className='p-4 border-t border-gray-200 dark:border-gray-700 space-y-2'>
            <Tooltip
              content={isDarkMode ? 'Licht modus' : 'Donker modus'}
              position="right"
              className={state.sidebarCollapsed ? 'w-full' : 'w-full pointer-events-none'}
            >
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center ${state.sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-all`}
              >
                {isDarkMode ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
                {!state.sidebarCollapsed && (
                  <span>{isDarkMode ? 'Licht modus' : 'Donker modus'}</span>
                )}
              </button>
            </Tooltip>
            <Tooltip
              content="Uitloggen"
              position="right"
              className={state.sidebarCollapsed ? 'w-full' : 'w-full pointer-events-none'}
            >
              <button
                onClick={logout}
                className={`w-full flex items-center ${state.sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all`}
              >
                <LogOut size={20} />
                {!state.sidebarCollapsed && <span>Uitloggen</span>}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Top header */}
          <header className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
            <div className='px-6 py-4 flex items-center justify-between'>
              <h2 className='text-2xl font-semibold text-gray-800 dark:text-white'>
                {navigationItems.find((item) => item.id === state.activeView)
                  ?.label || 'Dashboard'}
              </h2>

              {/* Header actions */}
              <div className='flex items-center space-x-4'>
                {/* Search */}
                <div className='relative'>
                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    placeholder='Zoeken...'
                    value={state.searchQuery}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_SEARCH_QUERY',
                        payload: e.target.value,
                      })
                    }
                    className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                {/* Notifications */}
                <button className='relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-600 rounded-lg'>
                  <Bell size={20} />
                  <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full' />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className='flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900'>
            <div className='rounded-lg shadow p-6 transition-gentle'>
              {/* Content based on active view */}
              {state.activeView === 'dashboard' && (
                <div key='dashboard' className='view-transition'>
                  <h3 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                    Dashboard Overview
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    <div className='bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm'>
                      <p className='text-sm text-blue-600 dark:text-blue-400'>
                        Totaal Bewoners
                      </p>
                      <p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>
                        {state.residents.length}
                      </p>
                    </div>
                    <div className='bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm'>
                      <p className='text-sm text-purple-600 dark:text-purple-400'>
                        Families
                      </p>
                      <p className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
                        {
                          new Set(
                            state.residents
                              .filter((r) => r.familyId)
                              .map((r) => r.familyId)
                          ).size
                        }
                      </p>
                    </div>
                    <div className='bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800 shadow-sm'>
                      <p className='text-sm text-green-600 dark:text-green-400'>
                        Kinderen
                      </p>
                      <p className='text-2xl font-bold text-green-700 dark:text-green-300'>
                        {
                          state.residents.filter(
                            (r) => r.familyRole === 'child'
                          ).length
                        }
                      </p>
                    </div>
                    <div className='bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm'>
                      <p className='text-sm text-orange-600 dark:text-orange-400'>
                        Individuelen
                      </p>
                      <p className='text-2xl font-bold text-orange-700 dark:text-orange-300'>
                        {state.residents.filter((r) => !r.familyId).length}
                      </p>
                    </div>
                  </div>

                  {/* Family Overview */}
                  <div className='mt-6'>
                    <h4 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                      Familie Overzicht
                    </h4>
                    <div className='space-y-3'>
                      {(() => {
                        const families = {};
                        state.residents
                          .filter((r) => r.familyId)
                          .forEach((resident) => {
                            if (!families[resident.familyId]) {
                              families[resident.familyId] = [];
                            }
                            families[resident.familyId].push(resident);
                          });

                        return Object.entries(families).map(
                          ([familyId, members]) => (
                            <div
                              key={familyId}
                              className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'
                            >
                              <div className='flex items-center space-x-2 mb-2'>
                                <Users className='w-4 h-4 text-blue-600' />
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  Familie #{familyId.slice(-3)}
                                </span>
                                <span className='text-sm text-gray-500 dark:text-gray-400'>
                                  ({members.length} leden)
                                </span>
                              </div>
                              <div className='flex flex-wrap gap-2'>
                                {members.map((member) => (
                                  <div
                                    key={member.id}
                                    className='flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded border border-gray-200 dark:border-gray-600'
                                  >
                                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                                      {member.name}
                                    </span>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 capitalize'>
                                      ({member.familyRole})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        );
                      })()}

                      {Object.keys(
                        state.residents
                          .filter((r) => r.familyId)
                          .reduce(
                            (acc, r) => ({ ...acc, [r.familyId]: true }),
                            {}
                          )
                      ).length === 0 && (
                        <div className='text-center py-8 text-gray-500'>
                          <Users className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                          <p>Nog geen families geregistreerd</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {state.activeView === 'residents' && (
                <div key='residents' className='view-transition'>
                  {(() => {
                    // Filter and sort residents
                    const filteredResidents = state.residents.filter(
                      (resident) => {
                        // Archive status filter
                        if (
                          state.filters.archiveStatus === 'active' &&
                          resident.isArchived
                        ) {
                          return false;
                        }
                        if (
                          state.filters.archiveStatus === 'archived' &&
                          !resident.isArchived
                        ) {
                          return false;
                        }

                        // Search filter
                        if (state.searchQuery) {
                          const query = state.searchQuery.toLowerCase();
                          const matchesSearch =
                            resident.name?.toLowerCase().includes(query) ||
                            resident.firstName?.toLowerCase().includes(query) ||
                            resident.lastName?.toLowerCase().includes(query) ||
                            (resident.type === 'human'
                              ? resident.nationality
                                  ?.toLowerCase()
                                  .includes(query)
                              : resident.breed
                                  ?.toLowerCase()
                                  .includes(query)) ||
                            resident.roomNumber
                              ?.toLowerCase()
                              .includes(query) ||
                            resident.bsn?.includes(query);
                          if (!matchesSearch) {
                            return false;
                          }
                        }

                        // Label filter
                        if (state.filters.labels.length > 0) {
                          const hasRequiredLabels = state.filters.labels.some(
                            (labelId) => resident.labels.includes(labelId)
                          );
                          if (!hasRequiredLabels) {
                            return false;
                          }
                        }

                        // Age range filter (only for humans)
                        if (resident.type === 'human') {
                          const residentAge = calculateAge(resident.birthDate);
                          if (
                            state.filters.ageRange.min &&
                            residentAge < parseInt(state.filters.ageRange.min)
                          ) {
                            return false;
                          }
                          if (
                            state.filters.ageRange.max &&
                            residentAge > parseInt(state.filters.ageRange.max)
                          ) {
                            return false;
                          }
                        }

                        // Nationality/Breed filter
                        if (state.filters.nationality !== 'all') {
                          const compareValue =
                            resident.type === 'human'
                              ? resident.nationality
                              : resident.breed;
                          if (compareValue !== state.filters.nationality) {
                            return false;
                          }
                        }

                        // Documents filter
                        if (state.filters.hasDocuments === 'complete') {
                          const hasAllDocs =
                            resident.documents?.hasPassport &&
                            resident.documents?.hasResidencePermit &&
                            resident.documents?.hasRegistration;
                          if (!hasAllDocs) {
                            return false;
                          }
                        } else if (
                          state.filters.hasDocuments === 'incomplete'
                        ) {
                          const hasAllDocs =
                            resident.documents?.hasPassport &&
                            resident.documents?.hasResidencePermit &&
                            resident.documents?.hasRegistration;
                          if (hasAllDocs) {
                            return false;
                          }
                        }

                        // Arrival date range filter
                        if (state.filters.arrivalDateRange.start) {
                          const arrivalDate = new Date(
                            resident.arrivalDate || resident.registrationDate
                          );
                          const startDate = new Date(
                            state.filters.arrivalDateRange.start
                          );
                          if (arrivalDate < startDate) {
                            return false;
                          }
                        }
                        if (state.filters.arrivalDateRange.end) {
                          const arrivalDate = new Date(
                            resident.arrivalDate || resident.registrationDate
                          );
                          const endDate = new Date(
                            state.filters.arrivalDateRange.end
                          );
                          if (arrivalDate > endDate) {
                            return false;
                          }
                        }

                        // Family status filter
                        if (state.filters.familyStatus !== 'all') {
                          switch (state.filters.familyStatus) {
                            case 'families':
                              if (!resident.familyId) {
                                return false;
                              }
                              break;
                            case 'individuals':
                              if (resident.familyId) {
                                return false;
                              }
                              break;
                            case 'parents':
                              if (
                                !resident.familyId ||
                                resident.familyRole !== 'parent'
                              ) {
                                return false;
                              }
                              break;
                            case 'children':
                              if (
                                !resident.familyId ||
                                resident.familyRole !== 'child'
                              ) {
                                return false;
                              }
                              break;
                          }
                        }

                        return true;
                      }
                    );

                    const sortedResidents = filteredResidents.sort((a, b) => {
                      let valueA, valueB;

                      switch (state.sortBy) {
                        case 'name':
                          valueA = a.name?.toLowerCase() || '';
                          valueB = b.name?.toLowerCase() || '';
                          break;
                        case 'age':
                          valueA = calculateAge(a.birthDate);
                          valueB = calculateAge(b.birthDate);
                          break;
                        case 'nationality':
                          valueA = a.nationality?.toLowerCase() || '';
                          valueB = b.nationality?.toLowerCase() || '';
                          break;
                        case 'roomNumber':
                          valueA = a.roomNumber || '';
                          valueB = b.roomNumber || '';
                          break;
                        default:
                          valueA = a.name?.toLowerCase() || '';
                          valueB = b.name?.toLowerCase() || '';
                      }

                      if (state.sortOrder === 'asc') {
                        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
                      } else {
                        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                      }
                    });

                    // Get unique nationalities for filter
                    const uniqueNationalities = [
                      ...new Set(state.residents.map((r) => r.nationality)),
                    ].sort();

                    return (
                      <div>
                        <div className='flex justify-between items-center mb-4'>
                          <h3 className='text-lg font-semibold'>
                            Bewoners Overzicht
                          </h3>
                          <div className='flex items-center space-x-3'>
                            <button
                              onClick={() => openModal('familyWizard')}
                              className='flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                            >
                              <Users size={20} />
                              <span>Familie Wizard</span>
                            </button>
                            <button
                              onClick={() => openModal('addResident')}
                              className='flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                            >
                              <UserPlus size={20} />
                              <span>Nieuwe Bewoner</span>
                            </button>
                          </div>
                        </div>

                        {/* View Controls */}
                        <div className='mb-6 space-y-4'>
                          {/* View Mode and Sort Controls */}
                          <div className='flex flex-wrap items-center justify-between gap-4'>
                            <div className='flex items-center space-x-4'>
                              {/* View Mode Selector */}
                              <div className='flex items-center space-x-2'>
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                  Weergave:
                                </span>
                                <div className='flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden'>
                                  <button
                                    onClick={() =>
                                      dispatch({
                                        type: 'SET_VIEW_MODE',
                                        payload: 'table',
                                      })
                                    }
                                    className={`p-2 ${state.viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                                    title='Tabel weergave'
                                  >
                                    <List size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      dispatch({
                                        type: 'SET_VIEW_MODE',
                                        payload: 'grid',
                                      })
                                    }
                                    className={`p-2 ${state.viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                                    title='Grid weergave'
                                  >
                                    <Grid3X3 size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      dispatch({
                                        type: 'SET_VIEW_MODE',
                                        payload: 'cards',
                                      })
                                    }
                                    className={`p-2 ${state.viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                                    title='Kaart weergave'
                                  >
                                    <LayoutGrid size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* Sort Controls */}
                              <div className='flex items-center space-x-2'>
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                  Sorteren:
                                </span>
                                <select
                                  value={state.sortBy}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'SET_SORT',
                                      payload: {
                                        sortBy: e.target.value,
                                        sortOrder: state.sortOrder,
                                      },
                                    })
                                  }
                                  className='px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                  <option value='name'>Naam</option>
                                  <option value='age'>Leeftijd</option>
                                  <option value='nationality'>
                                    Nationaliteit
                                  </option>
                                  <option value='roomNumber'>
                                    Kamernummer
                                  </option>
                                </select>
                                <button
                                  onClick={() =>
                                    dispatch({
                                      type: 'SET_SORT',
                                      payload: {
                                        sortBy: state.sortBy,
                                        sortOrder:
                                          state.sortOrder === 'asc'
                                            ? 'desc'
                                            : 'asc',
                                      },
                                    })
                                  }
                                  className='p-1 text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                  title={`Sorteer ${state.sortOrder === 'asc' ? 'aflopend' : 'oplopend'}`}
                                >
                                  <ArrowUpDown size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Advanced Filter Toggle */}
                            <button
                              onClick={() => {
                                const advancedFilters =
                                  document.getElementById('advanced-filters');
                                advancedFilters.classList.toggle('hidden');
                              }}
                              className='flex items-center space-x-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-700'
                            >
                              <SlidersHorizontal size={16} />
                              <span className='text-sm'>
                                Geavanceerde Filters
                              </span>
                            </button>
                          </div>

                          {/* Advanced Filters */}
                          <div
                            id='advanced-filters'
                            className='hidden bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4'
                          >
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                              {/* Age Range */}
                              <div>
                                <label
                                  htmlFor='age-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Leeftijd
                                </label>
                                <div className='flex space-x-2'>
                                  <input
                                    id='age-filter'
                                    type='number'
                                    placeholder='Min'
                                    value={state.filters.ageRange.min}
                                    onChange={(e) =>
                                      dispatch({
                                        type: 'SET_FILTER',
                                        payload: {
                                          key: 'ageRange',
                                          value: {
                                            ...state.filters.ageRange,
                                            min: e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                  />
                                  <input
                                    id='age-filter-max'
                                    type='number'
                                    placeholder='Max'
                                    value={state.filters.ageRange.max}
                                    onChange={(e) =>
                                      dispatch({
                                        type: 'SET_FILTER',
                                        payload: {
                                          key: 'ageRange',
                                          value: {
                                            ...state.filters.ageRange,
                                            max: e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                  />
                                </div>
                              </div>

                              {/* Nationality */}
                              <div>
                                <label
                                  htmlFor='nationality-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Nationaliteit
                                </label>
                                <select
                                  id='nationality-filter'
                                  value={state.filters.nationality}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'SET_FILTER',
                                      payload: {
                                        key: 'nationality',
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                >
                                  <option value='all'>
                                    Alle nationaliteiten
                                  </option>
                                  {uniqueNationalities.map((nat) => (
                                    <option key={nat} value={nat}>
                                      {nat}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Documents Status */}
                              <div>
                                <label
                                  htmlFor='documents-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Documenten
                                </label>
                                <select
                                  id='documents-filter'
                                  value={state.filters.hasDocuments}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'SET_FILTER',
                                      payload: {
                                        key: 'hasDocuments',
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                >
                                  <option value='all'>Alle statussen</option>
                                  <option value='complete'>Compleet</option>
                                  <option value='incomplete'>Incompleet</option>
                                </select>
                              </div>

                              {/* Family Status */}
                              <div>
                                <label
                                  htmlFor='family-status-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Familie Status
                                </label>
                                <select
                                  id='family-status-filter'
                                  value={state.filters.familyStatus}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'SET_FILTER',
                                      payload: {
                                        key: 'familyStatus',
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                >
                                  <option value='all'>Alle bewoners</option>
                                  <option value='families'>
                                    Alleen families
                                  </option>
                                  <option value='individuals'>
                                    Alleen individuelen
                                  </option>
                                  <option value='parents'>Alleen ouders</option>
                                  <option value='children'>
                                    Alleen kinderen
                                  </option>
                                </select>
                              </div>

                              {/* Archive Status */}
                              <div>
                                <label
                                  htmlFor='archive-status-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Archief Status
                                </label>
                                <select
                                  id='archive-status-filter'
                                  value={state.filters.archiveStatus}
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'SET_FILTER',
                                      payload: {
                                        key: 'archiveStatus',
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                  className='w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                >
                                  <option value='active'>Alleen actieve</option>
                                  <option value='archived'>
                                    Alleen gearchiveerde
                                  </option>
                                  <option value='all'>Alle bewoners</option>
                                </select>
                              </div>

                              {/* Arrival Date Range */}
                              <div>
                                <label
                                  htmlFor='arrival-start-filter'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Aankomstperiode
                                </label>
                                <div className='flex space-x-2'>
                                  <input
                                    id='arrival-start-filter'
                                    type='date'
                                    value={state.filters.arrivalDateRange.start}
                                    onChange={(e) =>
                                      dispatch({
                                        type: 'SET_FILTER',
                                        payload: {
                                          key: 'arrivalDateRange',
                                          value: {
                                            ...state.filters.arrivalDateRange,
                                            start: e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className='flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                  />
                                  <span className='self-center text-gray-500'>
                                    tot
                                  </span>
                                  <input
                                    id='arrival-end-filter'
                                    type='date'
                                    value={state.filters.arrivalDateRange.end}
                                    onChange={(e) =>
                                      dispatch({
                                        type: 'SET_FILTER',
                                        payload: {
                                          key: 'arrivalDateRange',
                                          value: {
                                            ...state.filters.arrivalDateRange,
                                            end: e.target.value,
                                          },
                                        },
                                      })
                                    }
                                    className='flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm'
                                  />
                                </div>
                              </div>

                              {/* Reset Filters */}
                              <div className='flex items-end'>
                                <button
                                  onClick={() =>
                                    dispatch({ type: 'RESET_FILTERS' })
                                  }
                                  className='px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:bg-gray-700'
                                >
                                  Reset alle filters
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Label Filters */}
                          <div className='border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'>
                            {/* Filter Header */}
                            <div
                              className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-600 dark:hover:bg-gray-600 transition-colors cursor-pointer'
                              onClick={() =>
                                dispatch({ type: 'TOGGLE_FILTERS_EXPANDED' })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  dispatch({ type: 'TOGGLE_FILTERS_EXPANDED' });
                                }
                              }}
                              role='button'
                              tabIndex={0}
                            >
                              <div className='flex items-center space-x-2'>
                                <Filter
                                  size={18}
                                  className='text-gray-600 dark:text-gray-400 dark:text-gray-300'
                                />
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200'>
                                  Snelle filters
                                </span>
                                {state.filters.labels.length > 0 && (
                                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'>
                                    {state.filters.labels.length} actief
                                  </span>
                                )}
                              </div>
                              <div className='flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors'>
                                <ChevronDown
                                  size={18}
                                  className={`transform transition-transform duration-300 ease-in-out ${state.filtersExpanded ? 'rotate-180' : ''}`}
                                />
                              </div>
                            </div>

                            {/* Collapsible Filter Content */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                state.filtersExpanded
                                  ? 'max-h-96 opacity-100'
                                  : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className='p-4 space-y-4'>
                                {/* Search within filters */}
                                <div className='relative'>
                                  <Search
                                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                                    size={16}
                                  />
                                  <input
                                    type='text'
                                    placeholder='Zoek in filters...'
                                    value={state.filterSearchQuery}
                                    onChange={(e) =>
                                      dispatch({
                                        type: 'SET_FILTER_SEARCH_QUERY',
                                        payload: e.target.value,
                                      })
                                    }
                                    className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                                  />
                                </div>

                                {/* Filter Labels */}
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                      Labels
                                    </h4>
                                    {state.filters.labels.length > 0 && (
                                      <button
                                        onClick={() =>
                                          dispatch({
                                            type: 'SET_FILTER',
                                            payload: {
                                              key: 'labels',
                                              value: [],
                                            },
                                          })
                                        }
                                        className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300'
                                      >
                                        Alles wissen
                                      </button>
                                    )}
                                  </div>

                                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
                                    {state.labels
                                      .filter(
                                        (label) =>
                                          !state.filterSearchQuery ||
                                          label.name
                                            .toLowerCase()
                                            .includes(
                                              state.filterSearchQuery.toLowerCase()
                                            )
                                      )
                                      .map((label) => {
                                        const Icon =
                                          {
                                            AlertCircle,
                                            Heart,
                                            Baby,
                                            UserPlus,
                                            Clock,
                                            Shield,
                                            Crown,
                                            UserCog,
                                            Cat,
                                            Dog,
                                          }[label.icon] || Tag;

                                        const isActive =
                                          state.filters.labels.includes(
                                            label.id
                                          );

                                        const colorClasses = isActive
                                          ? {
                                              red: 'bg-red-600 text-white border-red-600',
                                              blue: 'bg-blue-600 text-white border-blue-600',
                                              purple:
                                                'bg-purple-600 text-white border-purple-600',
                                              green:
                                                'bg-green-600 text-white border-green-600',
                                              orange:
                                                'bg-orange-600 text-white border-orange-600',
                                              pink: 'bg-pink-600 text-white border-pink-600',
                                            }[label.color]
                                          : {
                                              red: 'bg-white text-red-700 border-red-300 hover:border-red-400',
                                              blue: 'bg-white text-blue-700 border-blue-300 hover:border-blue-400',
                                              purple:
                                                'bg-white text-purple-700 border-purple-300 hover:border-purple-400',
                                              green:
                                                'bg-white text-green-700 border-green-300 hover:border-green-400',
                                              orange:
                                                'bg-white text-orange-700 border-orange-300 hover:border-orange-400',
                                              pink: 'bg-white text-pink-700 border-pink-300 hover:border-pink-400',
                                            }[label.color];

                                        return (
                                          <button
                                            key={label.id}
                                            onClick={() => {
                                              const newLabels = isActive
                                                ? state.filters.labels.filter(
                                                    (id) => id !== label.id
                                                  )
                                                : [
                                                    ...state.filters.labels,
                                                    label.id,
                                                  ];
                                              dispatch({
                                                type: 'SET_FILTER',
                                                payload: {
                                                  key: 'labels',
                                                  value: newLabels,
                                                },
                                              });
                                            }}
                                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-all ${colorClasses}`}
                                          >
                                            <Icon
                                              size={14}
                                              className='mr-1.5'
                                            />
                                            <span>{label.name}</span>
                                            {isActive && (
                                              <Check
                                                size={14}
                                                className='ml-1.5'
                                              />
                                            )}
                                          </button>
                                        );
                                      })}
                                  </div>

                                  {state.filterSearchQuery &&
                                    state.labels.filter((label) =>
                                      label.name
                                        .toLowerCase()
                                        .includes(
                                          state.filterSearchQuery.toLowerCase()
                                        )
                                    ).length === 0 && (
                                      <p className='text-sm text-gray-500 text-center py-2'>
                                        Geen filters gevonden voor "
                                        {state.filterSearchQuery}"
                                      </p>
                                    )}
                                </div>
                              </div>
                            </div>

                            {/* Collapsed State - Show active filters */}
                            {!state.filtersExpanded &&
                              state.filters.labels.length > 0 && (
                                <div className='px-4 py-3 border-t border-gray-200'>
                                  <div className='flex flex-wrap gap-2'>
                                    {state.filters.labels
                                      .slice(0, 3)
                                      .map((labelId) => {
                                        const label = state.labels.find(
                                          (l) => l.id === labelId
                                        );
                                        if (!label) {
                                          return null;
                                        }

                                        const Icon =
                                          {
                                            AlertCircle,
                                            Heart,
                                            Baby,
                                            UserPlus,
                                            Clock,
                                            Shield,
                                            Crown,
                                            UserCog,
                                            Cat,
                                            Dog,
                                          }[label.icon] || Tag;

                                        const colorClasses =
                                          {
                                            red: 'bg-red-100 text-red-700 border-red-200',
                                            blue: 'bg-blue-100 text-blue-700 border-blue-200',
                                            purple:
                                              'bg-purple-100 text-purple-700 border-purple-200',
                                            green:
                                              'bg-green-100 text-green-700 border-green-200',
                                            orange:
                                              'bg-orange-100 text-orange-700 border-orange-200',
                                            pink: 'bg-pink-100 text-pink-700 border-pink-200',
                                          }[label.color] ||
                                          'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200';

                                        return (
                                          <span
                                            key={labelId}
                                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colorClasses}`}
                                          >
                                            <Icon size={12} className='mr-1' />
                                            {label.name}
                                          </span>
                                        );
                                      })}
                                    {state.filters.labels.length > 3 && (
                                      <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200'>
                                        +{state.filters.labels.length - 3} meer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Results count */}
                          <div className='text-sm text-gray-600 dark:text-gray-400'>
                            {sortedResidents.length} van{' '}
                            {state.residents.length} bewoners getoond
                            {(state.searchQuery ||
                              state.filters.labels.length > 0 ||
                              state.filters.familyStatus !== 'all' ||
                              state.filters.nationality !== 'all') && (
                              <span className='ml-2'>
                                (Filters:
                                {state.searchQuery &&
                                  `zoekterm: "${state.searchQuery}"`}
                                {state.filters.labels.length > 0 &&
                                  `${state.searchQuery ? ', ' : ''}${state.filters.labels.length} label(s)`}
                                {state.filters.familyStatus !== 'all' &&
                                  `${state.searchQuery || state.filters.labels.length > 0 ? ', ' : ''}${state.filters.familyStatus}`}
                                {state.filters.nationality !== 'all' &&
                                  `${state.searchQuery || state.filters.labels.length > 0 || state.filters.familyStatus !== 'all' ? ', ' : ''}${state.filters.nationality}`}
                                )
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Residents List */}
                        <div>
                          {sortedResidents.length === 0 ? (
                            <div className='text-center py-8 text-gray-500'>
                              <User className='mx-auto h-12 w-12 text-gray-300 mb-3' />
                              <p>Geen bewoners gevonden</p>
                              <button
                                onClick={() =>
                                  dispatch({ type: 'RESET_FILTERS' })
                                }
                                className='mt-2 text-sm text-blue-600 hover:text-blue-700'
                              >
                                Reset alle filters
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Table View */}
                              {state.viewMode === 'table' && (
                                <div className='overflow-x-auto'>
                                  <table className='w-full bg-white dark:bg-gray-800 border border-gray-200 rounded-lg'>
                                    <thead className='bg-gray-50 dark:bg-gray-700'>
                                      <tr>
                                        <th
                                          className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-gray-600 transition-colors select-none'
                                          onClick={() => {
                                            const newOrder =
                                              state.sortBy === 'name' &&
                                              state.sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc';
                                            dispatch({
                                              type: 'SET_SORT',
                                              payload: {
                                                sortBy: 'name',
                                                sortOrder: newOrder,
                                              },
                                            });
                                          }}
                                        >
                                          <div className='flex items-center space-x-1'>
                                            <span>Naam</span>
                                            {state.sortBy === 'name' && (
                                              <ArrowUpDown
                                                className={`w-4 h-4 transition-transform ${
                                                  state.sortOrder === 'desc'
                                                    ? 'rotate-180'
                                                    : ''
                                                }`}
                                              />
                                            )}
                                          </div>
                                        </th>
                                        <th
                                          className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-gray-600 transition-colors select-none'
                                          onClick={() => {
                                            const newOrder =
                                              state.sortBy === 'age' &&
                                              state.sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc';
                                            dispatch({
                                              type: 'SET_SORT',
                                              payload: {
                                                sortBy: 'age',
                                                sortOrder: newOrder,
                                              },
                                            });
                                          }}
                                        >
                                          <div className='flex items-center space-x-1'>
                                            <span>Leeftijd</span>
                                            {state.sortBy === 'age' && (
                                              <ArrowUpDown
                                                className={`w-4 h-4 transition-transform ${
                                                  state.sortOrder === 'desc'
                                                    ? 'rotate-180'
                                                    : ''
                                                }`}
                                              />
                                            )}
                                          </div>
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                          Gender
                                        </th>
                                        <th
                                          className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-gray-600 transition-colors select-none'
                                          onClick={() => {
                                            const newOrder =
                                              state.sortBy === 'nationality' &&
                                              state.sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc';
                                            dispatch({
                                              type: 'SET_SORT',
                                              payload: {
                                                sortBy: 'nationality',
                                                sortOrder: newOrder,
                                              },
                                            });
                                          }}
                                        >
                                          <div className='flex items-center space-x-1'>
                                            <span>Nationaliteit</span>
                                            {state.sortBy === 'nationality' && (
                                              <ArrowUpDown
                                                className={`w-4 h-4 transition-transform ${
                                                  state.sortOrder === 'desc'
                                                    ? 'rotate-180'
                                                    : ''
                                                }`}
                                              />
                                            )}
                                          </div>
                                        </th>
                                        <th
                                          className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:bg-gray-600 transition-colors select-none'
                                          onClick={() => {
                                            const newOrder =
                                              state.sortBy === 'roomNumber' &&
                                              state.sortOrder === 'asc'
                                                ? 'desc'
                                                : 'asc';
                                            dispatch({
                                              type: 'SET_SORT',
                                              payload: {
                                                sortBy: 'roomNumber',
                                                sortOrder: newOrder,
                                              },
                                            });
                                          }}
                                        >
                                          <div className='flex items-center space-x-1'>
                                            <span>Kamer</span>
                                            {state.sortBy === 'roomNumber' && (
                                              <ArrowUpDown
                                                className={`w-4 h-4 transition-transform ${
                                                  state.sortOrder === 'desc'
                                                    ? 'rotate-180'
                                                    : ''
                                                }`}
                                              />
                                            )}
                                          </div>
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                          Labels
                                        </th>
                                        <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                          Acties
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-200'>
                                      {sortedResidents.map((resident) => (
                                        <tr
                                          key={resident.id}
                                          className='hover:bg-gray-50 dark:bg-gray-700 transition-colors'
                                        >
                                          <td className='px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100'>
                                            <div className='flex items-center space-x-2'>
                                              <span>{resident.name}</span>
                                              {resident.bsn && (
                                                <span
                                                  className='text-xs bg-gray-100 dark:bg-gray-600 text-gray-500 px-1 py-0.5 rounded'
                                                  title='BSN aanwezig'
                                                >
                                                  BSN
                                                </span>
                                              )}
                                              {resident.familyId && (
                                                <span
                                                  className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                                                    resident.familyRole ===
                                                      'spouse' ||
                                                    resident.familyRole ===
                                                      'partner'
                                                      ? 'bg-pink-100 text-pink-700'
                                                      : 'bg-blue-100 text-blue-700'
                                                  }`}
                                                  title={`Familie ${resident.familyId}`}
                                                >
                                                  <Users size={10} />
                                                  <span className='capitalize'>
                                                    {resident.familyRole}
                                                  </span>
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className='px-4 py-3 text-sm text-gray-600 dark:text-gray-400'>
                                            {calculateAge(
                                              resident.birthDate
                                            ) !== null
                                              ? `${calculateAge(resident.birthDate)} jr`
                                              : 'N/A'}
                                          </td>
                                          <td className='px-4 py-3 text-sm text-gray-600 dark:text-gray-400'>
                                            {resident.type === 'human' ? (
                                              <span className='text-xs font-medium text-gray-500'>
                                                {resident.gender || '-'}
                                              </span>
                                            ) : (
                                              <span className='text-xs text-gray-400'>
                                                N/A
                                              </span>
                                            )}
                                          </td>
                                          <td className='px-4 py-3 text-sm text-gray-600 dark:text-gray-400'>
                                            {resident.type === 'human'
                                              ? resident.nationality
                                              : resident.breed}
                                          </td>
                                          <td className='px-4 py-3 text-sm text-gray-600 dark:text-gray-400'>
                                            {resident.roomNumber}
                                          </td>
                                          <td className='px-4 py-3'>
                                            <div className='flex flex-wrap gap-1'>
                                              {resident.labels
                                                .slice(0, 2)
                                                .map((labelId) => {
                                                  const label =
                                                    state.labels.find(
                                                      (l) => l.id === labelId
                                                    );
                                                  if (!label) {
                                                    return null;
                                                  }
                                                  const colorClasses =
                                                    {
                                                      red: 'bg-red-100 text-red-700',
                                                      blue: 'bg-blue-100 text-blue-700',
                                                      purple:
                                                        'bg-purple-100 text-purple-700',
                                                      green:
                                                        'bg-green-100 text-green-700',
                                                      orange:
                                                        'bg-orange-100 text-orange-700',
                                                      pink: 'bg-pink-100 text-pink-700',
                                                    }[label.color] ||
                                                    'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
                                                  return (
                                                    <span
                                                      key={label.id}
                                                      className={`inline-block px-2 py-1 rounded-full text-xs ${colorClasses}`}
                                                    >
                                                      {label.name}
                                                    </span>
                                                  );
                                                })}
                                              {resident.labels.length > 2 && (
                                                <span className='inline-block px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'>
                                                  +{resident.labels.length - 2}
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className='px-4 py-3'>
                                            <div className='flex space-x-2'>
                                              <button
                                                className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                                                title='Bekijken'
                                              >
                                                <Eye size={16} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  dispatch({
                                                    type: 'SET_SELECTED_RESIDENT',
                                                    payload: resident,
                                                  });
                                                  openModal('addResident');
                                                }}
                                                className='p-1 text-gray-400 hover:text-green-600 transition-colors'
                                                title='Bewerken'
                                              >
                                                <Edit size={16} />
                                              </button>
                                              {resident.type !== 'human' &&
                                                !resident.isArchived && (
                                                  <button
                                                    onClick={() => {
                                                      dispatch({
                                                        type: 'SET_SELECTED_RESIDENT',
                                                        payload: resident,
                                                      });
                                                      openModal(
                                                        'archiveResident'
                                                      );
                                                    }}
                                                    className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                                                    title='Archiveren'
                                                  >
                                                    <Archive size={16} />
                                                  </button>
                                                )}
                                              {resident.type !== 'human' &&
                                                resident.isArchived &&
                                                resident.archiveReason !==
                                                  'overleden' && (
                                                  <button
                                                    onClick={() => {
                                                      // Log audit entry and trigger notification
                                                      const auditEntry =
                                                        auditHelpers.logResidentRestored(
                                                          user,
                                                          resident
                                                        );
                                                      processAuditEntry(
                                                        auditEntry
                                                      );

                                                      dispatch({
                                                        type: 'RESTORE_RESIDENT',
                                                        payload: {
                                                          residentId:
                                                            resident.id,
                                                          reason:
                                                            'Hersteld via interface',
                                                        },
                                                      });
                                                    }}
                                                    className='p-1 text-gray-400 hover:text-green-600 transition-colors'
                                                    title='Herstellen'
                                                  >
                                                    <RefreshCw size={16} />
                                                  </button>
                                                )}
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Grid View */}
                              {state.viewMode === 'grid' && (
                                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                                  {sortedResidents.map((resident) => (
                                    <div
                                      key={resident.id}
                                      className='bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow'
                                    >
                                      <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                          resident.type === 'cat'
                                            ? 'bg-purple-100 dark:bg-purple-800'
                                            : resident.type === 'dog'
                                              ? 'bg-orange-100 dark:bg-orange-800'
                                              : 'bg-gray-100 dark:bg-gray-600'
                                        }`}
                                      >
                                        {resident.type === 'cat' ? (
                                          <Cat className='w-6 h-6 text-purple-600 dark:text-purple-300' />
                                        ) : resident.type === 'dog' ? (
                                          <Dog className='w-6 h-6 text-orange-600 dark:text-orange-300' />
                                        ) : (
                                          <User className='w-6 h-6 text-gray-400' />
                                        )}
                                      </div>
                                      <h4
                                        className='font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 truncate'
                                        title={resident.name}
                                      >
                                        {resident.name}
                                      </h4>
                                      <p className='text-xs text-gray-500 mb-1'>
                                        Kamer {resident.roomNumber}
                                      </p>
                                      {resident.type === 'human' &&
                                        resident.gender && (
                                          <p className='text-xs text-gray-400 mb-2'>
                                            <span className='text-xs font-medium text-gray-500'>
                                              {resident.gender}
                                            </span>
                                          </p>
                                        )}
                                      {resident.familyId && (
                                        <div className='flex items-center justify-center space-x-1 mb-2'>
                                          <Users
                                            size={10}
                                            className='text-blue-600'
                                          />
                                          <span
                                            className={`text-xs capitalize ${
                                              resident.familyRole ===
                                                'spouse' ||
                                              resident.familyRole === 'partner'
                                                ? 'text-pink-600'
                                                : 'text-blue-600'
                                            }`}
                                          >
                                            {resident.familyRole}
                                          </span>
                                        </div>
                                      )}
                                      <div className='flex justify-center space-x-1 mb-2'>
                                        {resident.labels
                                          .slice(0, 2)
                                          .map((labelId) => {
                                            const label = state.labels.find(
                                              (l) => l.id === labelId
                                            );
                                            if (!label) {
                                              return null;
                                            }
                                            const colorClasses =
                                              {
                                                red: 'bg-red-500',
                                                blue: 'bg-blue-500',
                                                purple: 'bg-purple-500',
                                                green: 'bg-green-500',
                                                orange: 'bg-orange-500',
                                                pink: 'bg-pink-500',
                                              }[label.color] ||
                                              'bg-gray-50 dark:bg-gray-7000';
                                            return (
                                              <div
                                                key={label.id}
                                                className={`w-2 h-2 rounded-full ${colorClasses}`}
                                                title={label.name}
                                              />
                                            );
                                          })}
                                      </div>
                                      <div className='flex justify-center space-x-1'>
                                        <button className='p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400'>
                                          <Eye size={12} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            dispatch({
                                              type: 'SET_SELECTED_RESIDENT',
                                              payload: resident,
                                            });
                                            openModal('addResident');
                                          }}
                                          className='p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400'
                                        >
                                          <Edit size={12} />
                                        </button>
                                        {resident.type !== 'human' &&
                                          !resident.isArchived && (
                                            <button
                                              onClick={() => {
                                                dispatch({
                                                  type: 'SET_SELECTED_RESIDENT',
                                                  payload: resident,
                                                });
                                                openModal('archiveResident');
                                              }}
                                              className='p-1 text-gray-400 hover:text-red-600 dark:text-gray-400'
                                              title='Archiveren'
                                            >
                                              <Archive size={12} />
                                            </button>
                                          )}
                                        {resident.type !== 'human' &&
                                          resident.isArchived &&
                                          resident.archiveReason !==
                                            'overleden' && (
                                            <button
                                              onClick={() => {
                                                // Log audit entry and trigger notification
                                                const auditEntry =
                                                  auditHelpers.logResidentRestored(
                                                    user,
                                                    resident
                                                  );
                                                processAuditEntry(auditEntry);

                                                dispatch({
                                                  type: 'RESTORE_RESIDENT',
                                                  payload: {
                                                    residentId: resident.id,
                                                    reason:
                                                      'Hersteld via interface',
                                                  },
                                                });
                                              }}
                                              className='p-1 text-gray-400 hover:text-green-600 dark:text-gray-400'
                                              title='Herstellen'
                                            >
                                              <RefreshCw size={12} />
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Cards View (Extended) */}
                              {state.viewMode === 'cards' && (
                                <div className='space-y-4'>
                                  {sortedResidents.map((resident) => (
                                    <div
                                      key={resident.id}
                                      className='bg-white dark:bg-gray-800 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                                    >
                                      <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                          <div className='flex items-center space-x-3 mb-2'>
                                            <h4 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                                              {resident.name}
                                            </h4>
                                            <span className='text-sm text-gray-500'>
                                              Kamer {resident.roomNumber}
                                            </span>
                                            {resident.bsn && (
                                              <span className='text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                                                BSN: {formatBSN(resident.bsn)}
                                              </span>
                                            )}
                                            {resident.familyId && (
                                              <span
                                                className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 ${
                                                  resident.familyRole ===
                                                    'spouse' ||
                                                  resident.familyRole ===
                                                    'partner'
                                                    ? 'bg-pink-100 text-pink-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}
                                              >
                                                <Users size={12} />
                                                <span>
                                                  Familie #
                                                  {resident.familyId.slice(-3)}
                                                </span>
                                                <span
                                                  className={
                                                    resident.familyRole ===
                                                      'spouse' ||
                                                    resident.familyRole ===
                                                      'partner'
                                                      ? 'text-pink-500'
                                                      : 'text-blue-500'
                                                  }
                                                >
                                                  •
                                                </span>
                                                <span className='capitalize'>
                                                  {resident.familyRole}
                                                </span>
                                              </span>
                                            )}
                                          </div>

                                          <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3'>
                                            <span className='flex items-center'>
                                              <Globe
                                                size={14}
                                                className='mr-1'
                                              />
                                              {resident.type === 'human'
                                                ? resident.nationality
                                                : resident.breed}
                                            </span>
                                            <span className='flex items-center'>
                                              <User
                                                size={14}
                                                className='mr-1'
                                              />
                                              {calculateAge(
                                                resident.birthDate
                                              ) !== null
                                                ? `${calculateAge(resident.birthDate)} jaar`
                                                : 'N/A'}
                                            </span>
                                            {resident.type === 'human' &&
                                              resident.gender && (
                                                <span className='flex items-center'>
                                                  <span className='text-xs font-medium text-gray-500'>
                                                    {resident.gender}
                                                  </span>
                                                </span>
                                              )}
                                            {resident.phone && (
                                              <span className='flex items-center'>
                                                <Phone
                                                  size={14}
                                                  className='mr-1'
                                                />
                                                {resident.phone}
                                              </span>
                                            )}
                                          </div>

                                          {/* Archive Information */}
                                          {resident.isArchived && (
                                            <div className='bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-3'>
                                              <div className='flex items-center'>
                                                <Archive className='w-4 h-4 text-red-600 dark:text-red-400 mr-2' />
                                                <div className='text-sm'>
                                                  <p className='font-medium text-red-800 dark:text-red-200'>
                                                    Gearchiveerd:{' '}
                                                    {resident.archiveReason}
                                                  </p>
                                                  <p className='text-red-700 dark:text-red-300'>
                                                    {new Date(
                                                      resident.archiveDate
                                                    ).toLocaleDateString(
                                                      'nl-NL'
                                                    )}
                                                    {resident.archiveCustomText &&
                                                      ` - ${resident.archiveCustomText}`}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          {/* Family Members & Pets */}
                                          {resident.familyId &&
                                            Array.isArray(
                                              resident.familyMembers
                                            ) &&
                                            resident.familyMembers.length > 0 &&
                                            (() => {
                                              // Split family members into humans and pets
                                              const familyMembers =
                                                resident.familyMembers
                                                  .map((id) =>
                                                    state.residents.find(
                                                      (r) => r.id === id
                                                    )
                                                  )
                                                  .filter(Boolean);
                                              const humans =
                                                familyMembers.filter(
                                                  (m) => m.type === 'human'
                                                );
                                              const pets = familyMembers.filter(
                                                (m) => m.type !== 'human'
                                              );

                                              return (
                                                <div className='space-y-2 mb-3'>
                                                  {/* Human Family Members */}
                                                  {humans.length > 0 && (
                                                    <div className='flex items-center space-x-2'>
                                                      <span className='text-xs text-gray-500'>
                                                        Familie:
                                                      </span>
                                                      <div className='flex flex-wrap gap-1'>
                                                        {humans
                                                          .slice(0, 3)
                                                          .map((member) => (
                                                            <span
                                                              key={member.id}
                                                              className='text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded'
                                                              title={`${member.name} (${member.familyRole})`}
                                                            >
                                                              {member.firstName}
                                                            </span>
                                                          ))}
                                                        {humans.length > 3 && (
                                                          <span className='text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded'>
                                                            +{humans.length - 3}
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}

                                                  {/* Pet Family Members */}
                                                  {pets.length > 0 && (
                                                    <div className='flex items-center space-x-2'>
                                                      <span className='text-xs text-gray-500'>
                                                        Huisdieren:
                                                      </span>
                                                      <div className='flex flex-wrap gap-1'>
                                                        {pets.map((pet) => (
                                                          <span
                                                            key={pet.id}
                                                            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                                              pet.type === 'cat'
                                                                ? 'bg-purple-50 text-purple-700'
                                                                : 'bg-orange-50 text-orange-700'
                                                            }`}
                                                            title={`${pet.name} (${pet.breed})`}
                                                          >
                                                            {pet.type ===
                                                            'cat' ? (
                                                              <Cat className='w-3 h-3' />
                                                            ) : (
                                                              <Dog className='w-3 h-3' />
                                                            )}{' '}
                                                            {pet.firstName}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })()}

                                          {/* Document Status */}
                                          {resident.documents && (
                                            <div className='flex items-center space-x-2 mb-3'>
                                              <span className='text-xs text-gray-500'>
                                                Documenten:
                                              </span>
                                              <div className='flex space-x-1'>
                                                <span
                                                  className={`w-2 h-2 rounded-full ${resident.documents.hasPassport ? 'bg-green-500' : 'bg-gray-300'}`}
                                                  title='Paspoort'
                                                />
                                                <span
                                                  className={`w-2 h-2 rounded-full ${resident.documents.hasResidencePermit ? 'bg-green-500' : 'bg-gray-300'}`}
                                                  title='Verblijfsvergunning'
                                                />
                                                <span
                                                  className={`w-2 h-2 rounded-full ${resident.documents.hasRegistration ? 'bg-green-500' : 'bg-gray-300'}`}
                                                  title='GBA Registratie'
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {/* Labels */}
                                          <div className='flex flex-wrap gap-2'>
                                            {resident.labels.map((labelId) => {
                                              const label = state.labels.find(
                                                (l) => l.id === labelId
                                              );
                                              if (!label) {
                                                return null;
                                              }

                                              const Icon =
                                                {
                                                  AlertCircle,
                                                  Heart,
                                                  Baby,
                                                  UserPlus,
                                                  Clock,
                                                  Shield,
                                                  Crown,
                                                  UserCog,
                                                  Cat,
                                                  Dog,
                                                }[label.icon] || Tag;

                                              const colorClasses =
                                                {
                                                  red: 'bg-red-50 text-red-700 border-red-200',
                                                  blue: 'bg-blue-50 text-blue-700 border-blue-200',
                                                  purple:
                                                    'bg-purple-50 text-purple-700 border-purple-200',
                                                  green:
                                                    'bg-green-50 text-green-700 border-green-200',
                                                  orange:
                                                    'bg-orange-50 text-orange-700 border-orange-200',
                                                  pink: 'bg-pink-50 text-pink-700 border-pink-200',
                                                }[label.color] ||
                                                'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200';

                                              return (
                                                <span
                                                  key={label.id}
                                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses}`}
                                                >
                                                  <Icon
                                                    size={12}
                                                    className='mr-1'
                                                  />
                                                  {label.name}
                                                </span>
                                              );
                                            })}
                                          </div>

                                          {/* Label History for Pets */}
                                          {resident.type !== 'human' &&
                                            Array.isArray(
                                              resident.labelHistory
                                            ) &&
                                            resident.labelHistory.length >
                                              0 && (
                                              <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-700'>
                                                <h4 className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                                                  Label Historie
                                                </h4>
                                                <div className='space-y-1'>
                                                  {resident.labelHistory
                                                    .slice(-3)
                                                    .reverse()
                                                    .map((historyItem) => (
                                                      <div
                                                        key={historyItem.id}
                                                        className='text-xs text-gray-500 dark:text-gray-400'
                                                      >
                                                        <span
                                                          className={`font-medium ${historyItem.action === 'added' ? 'text-green-600' : historyItem.action === 'removed' ? 'text-red-600' : 'text-blue-600'}`}
                                                        >
                                                          {historyItem.action ===
                                                          'added'
                                                            ? '+ '
                                                            : historyItem.action ===
                                                                'removed'
                                                              ? '- '
                                                              : ''}
                                                          {historyItem.labelName ||
                                                            historyItem.reason}
                                                        </span>
                                                        <span className='ml-2'>
                                                          {new Date(
                                                            historyItem.timestamp
                                                          ).toLocaleDateString(
                                                            'nl-NL'
                                                          )}
                                                        </span>
                                                      </div>
                                                    ))}
                                                  {resident.labelHistory
                                                    .length > 3 && (
                                                    <div className='text-xs text-gray-400'>
                                                      +
                                                      {resident.labelHistory
                                                        .length - 3}{' '}
                                                      meer...
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>

                                        <div className='flex items-center space-x-2 ml-4'>
                                          <button className='p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-600 rounded'>
                                            <Eye size={18} />
                                          </button>
                                          <button
                                            onClick={() => {
                                              dispatch({
                                                type: 'SET_SELECTED_RESIDENT',
                                                payload: resident,
                                              });
                                              openModal('addResident');
                                            }}
                                            className='p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-600 rounded'
                                          >
                                            <Edit size={18} />
                                          </button>
                                          {resident.type !== 'human' &&
                                            !resident.isArchived && (
                                              <button
                                                onClick={() => {
                                                  dispatch({
                                                    type: 'SET_SELECTED_RESIDENT',
                                                    payload: resident,
                                                  });
                                                  openModal('archiveResident');
                                                }}
                                                className='p-2 text-gray-400 hover:text-red-600 dark:text-gray-400 hover:bg-red-100 dark:bg-gray-600 rounded'
                                                title='Archiveren'
                                              >
                                                <Archive size={18} />
                                              </button>
                                            )}
                                          {resident.type !== 'human' &&
                                            resident.isArchived &&
                                            resident.archiveReason !==
                                              'overleden' && (
                                              <button
                                                onClick={() => {
                                                  // Log audit entry and trigger notification
                                                  const auditEntry =
                                                    auditHelpers.logResidentRestored(
                                                      user,
                                                      resident
                                                    );
                                                  processAuditEntry(auditEntry);

                                                  dispatch({
                                                    type: 'RESTORE_RESIDENT',
                                                    payload: {
                                                      residentId: resident.id,
                                                      reason:
                                                        'Hersteld via interface',
                                                    },
                                                  });
                                                }}
                                                className='p-2 text-gray-400 hover:text-green-600 dark:text-gray-400 hover:bg-green-100 dark:bg-gray-600 rounded'
                                                title='Herstellen'
                                              >
                                                <RefreshCw size={18} />
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {state.activeView === 'leave-requests' && (
                <div key='leave-requests' className='view-transition'>
                  <h3 className='text-lg font-semibold mb-4'>
                    Verlofaanvragen
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Verlof module komt hier...
                  </p>
                </div>
              )}

              {state.activeView === 'documents' && (
                <div key='documents' className='view-transition'>
                  <h3 className='text-lg font-semibold mb-4'>Documenten</h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Documenten module komt hier...
                  </p>
                </div>
              )}

              {state.activeView === 'analytics' && (
                <div key='analytics' className='view-transition'>
                  <h3 className='text-lg font-semibold mb-4'>Analytics</h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Analytics module komt hier...
                  </p>
                </div>
              )}

              {state.activeView === 'audit-trail' && (
                <div key='audit-trail' className='view-transition'>
                  <AuditTrail isOpen={true} onClose={() => {}} />
                </div>
              )}

              {state.activeView === 'labels' && (
                <div key='labels' className='view-transition'>
                  <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-lg font-semibold'>Label Beheer</h3>
                    <button
                      onClick={() => {
                        openModal('labelsManager');
                      }}
                      className='flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700'
                    >
                      <Plus size={20} />
                      <span>Nieuwe Label</span>
                    </button>
                  </div>

                  {/* Label Statistics */}
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                      <p className='text-sm text-blue-600'>Totaal Labels</p>
                      <p className='text-2xl font-bold text-blue-700'>
                        {state.labels.length}
                      </p>
                    </div>
                    <div className='bg-green-50 p-4 rounded-lg'>
                      <p className='text-sm text-green-600'>Meest Gebruikt</p>
                      <p className='text-lg font-semibold text-green-700'>
                        {(() => {
                          const labelUsage = state.labels.map((label) => ({
                            ...label,
                            count: state.residents.filter((r) =>
                              r.labels.includes(label.id)
                            ).length,
                          }));
                          const mostUsed = labelUsage.sort(
                            (a, b) => b.count - a.count
                          )[0];
                          return mostUsed ? mostUsed.name : 'Geen';
                        })()}
                      </p>
                    </div>
                    <div className='bg-orange-50 p-4 rounded-lg'>
                      <p className='text-sm text-orange-600'>
                        Actieve Bewoners
                      </p>
                      <p className='text-2xl font-bold text-orange-700'>
                        {
                          state.residents.filter((r) => r.labels.length > 0)
                            .length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Label Groups */}
                  <div className='space-y-6'>
                    {Object.entries(state.labelGroups).map(
                      ([groupName, labelIds]) => {
                        const groupLabels = state.labels.filter((l) =>
                          labelIds.includes(l.id)
                        );
                        const groupTitles = {
                          urgent: 'Urgente Labels',
                          medical: 'Medische Labels',
                          administrative: 'Administratieve Labels',
                          social: 'Sociale Labels',
                        };

                        return (
                          <div
                            key={groupName}
                            className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'
                          >
                            <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide'>
                              {groupTitles[groupName] || groupName}
                            </h4>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                              {groupLabels.map((label) => {
                                const Icon =
                                  {
                                    AlertCircle,
                                    Heart,
                                    Baby,
                                    UserPlus,
                                    Clock,
                                    Shield,
                                    Crown,
                                    UserCog,
                                    Cat,
                                    Dog,
                                  }[label.icon] || Tag;

                                const usageCount = state.residents.filter((r) =>
                                  r.labels.includes(label.id)
                                ).length;

                                const colorClasses =
                                  {
                                    red: 'bg-red-100 text-red-700 border-red-200',
                                    blue: 'bg-blue-100 text-blue-700 border-blue-200',
                                    purple:
                                      'bg-purple-100 text-purple-700 border-purple-200',
                                    green:
                                      'bg-green-100 text-green-700 border-green-200',
                                    orange:
                                      'bg-orange-100 text-orange-700 border-orange-200',
                                    pink: 'bg-pink-100 text-pink-700 border-pink-200',
                                  }[label.color] ||
                                  'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200';

                                return (
                                  <div
                                    key={label.id}
                                    className={`relative border rounded-lg p-3 transition-all hover:shadow-md ${colorClasses}`}
                                  >
                                    <div className='flex items-center justify-between mb-2'>
                                      <div className='flex items-center space-x-2'>
                                        <Icon size={18} />
                                        <span className='font-medium'>
                                          {label.name}
                                        </span>
                                      </div>
                                      <div className='flex items-center space-x-1'>
                                        <button
                                          onClick={() => {
                                            dispatch({
                                              type: 'UPDATE_RESIDENT_FORM',
                                              payload: { editLabel: label },
                                            });
                                            openModal('addLabel');
                                          }}
                                          className='p-1 hover:bg-white/50 rounded'
                                          title='Bewerken'
                                        >
                                          <Edit size={14} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (
                                              // eslint-disable-next-line no-alert
                                              confirm(
                                                `Weet je zeker dat je label "${label.name}" wilt verwijderen? Dit verwijdert het label ook van alle bewoners.`
                                              )
                                            ) {
                                              dispatch({
                                                type: 'DELETE_LABEL',
                                                payload: label.id,
                                              });
                                            }
                                          }}
                                          className='p-1 hover:bg-white/50 rounded text-red-600'
                                          title='Verwijderen'
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>

                                    <div className='text-sm opacity-75'>
                                      <p className='mb-1'>
                                        Gebruikt door:{' '}
                                        <span className='font-semibold'>
                                          {usageCount}
                                        </span>{' '}
                                        bewoner(s)
                                      </p>
                                      <p>
                                        Kleur:{' '}
                                        <span className='font-semibold capitalize'>
                                          {label.color}
                                        </span>
                                      </p>
                                      <p>
                                        Icoon:{' '}
                                        <span className='font-semibold'>
                                          {label.icon}
                                        </span>
                                      </p>
                                    </div>

                                    {/* Usage bar */}
                                    <div className='mt-2'>
                                      <div className='w-full bg-white/50 rounded-full h-2'>
                                        <div
                                          className='bg-current h-2 rounded-full transition-all'
                                          style={{
                                            width: `${Math.min((usageCount / state.residents.length) * 100, 100)}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}

                    {/* Ungrouped Labels */}
                    {(() => {
                      const groupedLabelIds = Object.values(
                        state.labelGroups
                      ).flat();
                      const ungroupedLabels = state.labels.filter(
                        (l) => !groupedLabelIds.includes(l.id)
                      );

                      if (ungroupedLabels.length === 0) {
                        return null;
                      }

                      return (
                        <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                          <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide'>
                            Overige Labels
                          </h4>
                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                            {ungroupedLabels.map((label) => {
                              const Icon =
                                {
                                  AlertCircle,
                                  Heart,
                                  Baby,
                                  UserPlus,
                                  Clock,
                                  Shield,
                                  Crown,
                                  UserCog,
                                  Cat,
                                  Dog,
                                }[label.icon] || Tag;

                              const usageCount = state.residents.filter((r) =>
                                r.labels.includes(label.id)
                              ).length;

                              const colorClasses =
                                {
                                  red: 'bg-red-100 text-red-700 border-red-200',
                                  blue: 'bg-blue-100 text-blue-700 border-blue-200',
                                  purple:
                                    'bg-purple-100 text-purple-700 border-purple-200',
                                  green:
                                    'bg-green-100 text-green-700 border-green-200',
                                  orange:
                                    'bg-orange-100 text-orange-700 border-orange-200',
                                  pink: 'bg-pink-100 text-pink-700 border-pink-200',
                                }[label.color] ||
                                'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200';

                              return (
                                <div
                                  key={label.id}
                                  className={`relative border rounded-lg p-3 transition-all hover:shadow-md ${colorClasses}`}
                                >
                                  <div className='flex items-center justify-between mb-2'>
                                    <div className='flex items-center space-x-2'>
                                      <Icon size={18} />
                                      <span className='font-medium'>
                                        {label.name}
                                      </span>
                                    </div>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() => {
                                          dispatch({
                                            type: 'UPDATE_RESIDENT_FORM',
                                            payload: { editLabel: label },
                                          });
                                          openModal('addLabel');
                                        }}
                                        className='p-1 hover:bg-white/50 rounded'
                                        title='Bewerken'
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (
                                            // eslint-disable-next-line no-alert
                                            confirm(
                                              `Weet je zeker dat je label "${label.name}" wilt verwijderen? Dit verwijdert het label ook van alle bewoners.`
                                            )
                                          ) {
                                            dispatch({
                                              type: 'DELETE_LABEL',
                                              payload: label.id,
                                            });
                                          }
                                        }}
                                        className='p-1 hover:bg-white/50 rounded text-red-600'
                                        title='Verwijderen'
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  <div className='text-sm opacity-75'>
                                    <p className='mb-1'>
                                      Gebruikt door:{' '}
                                      <span className='font-semibold'>
                                        {usageCount}
                                      </span>{' '}
                                      bewoner(s)
                                    </p>
                                    <p>
                                      Kleur:{' '}
                                      <span className='font-semibold capitalize'>
                                        {label.color}
                                      </span>
                                    </p>
                                    <p>
                                      Icoon:{' '}
                                      <span className='font-semibold'>
                                        {label.icon}
                                      </span>
                                    </p>
                                  </div>

                                  {/* Usage bar */}
                                  <div className='mt-2'>
                                    <div className='w-full bg-white/50 rounded-full h-2'>
                                      <div
                                        className='bg-current h-2 rounded-full transition-all'
                                        style={{
                                          width: `${Math.min((usageCount / state.residents.length) * 100, 100)}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {state.activeView === 'settings' && (
                <div key='settings' className='view-transition'>
                  <h3 className='text-lg font-semibold mb-6'>Instellingen</h3>

                  {/* Notification Settings */}
                  <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6'>
                    <h4 className='text-md font-semibold mb-4 flex items-center'>
                      <Bell className='w-5 h-5 mr-2' />
                      Notificatie Instellingen
                    </h4>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                      Configureer welke activiteiten notificaties genereren
                    </p>

                    <NotificationSettings />
                  </div>

                  {/* Other Settings */}
                  <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
                    <h4 className='text-md font-semibold mb-4'>
                      Andere Instellingen
                    </h4>
                    <p className='text-gray-600 dark:text-gray-400'>
                      Verdere instellingen komen hier...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Label Modal */}
      {state.modals.addLabel && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => closeModal('addLabel')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeModal('addLabel');
              }
            }}
            role='button'
            tabIndex={0}
          />

          <div className='flex min-h-full items-center justify-center p-4'>
            <div className='relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl'>
              {/* Modal Header */}
              <div className='flex items-center justify-between px-6 py-4 border-b'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  {state.residentForm.editLabel
                    ? 'Label Bewerken'
                    : 'Nieuwe Label Toevoegen'}
                </h2>
                <button
                  onClick={() => {
                    closeModal('addLabel');
                    dispatch({
                      type: 'UPDATE_RESIDENT_FORM',
                      payload: {
                        newLabel: { name: '', color: 'blue', icon: 'Tag' },
                        editLabel: null,
                      },
                    });
                  }}
                  className='p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-600'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className='px-6 py-4'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    const labelData = state.residentForm.editLabel
                      ? {
                          ...state.residentForm.editLabel,
                          ...state.residentForm.newLabel,
                        }
                      : state.residentForm.newLabel;

                    if (!labelData.name.trim()) {
                      notify('Vul een label naam in', { type: 'error' });
                      return;
                    }

                    if (state.residentForm.editLabel) {
                      dispatch({ type: 'UPDATE_LABEL', payload: labelData });
                    } else {
                      dispatch({ type: 'CREATE_LABEL', payload: labelData });
                    }

                    closeModal('addLabel');
                    dispatch({
                      type: 'UPDATE_RESIDENT_FORM',
                      payload: {
                        newLabel: { name: '', color: 'blue', icon: 'Tag' },
                        editLabel: null,
                      },
                    });
                  }}
                >
                  <div className='space-y-4'>
                    {/* Label Name */}
                    <div>
                      <label
                        htmlFor='label-name'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                      >
                        Label Naam *
                      </label>
                      <input
                        id='label-name'
                        type='text'
                        value={
                          state.residentForm.editLabel
                            ? state.residentForm.newLabel.name !== ''
                              ? state.residentForm.newLabel.name
                              : state.residentForm.editLabel.name
                            : state.residentForm.newLabel.name
                        }
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_RESIDENT_FORM',
                            payload: {
                              newLabel: {
                                ...state.residentForm.newLabel,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        placeholder='Bijv. Nieuw, Urgent, Medisch'
                      />
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label
                        htmlFor='label-color'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                      >
                        Kleur
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {[
                          'red',
                          'blue',
                          'purple',
                          'green',
                          'orange',
                          'pink',
                          'indigo',
                          'yellow',
                        ].map((color) => {
                          const currentColor = state.residentForm.editLabel
                            ? state.residentForm.newLabel.color !== 'blue'
                              ? state.residentForm.newLabel.color
                              : state.residentForm.editLabel.color
                            : state.residentForm.newLabel.color;

                          const colorClasses = {
                            red: 'bg-red-500',
                            blue: 'bg-blue-500',
                            purple: 'bg-purple-500',
                            green: 'bg-green-500',
                            orange: 'bg-orange-500',
                            pink: 'bg-pink-500',
                            indigo: 'bg-indigo-500',
                            yellow: 'bg-yellow-500',
                          }[color];

                          return (
                            <button
                              key={color}
                              type='button'
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: {
                                    newLabel: {
                                      ...state.residentForm.newLabel,
                                      color,
                                    },
                                  },
                                })
                              }
                              className={`w-8 h-8 rounded-full ${colorClasses} ${
                                currentColor === color
                                  ? 'ring-2 ring-gray-800 ring-offset-2'
                                  : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-1'
                              } transition-all`}
                              title={color}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Icon Picker */}
                    <div>
                      <label
                        htmlFor='label-icon'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                      >
                        Icoon
                      </label>
                      <div className='grid grid-cols-4 gap-2'>
                        {[
                          { name: 'Tag', icon: Tag },
                          { name: 'AlertCircle', icon: AlertCircle },
                          { name: 'Heart', icon: Heart },
                          { name: 'Baby', icon: Baby },
                          { name: 'UserPlus', icon: UserPlus },
                          { name: 'Clock', icon: Clock },
                          { name: 'Shield', icon: Shield },
                          { name: 'Star', icon: Star },
                          { name: 'Bell', icon: Bell },
                          { name: 'Camera', icon: Camera },
                          { name: 'Phone', icon: Phone },
                          { name: 'Mail', icon: Mail },
                        ].map(({ name, icon: IconComponent }) => {
                          const currentIcon = state.residentForm.editLabel
                            ? state.residentForm.newLabel.icon !== 'Tag'
                              ? state.residentForm.newLabel.icon
                              : state.residentForm.editLabel.icon
                            : state.residentForm.newLabel.icon;

                          return (
                            <button
                              key={name}
                              type='button'
                              onClick={() =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: {
                                    newLabel: {
                                      ...state.residentForm.newLabel,
                                      icon: name,
                                    },
                                  },
                                })
                              }
                              className={`p-2 border rounded-lg flex items-center justify-center transition-all ${
                                currentIcon === name
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-600 dark:text-gray-400'
                              }`}
                              title={name}
                            >
                              <IconComponent size={20} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <label
                        htmlFor='label-preview'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                      >
                        Voorbeeld
                      </label>
                      <div className='p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                        {(() => {
                          const previewData = {
                            name: state.residentForm.editLabel
                              ? state.residentForm.newLabel.name !== ''
                                ? state.residentForm.newLabel.name
                                : state.residentForm.editLabel.name
                              : state.residentForm.newLabel.name ||
                                'Label Naam',
                            color: state.residentForm.editLabel
                              ? state.residentForm.newLabel.color !== 'blue'
                                ? state.residentForm.newLabel.color
                                : state.residentForm.editLabel.color
                              : state.residentForm.newLabel.color,
                            icon: state.residentForm.editLabel
                              ? state.residentForm.newLabel.icon !== 'Tag'
                                ? state.residentForm.newLabel.icon
                                : state.residentForm.editLabel.icon
                              : state.residentForm.newLabel.icon,
                          };

                          const PreviewIcon =
                            {
                              Tag,
                              AlertCircle,
                              Heart,
                              Baby,
                              UserPlus,
                              Clock,
                              Shield,
                              Star,
                              Bell,
                              Camera,
                              Phone,
                              Mail,
                            }[previewData.icon] || Tag;

                          const colorClasses =
                            {
                              red: 'bg-red-100 text-red-700 border-red-200',
                              blue: 'bg-blue-100 text-blue-700 border-blue-200',
                              purple:
                                'bg-purple-100 text-purple-700 border-purple-200',
                              green:
                                'bg-green-100 text-green-700 border-green-200',
                              orange:
                                'bg-orange-100 text-orange-700 border-orange-200',
                              pink: 'bg-pink-100 text-pink-700 border-pink-200',
                              indigo:
                                'bg-indigo-100 text-indigo-700 border-indigo-200',
                              yellow:
                                'bg-yellow-100 text-yellow-700 border-yellow-200',
                            }[previewData.color] ||
                            'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200';

                          return (
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${colorClasses}`}
                            >
                              <PreviewIcon size={14} className='mr-1.5' />
                              <span>{previewData.name}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
                    <button
                      type='button'
                      onClick={() => {
                        closeModal('addLabel');
                        dispatch({
                          type: 'UPDATE_RESIDENT_FORM',
                          payload: {
                            newLabel: { name: '', color: 'blue', icon: 'Tag' },
                            editLabel: null,
                          },
                        });
                      }}
                      className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 rounded-lg transition-colors'
                    >
                      Annuleren
                    </button>
                    <button
                      type='submit'
                      className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
                    >
                      {state.residentForm.editLabel ? 'Opslaan' : 'Aanmaken'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resident Modal */}
      {state.modals.addResident && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div
            className='fixed inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => closeModal('addResident')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeModal('addResident');
              }
            }}
            role='button'
            tabIndex={0}
          />

          <div className='flex min-h-full items-center justify-center p-4'>
            <div className='relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl'>
              {/* Modal Header */}
              <div className='flex items-center justify-between px-6 py-4 border-b'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  {state.selectedResident
                    ? state.selectedResident.type === 'human'
                      ? 'Bewoner Bewerken'
                      : state.selectedResident.type === 'cat'
                        ? 'Kat Bewerken'
                        : 'Hond Bewerken'
                    : state.residentForm.type === 'human'
                      ? 'Nieuwe Bewoner Toevoegen'
                      : state.residentForm.type === 'cat'
                        ? 'Nieuwe Kat Toevoegen'
                        : state.residentForm.type === 'dog'
                          ? 'Nieuwe Hond Toevoegen'
                          : 'Nieuwe Bewoner Toevoegen'}
                </h2>
                <button
                  onClick={() => {
                    closeModal('addResident');
                    dispatch({ type: 'RESET_RESIDENT_FORM' });
                    dispatch({ type: 'SET_SELECTED_RESIDENT', payload: null });
                  }}
                  className='p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-600'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className='px-6 py-4 max-h-[80vh] overflow-y-auto'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Validation
                    const isHuman = state.residentForm.type === 'human';
                    const requiredFields = [
                      state.residentForm.firstName,
                      state.residentForm.birthDate,
                      state.residentForm.roomNumber,
                      state.residentForm.gender,
                    ];

                    if (isHuman) {
                      requiredFields.push(state.residentForm.lastName);
                      requiredFields.push(state.residentForm.nationality);
                    }

                    if (requiredFields.some((field) => !field)) {
                      notify('Vul alle verplichte velden in', {
                        type: 'error',
                      });
                      return;
                    }

                    // BSN validation
                    const bsnCheck = validateBSN(state.residentForm.bsn);
                    if (!bsnCheck.valid) {
                      notify(`BSN fout: ${bsnCheck.message}`, {
                        type: 'error',
                      });
                      return;
                    }

                    if (state.selectedResident) {
                      // Log audit entry and trigger notification
                      const auditEntry = auditHelpers.logResidentUpdated(
                        user,
                        state.selectedResident,
                        { old: state.selectedResident, new: state.residentForm }
                      );
                      processAuditEntry(auditEntry);

                      dispatch({
                        type: 'UPDATE_RESIDENT',
                        payload: {
                          ...state.residentForm,
                          id: state.selectedResident.id,
                        },
                      });
                    } else {
                      // Handle family connection when adding new resident
                      const newResidentData = { ...state.residentForm };

                      // If there's a temporary family connection, we need to update the related resident too
                      if (state.residentForm.tempFamilyConnection) {
                        const relatedResident =
                          state.residentForm.tempFamilyConnection
                            .relatedResident;
                        const relationship =
                          state.residentForm.tempFamilyConnection.relationship;

                        // Update the related resident's family information
                        dispatch({
                          type: 'UPDATE_RESIDENT',
                          payload: {
                            ...relatedResident,
                            familyId: newResidentData.familyId,
                            familyRole:
                              relationship === 'child'
                                ? 'parent'
                                : relationship === 'parent'
                                  ? 'child'
                                  : 'sibling',
                            familyMembers: [
                              newResidentData.id || 'temp_new_resident',
                            ],
                          },
                        });
                      }

                      dispatch({
                        type: 'ADD_RESIDENT',
                        payload: newResidentData,
                      });

                      // Log audit entry and trigger notification
                      const auditEntry = auditHelpers.logResidentCreated(
                        user,
                        newResidentData
                      );
                      processAuditEntry(auditEntry);
                    }

                    // Close modal and reset form
                    closeModal('addResident');
                    dispatch({ type: 'SET_SELECTED_RESIDENT', payload: null });
                    dispatch({ type: 'RESET_RESIDENT_FORM' });
                  }}
                >
                  {/* Type Selection - MOVED TO TOP */}
                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-4'>
                        Type bewoner *
                      </h3>
                      {state.selectedResident ? (
                        // Read-only display when editing
                        <div className='p-4 bg-gray-50 border border-gray-300 rounded-lg'>
                          <div className='flex items-center gap-3'>
                            {state.selectedResident.type === 'human' && (
                              <User className='w-6 h-6 text-blue-600' />
                            )}
                            {state.selectedResident.type === 'cat' && (
                              <Cat className='w-6 h-6 text-purple-600' />
                            )}
                            {state.selectedResident.type === 'dog' && (
                              <Dog className='w-6 h-6 text-orange-600' />
                            )}
                            <span className='text-sm font-medium text-gray-700'>
                              {state.selectedResident.type === 'human'
                                ? 'Mens'
                                : state.selectedResident.type === 'cat'
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
                        <div className='grid grid-cols-3 gap-4'>
                          <button
                            type='button'
                            onClick={() =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { type: 'human', breed: '' },
                              })
                            }
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              state.residentForm.type === 'human'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <div className='flex flex-col items-center'>
                              <User className='w-8 h-8 mb-2 text-gray-600 dark:text-gray-400' />
                              <span className='text-sm font-medium'>Mens</span>
                            </div>
                          </button>

                          <button
                            type='button'
                            onClick={() =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { type: 'cat', breed: '' },
                              })
                            }
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              state.residentForm.type === 'cat'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <div className='flex flex-col items-center'>
                              <Cat className='w-8 h-8 mb-2 text-purple-600' />
                              <span className='text-sm font-medium'>Kat</span>
                            </div>
                          </button>

                          <button
                            type='button'
                            onClick={() =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { type: 'dog', breed: '' },
                              })
                            }
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              state.residentForm.type === 'dog'
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            <div className='flex flex-col items-center'>
                              <Dog className='w-8 h-8 mb-2 text-orange-600' />
                              <span className='text-sm font-medium'>Hond</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Basic Information */}
                    <div>
                      <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                        Basis Informatie
                      </h3>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label
                            htmlFor='firstName'
                            className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                          >
                            {state.residentForm.type === 'human'
                              ? 'Voornaam'
                              : 'Naam'}{' '}
                            <span className='text-red-500'>*</span>
                          </label>
                          <input
                            id='firstName'
                            type='text'
                            value={state.residentForm.firstName}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { firstName: e.target.value },
                              })
                            }
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            placeholder={
                              state.residentForm.type === 'human'
                                ? 'Voornaam'
                                : state.residentForm.type === 'cat'
                                  ? 'Bijv. Whiskers'
                                  : 'Bijv. Bella'
                            }
                          />
                        </div>

                        {state.residentForm.type === 'human' && (
                          <div>
                            <label
                              htmlFor='lastName'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Achternaam <span className='text-red-500'>*</span>
                            </label>
                            <input
                              id='lastName'
                              type='text'
                              value={state.residentForm.lastName}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { lastName: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder='Achternaam'
                            />
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor='birthDate'
                            className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                          >
                            {state.residentForm.type === 'human'
                              ? 'Geboortedatum'
                              : 'Geboortedatum'}{' '}
                            <span className='text-red-500'>*</span>
                          </label>
                          <input
                            id='birthDate'
                            type='date'
                            value={state.residentForm.birthDate}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { birthDate: e.target.value },
                              })
                            }
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        {state.residentForm.type === 'human' && (
                          <div>
                            <label
                              htmlFor='gender'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Geslacht <span className='text-red-500'>*</span>
                            </label>
                            <select
                              id='gender'
                              value={state.residentForm.gender || ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { gender: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            >
                              <option value=''>Selecteer geslacht</option>
                              <option value='M'>Man</option>
                              <option value='V'>Vrouw</option>
                            </select>
                          </div>
                        )}

                        {state.residentForm.type === 'human' && (
                          <div>
                            <label
                              htmlFor='nationality'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Nationaliteit{' '}
                              <span className='text-red-500'>*</span>
                            </label>
                            <input
                              id='nationality'
                              type='text'
                              value={state.residentForm.nationality}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { nationality: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder='Nationaliteit'
                            />
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor='roomNumber'
                            className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                          >
                            Kamernummer <span className='text-red-500'>*</span>
                          </label>
                          <input
                            id='roomNumber'
                            type='text'
                            value={state.residentForm.roomNumber}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { roomNumber: e.target.value },
                              })
                            }
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            placeholder='Bijv. 204'
                          />
                        </div>

                        <div>
                          <label
                            htmlFor='arrivalDate'
                            className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                          >
                            Aankomstdatum
                          </label>
                          <input
                            id='arrivalDate'
                            type='date'
                            value={state.residentForm.arrivalDate}
                            onChange={(e) =>
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: { arrivalDate: e.target.value },
                              })
                            }
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          />
                        </div>

                        {state.residentForm.type === 'human' && (
                          <div>
                            <label
                              htmlFor='bsn'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              BSN Nummer
                            </label>
                            <div className='relative'>
                              <input
                                id='bsn'
                                type='text'
                                value={formatBSN(state.residentForm.bsn || '')}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /\s/g,
                                    ''
                                  ); // Remove spaces for storage
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { bsn: value },
                                  });
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                  state.residentForm.bsn &&
                                  !validateBSN(state.residentForm.bsn).valid
                                    ? 'border-red-300 focus:ring-red-500'
                                    : state.residentForm.bsn &&
                                        validateBSN(state.residentForm.bsn)
                                          .valid
                                      ? 'border-green-300 focus:ring-green-500'
                                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                }`}
                                placeholder='123 456 789'
                                maxLength='11'
                              />
                              {state.residentForm.bsn && (
                                <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                                  {validateBSN(state.residentForm.bsn).valid ? (
                                    <CheckCircle className='w-5 h-5 text-green-500' />
                                  ) : (
                                    <AlertCircle className='w-5 h-5 text-red-500' />
                                  )}
                                </div>
                              )}
                            </div>
                            {state.residentForm.bsn && (
                              <p
                                className={`text-xs mt-1 ${
                                  validateBSN(state.residentForm.bsn).valid
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {validateBSN(state.residentForm.bsn).message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Animal-specific Information */}
                    {state.residentForm.type !== 'human' && (
                      <div>
                        <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                          Dier Informatie
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label
                              htmlFor='animal-gender'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Geslacht <span className='text-red-500'>*</span>
                            </label>
                            <select
                              id='animal-gender'
                              value={state.residentForm.gender || ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { gender: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            >
                              <option value=''>Selecteer geslacht</option>
                              <option value='M'>Mannelijk</option>
                              <option value='V'>Vrouwelijk</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor='breed'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Ras
                            </label>
                            {state.residentForm.type === 'dog' ? (
                              <AutocompleteSelect
                                id='breed'
                                value={state.residentForm.breed || ''}
                                onChange={(value) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { breed: value },
                                  })
                                }
                                options={[
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
                                ]}
                                placeholder='Type om hondenras te zoeken...'
                                allowCustom={true}
                              />
                            ) : state.residentForm.type === 'cat' ? (
                              <AutocompleteSelect
                                value={state.residentForm.breed || ''}
                                onChange={(value) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { breed: value },
                                  })
                                }
                                options={[
                                  'Abessijn',
                                  'Bengaal',
                                  'Birmaan',
                                  'Birman',
                                  'Bombay',
                                  'Britse Korthaar',
                                  'Burmese',
                                  'Chartreux',
                                  'Cornish Rex',
                                  'Devon Rex',
                                  'Exotic Shorthair',
                                  'Maine Coon',
                                  'Manx',
                                  'Munchkin',
                                  'Noorse Boskat',
                                  'Ocicat',
                                  'Orientaal',
                                  'Perzische Kat',
                                  'Ragdoll',
                                  'Russisch Blauw',
                                  'Scottish Fold',
                                  'Siamese',
                                  'Somali',
                                  'Sphynx',
                                  'Tonkinese',
                                  'Turkse Angora',
                                ]}
                                placeholder='Type om kattenras te zoeken...'
                                allowCustom={true}
                              />
                            ) : (
                              <input
                                id='breed'
                                type='text'
                                value={state.residentForm.breed || ''}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { breed: e.target.value },
                                  })
                                }
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Ras (optioneel)'
                              />
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor='weight'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Gewicht (kg)
                            </label>
                            <input
                              id='weight'
                              type='number'
                              step='0.1'
                              value={state.residentForm.weight || ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { weight: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder='5.2'
                            />
                          </div>

                          <div className='col-span-2'>
                            <div className='flex items-center space-x-3'>
                              <input
                                type='checkbox'
                                id='isVaccinated'
                                checked={
                                  state.residentForm.isVaccinated || false
                                }
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { isVaccinated: e.target.checked },
                                  })
                                }
                                className='w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500'
                              />
                              <label
                                htmlFor='isVaccinated'
                                className='text-sm font-medium text-gray-700 dark:text-gray-300'
                              >
                                Dier is ingeënt
                              </label>
                            </div>
                          </div>

                          {state.residentForm.isVaccinated && (
                            <div>
                              <label
                                htmlFor='vaccinationDate'
                                className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                              >
                                Laatste Vaccinatiedatum
                              </label>
                              <input
                                id='vaccinationDate'
                                type='date'
                                value={state.residentForm.vaccinationDate || ''}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: {
                                      vaccinationDate: e.target.value,
                                    },
                                  })
                                }
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              />
                            </div>
                          )}

                          {!state.residentForm.isVaccinated && (
                            <div>
                              <label
                                htmlFor='nextVaccinationDate'
                                className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                              >
                                Volgende Vaccinatiedatum
                              </label>
                              <input
                                id='nextVaccinationDate'
                                type='date'
                                value={
                                  state.residentForm.nextVaccinationDate || ''
                                }
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: {
                                      nextVaccinationDate: e.target.value,
                                    },
                                  })
                                }
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>
                          )}

                          {/* Microchip Information */}
                          <div className='col-span-2'>
                            <div className='flex items-center space-x-3 mb-3'>
                              <input
                                type='checkbox'
                                id='isChipped'
                                checked={state.residentForm.isChipped || false}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { isChipped: e.target.checked },
                                  })
                                }
                                className='w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500'
                              />
                              <label
                                htmlFor='isChipped'
                                className='text-sm font-medium text-gray-700 dark:text-gray-300'
                              >
                                Dier is gechipt
                              </label>
                            </div>
                            {state.residentForm.isChipped && (
                              <input
                                type='text'
                                value={state.residentForm.chipNumber || ''}
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { chipNumber: e.target.value },
                                  })
                                }
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Chipnummer'
                              />
                            )}
                          </div>

                          {/* Sterilization Information */}
                          <div className='col-span-2'>
                            <div className='flex items-center space-x-3 mb-3'>
                              <input
                                type='checkbox'
                                id='isSterilized'
                                checked={
                                  state.residentForm.isSterilized || false
                                }
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { isSterilized: e.target.checked },
                                  })
                                }
                                className='w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500'
                              />
                              <label
                                htmlFor='isSterilized'
                                className='text-sm font-medium text-gray-700 dark:text-gray-300'
                              >
                                Dier is gesteriliseerd
                              </label>
                            </div>
                            {state.residentForm.isSterilized && (
                              <input
                                type='date'
                                value={
                                  state.residentForm.sterilizationDate || ''
                                }
                                onChange={(e) =>
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: {
                                      sterilizationDate: e.target.value,
                                    },
                                  })
                                }
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              />
                            )}
                          </div>

                          {/* Animal Archive Options */}
                          {state.selectedResident &&
                            state.selectedResident.type !== 'human' && (
                              <div className='col-span-2 mt-4 pt-4 border-t border-gray-200'>
                                <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
                                  Archivering
                                </h4>
                                <div className='space-y-3'>
                                  <div className='flex items-center space-x-3'>
                                    <input
                                      type='checkbox'
                                      id='isArchived'
                                      checked={
                                        state.residentForm.isArchived || false
                                      }
                                      onChange={(e) =>
                                        dispatch({
                                          type: 'UPDATE_RESIDENT_FORM',
                                          payload: {
                                            isArchived: e.target.checked,
                                          },
                                        })
                                      }
                                      className='w-4 h-4 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500'
                                    />
                                    <label
                                      htmlFor='isArchived'
                                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                                    >
                                      Dier archiveren
                                    </label>
                                  </div>

                                  {state.residentForm.isArchived && (
                                    <div>
                                      <label
                                        htmlFor='archive-reason-form'
                                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                      >
                                        Reden voor archivering
                                      </label>
                                      <select
                                        id='archive-reason-form'
                                        value={
                                          state.residentForm.archiveReason || ''
                                        }
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_RESIDENT_FORM',
                                            payload: {
                                              archiveReason: e.target.value,
                                            },
                                          })
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                                      >
                                        <option value=''>
                                          Selecteer reden...
                                        </option>
                                        <option value='deceased'>
                                          Overleden
                                        </option>
                                        <option value='sold'>Verkocht</option>
                                        <option value='transferred'>
                                          Overgeplaatst
                                        </option>
                                        <option value='other'>Andere</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    {state.residentForm.type === 'human' && (
                      <div>
                        <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                          Contact Informatie
                        </h3>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label
                              htmlFor='phone'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Telefoon
                            </label>
                            <input
                              id='phone'
                              type='tel'
                              value={state.residentForm.phone || ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { phone: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder='+31 6 12345678'
                            />
                          </div>

                          <div>
                            <label
                              htmlFor='email'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Email
                            </label>
                            <input
                              id='email'
                              type='email'
                              value={state.residentForm.email || ''}
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: { email: e.target.value },
                                })
                              }
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                              placeholder='email@example.com'
                            />
                          </div>

                          <div className='col-span-2'>
                            <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
                              Noodcontact
                            </h4>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <label
                                  htmlFor='emergency-firstName'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                >
                                  Voornaam{' '}
                                  {(state.residentForm.emergencyContact
                                    ?.lastName ||
                                    state.residentForm.emergencyContact
                                      ?.gender ||
                                    state.residentForm.emergencyContact
                                      ?.relationship ||
                                    state.residentForm.emergencyContact
                                      ?.phone) && (
                                    <span className='text-red-500'>*</span>
                                  )}
                                </label>
                                <input
                                  id='emergency-firstName'
                                  type='text'
                                  value={
                                    state.residentForm.emergencyContact
                                      ?.firstName || ''
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        emergencyContact: {
                                          ...state.residentForm
                                            .emergencyContact,
                                          firstName: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                  placeholder='Voornaam'
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor='emergency-lastName'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                >
                                  Achternaam{' '}
                                  {(state.residentForm.emergencyContact
                                    ?.firstName ||
                                    state.residentForm.emergencyContact
                                      ?.gender ||
                                    state.residentForm.emergencyContact
                                      ?.relationship ||
                                    state.residentForm.emergencyContact
                                      ?.phone) && (
                                    <span className='text-red-500'>*</span>
                                  )}
                                </label>
                                <input
                                  id='emergency-lastName'
                                  type='text'
                                  value={
                                    state.residentForm.emergencyContact
                                      ?.lastName || ''
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        emergencyContact: {
                                          ...state.residentForm
                                            .emergencyContact,
                                          lastName: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                  placeholder='Achternaam'
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor='emergency-gender'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                >
                                  Geslacht{' '}
                                  {(state.residentForm.emergencyContact
                                    ?.firstName ||
                                    state.residentForm.emergencyContact
                                      ?.lastName ||
                                    state.residentForm.emergencyContact
                                      ?.relationship ||
                                    state.residentForm.emergencyContact
                                      ?.phone) && (
                                    <span className='text-red-500'>*</span>
                                  )}
                                </label>
                                <select
                                  id='emergency-gender'
                                  value={
                                    state.residentForm.emergencyContact
                                      ?.gender || ''
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        emergencyContact: {
                                          ...state.residentForm
                                            .emergencyContact,
                                          gender: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                  <option value=''>Selecteer geslacht</option>
                                  <option value='M'>Man</option>
                                  <option value='V'>Vrouw</option>
                                </select>
                              </div>
                              <div>
                                <label
                                  htmlFor='emergency-relationship'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                >
                                  Relatie{' '}
                                  {(state.residentForm.emergencyContact
                                    ?.firstName ||
                                    state.residentForm.emergencyContact
                                      ?.lastName ||
                                    state.residentForm.emergencyContact
                                      ?.gender ||
                                    state.residentForm.emergencyContact
                                      ?.phone) && (
                                    <span className='text-red-500'>*</span>
                                  )}
                                </label>
                                <select
                                  id='emergency-relationship'
                                  value={
                                    state.residentForm.emergencyContact
                                      ?.relationship || ''
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        emergencyContact: {
                                          ...state.residentForm
                                            .emergencyContact,
                                          relationship: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                  <option value=''>Selecteer relatie</option>
                                  <option value='parent'>Ouder</option>
                                  <option value='child'>Kind</option>
                                  <option value='sibling'>Broer/Zus</option>
                                  <option value='spouse'>Partner</option>
                                  <option value='friend'>
                                    Vriend/Vriendin
                                  </option>
                                  <option value='family'>Familie</option>
                                  <option value='other'>Anders</option>
                                </select>
                              </div>
                              <div className='col-span-2'>
                                <label
                                  htmlFor='emergency-phone'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                                >
                                  Telefoonnummer{' '}
                                  {(state.residentForm.emergencyContact
                                    ?.firstName ||
                                    state.residentForm.emergencyContact
                                      ?.lastName ||
                                    state.residentForm.emergencyContact
                                      ?.gender ||
                                    state.residentForm.emergencyContact
                                      ?.relationship) && (
                                    <span className='text-red-500'>*</span>
                                  )}
                                </label>
                                <input
                                  id='emergency-phone'
                                  type='tel'
                                  value={
                                    state.residentForm.emergencyContact
                                      ?.phone || ''
                                  }
                                  onChange={(e) =>
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        emergencyContact: {
                                          ...state.residentForm
                                            .emergencyContact,
                                          phone: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                  placeholder='+31 6 12345678'
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Labels */}
                    <div>
                      <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                        Labels
                      </h3>

                      {/* Automatic Labels (Read-only) */}
                      {(() => {
                        const autoLabels = getAutomaticLabels(
                          state.residentForm.birthDate,
                          state.selectedResident?.registrationDate,
                          state.residentForm.type || 'human',
                          state.residentForm.isVaccinated || false,
                          state.residentForm.nextVaccinationDate,
                          state.residentForm.isChipped || false,
                          state.residentForm.isSterilized || false
                        );
                        if (autoLabels.length === 0) {
                          return null;
                        }

                        return (
                          <div className='mb-4'>
                            <h4 className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                              Automatische Labels
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {autoLabels.map((labelId) => {
                                const label = state.labels.find(
                                  (l) => l.id === labelId
                                );
                                if (!label) {
                                  return null;
                                }

                                const Icon =
                                  {
                                    AlertCircle,
                                    Heart,
                                    Baby,
                                    UserPlus,
                                    Clock,
                                    Shield,
                                    Crown,
                                    UserCog,
                                    Cat,
                                    Dog,
                                  }[label.icon] || Tag;

                                const colorClasses =
                                  {
                                    red: 'bg-red-100 text-red-700 border-red-200',
                                    blue: 'bg-blue-100 text-blue-700 border-blue-200',
                                    purple:
                                      'bg-purple-100 text-purple-700 border-purple-200',
                                    green:
                                      'bg-green-100 text-green-700 border-green-200',
                                    orange:
                                      'bg-orange-100 text-orange-700 border-orange-200',
                                    pink: 'bg-pink-100 text-pink-700 border-pink-200',
                                  }[label.color] ||
                                  'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-200';

                                return (
                                  <span
                                    key={label.id}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${colorClasses} opacity-75`}
                                  >
                                    <Icon size={14} className='mr-1.5' />
                                    <span>{label.name}</span>
                                    <span className='ml-2 text-xs'>⚙️</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Manual Labels */}
                      <h4 className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-2'>
                        Handmatige Labels
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {state.labels
                          .filter((label) => !label.automatic)
                          .map((label) => {
                            const Icon =
                              {
                                AlertCircle,
                                Heart,
                                Baby,
                                UserPlus,
                                Clock,
                                Shield,
                                Crown,
                                UserCog,
                                Cat,
                                Dog,
                              }[label.icon] || Tag;

                            const isSelected =
                              state.residentForm.labels.includes(label.id);

                            const colorClasses = isSelected
                              ? {
                                  red: 'bg-red-600 text-white border-red-600',
                                  blue: 'bg-blue-600 text-white border-blue-600',
                                  purple:
                                    'bg-purple-600 text-white border-purple-600',
                                  green:
                                    'bg-green-600 text-white border-green-600',
                                  orange:
                                    'bg-orange-600 text-white border-orange-600',
                                  pink: 'bg-pink-600 text-white border-pink-600',
                                }[label.color]
                              : {
                                  red: 'bg-white text-red-700 border-red-300 hover:border-red-400',
                                  blue: 'bg-white text-blue-700 border-blue-300 hover:border-blue-400',
                                  purple:
                                    'bg-white text-purple-700 border-purple-300 hover:border-purple-400',
                                  green:
                                    'bg-white text-green-700 border-green-300 hover:border-green-400',
                                  orange:
                                    'bg-white text-orange-700 border-orange-300 hover:border-orange-400',
                                  pink: 'bg-white text-pink-700 border-pink-300 hover:border-pink-400',
                                }[label.color];

                            return (
                              <button
                                key={label.id}
                                type='button'
                                onClick={() => {
                                  const newLabels = isSelected
                                    ? state.residentForm.labels.filter(
                                        (id) => id !== label.id
                                      )
                                    : [...state.residentForm.labels, label.id];
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: { labels: newLabels },
                                  });
                                }}
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${colorClasses}`}
                              >
                                <Icon size={14} className='mr-1.5' />
                                <span>{label.name}</span>
                                {isSelected && (
                                  <Check size={14} className='ml-1.5' />
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Family Section */}
                    <div>
                      <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                        Familie Informatie
                      </h3>

                      {/* Manual Family Creation */}
                      <div className='mb-6'>
                        <div className='space-y-4'>
                          {/* Resident Search */}
                          <div>
                            <label
                              htmlFor='resident-search'
                              className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1'
                            >
                              Zoek Bewoner
                            </label>
                            <div className='relative'>
                              <input
                                id='resident-search'
                                type='text'
                                placeholder='Typ naam om te zoeken...'
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                onChange={(e) => {
                                  const query = e.target.value.toLowerCase();
                                  const filteredResidents =
                                    state.residents.filter(
                                      (r) =>
                                        r.id !== state.selectedResident?.id && // Exclude self
                                        (r.name
                                          ?.toLowerCase()
                                          .includes(query) ||
                                          r.firstName
                                            ?.toLowerCase()
                                            .includes(query) ||
                                          r.lastName
                                            ?.toLowerCase()
                                            .includes(query))
                                    );
                                  dispatch({
                                    type: 'UPDATE_RESIDENT_FORM',
                                    payload: {
                                      familySearchQuery: e.target.value,
                                      familySearchResults:
                                        filteredResidents.slice(0, 5), // Top 5 results
                                    },
                                  });
                                }}
                                value={
                                  state.residentForm.familySearchQuery || ''
                                }
                              />

                              {/* Search Results Dropdown */}
                              {state.residentForm.familySearchQuery &&
                                state.residentForm.familySearchResults?.length >
                                  0 && (
                                  <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                                    {state.residentForm.familySearchResults.map(
                                      (resident) => {
                                        const age = calculateAge(
                                          resident.birthDate
                                        );
                                        const currentAge = calculateAge(
                                          state.residentForm.birthDate
                                        );

                                        // Smart relationship suggestions based on age
                                        const suggestedRelationships = [];
                                        if (age && currentAge) {
                                          const ageDiff = Math.abs(
                                            age - currentAge
                                          );

                                          if (ageDiff >= 15 && ageDiff <= 50) {
                                            if (age > currentAge) {
                                              suggestedRelationships.push(
                                                'ouder',
                                                'grootouder'
                                              );
                                            } else {
                                              suggestedRelationships.push(
                                                'kind',
                                                'kleinkind'
                                              );
                                            }
                                          }

                                          if (
                                            ageDiff <= 15 &&
                                            age >= 18 &&
                                            currentAge >= 18
                                          ) {
                                            suggestedRelationships.push(
                                              'partner',
                                              'echtgenoot'
                                            );
                                          }

                                          if (ageDiff <= 20) {
                                            suggestedRelationships.push(
                                              'broer',
                                              'zus'
                                            );
                                          }

                                          if (ageDiff >= 10 && ageDiff <= 30) {
                                            suggestedRelationships.push(
                                              'oom',
                                              'tante',
                                              'neef',
                                              'nicht'
                                            );
                                          }
                                        }

                                        return (
                                          <div
                                            key={resident.id}
                                            className='p-3 hover:bg-gray-50 dark:bg-gray-700 border-b border-gray-100 last:border-b-0'
                                          >
                                            <div className='flex items-center justify-between'>
                                              <div className='flex items-center space-x-3'>
                                                <div className='w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center'>
                                                  <User className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                                                </div>
                                                <div>
                                                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                                                    {resident.name}
                                                  </p>
                                                  <p className='text-sm text-gray-500'>
                                                    {age} jaar •{' '}
                                                    {resident.type === 'human'
                                                      ? resident.nationality
                                                      : resident.breed}{' '}
                                                    • Kamer{' '}
                                                    {resident.roomNumber}
                                                  </p>
                                                  {suggestedRelationships.length >
                                                    0 && (
                                                    <p className='text-xs text-blue-600 mt-1'>
                                                      Suggesties:{' '}
                                                      {suggestedRelationships
                                                        .slice(0, 3)
                                                        .join(', ')}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              <button
                                                type='button'
                                                onClick={() => {
                                                  dispatch({
                                                    type: 'UPDATE_RESIDENT_FORM',
                                                    payload: {
                                                      selectedFamilyMember:
                                                        resident,
                                                      suggestedRelationships,
                                                      familySearchQuery: '',
                                                      familySearchResults: [],
                                                    },
                                                  });
                                                }}
                                                className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
                                              >
                                                Selecteer
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Selected Family Member & Relationship Type */}
                          {state.residentForm.selectedFamilyMember && (
                            <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                              <div className='flex items-center justify-between mb-3'>
                                <div className='flex items-center space-x-3'>
                                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                    <User className='w-5 h-5 text-blue-600' />
                                  </div>
                                  <div>
                                    <p className='font-medium text-gray-900 dark:text-gray-100'>
                                      {
                                        state.residentForm.selectedFamilyMember
                                          .name
                                      }
                                    </p>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                      {calculateAge(
                                        state.residentForm.selectedFamilyMember
                                          .birthDate
                                      )}{' '}
                                      jaar •{' '}
                                      {
                                        state.residentForm.selectedFamilyMember
                                          .nationality
                                      }
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type='button'
                                  onClick={() => {
                                    dispatch({
                                      type: 'UPDATE_RESIDENT_FORM',
                                      payload: {
                                        selectedFamilyMember: null,
                                        suggestedRelationships: [],
                                        selectedRelationshipType: '',
                                      },
                                    });
                                  }}
                                  className='p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400'
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              {/* Relationship Type Selection */}
                              <div>
                                <label
                                  htmlFor='relation-type'
                                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-2'
                                >
                                  Relatie Type
                                </label>
                                <div className='grid grid-cols-3 gap-2'>
                                  {[
                                    'ouder',
                                    'kind',
                                    'partner',
                                    'echtgenoot',
                                    'broer',
                                    'zus',
                                    'grootouder',
                                    'kleinkind',
                                    'oom',
                                    'tante',
                                    'neef',
                                    'nicht',
                                    'stiefouder',
                                    'stiefkind',
                                    'vriend',
                                    'andere',
                                  ].map((type) => {
                                    const issuggested =
                                      state.residentForm.suggestedRelationships?.includes(
                                        type
                                      );
                                    return (
                                      <button
                                        key={type}
                                        type='button'
                                        onClick={() => {
                                          dispatch({
                                            type: 'UPDATE_RESIDENT_FORM',
                                            payload: {
                                              selectedRelationshipType: type,
                                            },
                                          });
                                        }}
                                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                          state.residentForm
                                            .selectedRelationshipType === type
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : issuggested
                                              ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                                              : 'bg-white text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'
                                        }`}
                                      >
                                        {type.charAt(0).toUpperCase() +
                                          type.slice(1)}
                                        {issuggested && (
                                          <span className='ml-1'>⭐</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Add Family Connection Button */}
                              {state.residentForm.selectedRelationshipType && (
                                <div className='mt-4'>
                                  <button
                                    type='button'
                                    onClick={() => {
                                      const familyMember =
                                        state.residentForm.selectedFamilyMember;
                                      const relationshipType =
                                        state.residentForm
                                          .selectedRelationshipType;

                                      // Create family connection
                                      const familyId =
                                        familyMember.familyId ||
                                        `fam_${Date.now()}`;

                                      // Update current resident form with family info
                                      dispatch({
                                        type: 'UPDATE_RESIDENT_FORM',
                                        payload: {
                                          familyId,
                                          familyRole: relationshipType,
                                          familyMembers: [
                                            ...(state.residentForm
                                              .familyMembers || []),
                                            familyMember.id,
                                          ],
                                          // Clear selection
                                          selectedFamilyMember: null,
                                          selectedRelationshipType: '',
                                          suggestedRelationships: [],
                                        },
                                      });

                                      // Update the related resident
                                      const bidirectionalType =
                                        {
                                          ouder: 'kind',
                                          kind: 'ouder',
                                          partner: 'partner',
                                          echtgenoot: 'echtgenoot',
                                          broer: 'zus',
                                          zus: 'broer', // Note: could be improved
                                          grootouder: 'kleinkind',
                                          kleinkind: 'grootouder',
                                          oom: 'neef',
                                          tante: 'nicht',
                                          neef: 'oom',
                                          nicht: 'tante',
                                          stiefouder: 'stiefkind',
                                          stiefkind: 'stiefouder',
                                        }[relationshipType] || 'familie';

                                      dispatch({
                                        type: 'UPDATE_RESIDENT',
                                        payload: {
                                          ...familyMember,
                                          familyId,
                                          familyRole: bidirectionalType,
                                          familyMembers: [
                                            ...(familyMember.familyMembers ||
                                              []),
                                            state.selectedResident?.id || 'new',
                                          ],
                                        },
                                      });
                                    }}
                                    className='w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                                  >
                                    ✓ Familie Relatie Toevoegen:{' '}
                                    {
                                      state.residentForm
                                        .selectedRelationshipType
                                    }
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Family Suggestions */}
                      {state.residentForm.showFamilySuggestions &&
                        state.residentForm.familySuggestions.length > 0 && (
                          <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                            <div className='flex items-center space-x-2 mb-3'>
                              <Users className='w-5 h-5 text-blue-600' />
                              <h4 className='font-medium text-blue-900'>
                                Mogelijke familie gevonden!
                              </h4>
                            </div>
                            <div className='space-y-2'>
                              {state.residentForm.familySuggestions.map(
                                (suggestion, index) => (
                                  <div
                                    key={index}
                                    className='bg-white p-3 rounded border border-blue-200'
                                  >
                                    <div className='flex items-center justify-between'>
                                      <div className='flex items-center space-x-3'>
                                        <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                          <User className='w-4 h-4 text-blue-600' />
                                        </div>
                                        <div>
                                          <p className='font-medium text-gray-900 dark:text-gray-100'>
                                            {suggestion.resident.name}
                                          </p>
                                          <p className='text-sm text-gray-500'>
                                            {calculateAge(
                                              suggestion.resident.birthDate
                                            )}{' '}
                                            jaar •{' '}
                                            {suggestion.resident.type ===
                                            'human'
                                              ? suggestion.resident.nationality
                                              : suggestion.resident.breed}
                                            {suggestion.resident.roomNumber && (
                                              <span className='ml-2'>
                                                • Kamer{' '}
                                                {suggestion.resident.roomNumber}
                                              </span>
                                            )}
                                          </p>
                                          <div className='flex flex-wrap gap-1 mt-1'>
                                            {suggestion.existingFamilyId && (
                                              <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                                                Heeft al familie
                                              </span>
                                            )}
                                            {suggestion.mixedNationality && (
                                              <span className='text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded'>
                                                Gemengd koppel
                                              </span>
                                            )}
                                            {suggestion.resident.roomNumber ===
                                              state.residentForm.roomNumber && (
                                              <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                                                Zelfde kamer
                                              </span>
                                            )}
                                            {Math.abs(
                                              new Date(
                                                suggestion.resident.registrationDate
                                              ) -
                                                new Date(
                                                  state.residentForm.arrivalDate
                                                )
                                            ) <=
                                              24 * 60 * 60 * 1000 && (
                                              <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                                                Zelfde aankomst
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className='flex items-center space-x-2'>
                                        <div className='text-right'>
                                          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                            Mogelijke relatie:
                                          </p>
                                          <div className='flex flex-wrap gap-1 mt-1'>
                                            {suggestion.relationships.map(
                                              (rel, idx) => {
                                                const isCouple = [
                                                  'spouse',
                                                  'partner',
                                                ].includes(rel.type);
                                                const colorClass = isCouple
                                                  ? 'bg-pink-100 text-pink-700'
                                                  : 'bg-blue-100 text-blue-700';
                                                return (
                                                  <span
                                                    key={idx}
                                                    className={`text-xs ${colorClass} px-2 py-1 rounded flex items-center`}
                                                  >
                                                    {rel.label}
                                                  </span>
                                                );
                                              }
                                            )}
                                          </div>
                                          <p className='text-xs text-gray-500 mt-1'>
                                            Confidence:{' '}
                                            {Math.round(
                                              suggestion.confidence * 100
                                            )}
                                            %
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Relationship Actions */}
                                    <div className='mt-3 flex flex-wrap gap-2'>
                                      {suggestion.relationships.map(
                                        (rel, idx) => (
                                          <button
                                            key={idx}
                                            type='button'
                                            onClick={() => {
                                              if (suggestion.existingFamilyId) {
                                                // Add to existing family
                                                dispatch({
                                                  type: 'ADD_TO_FAMILY',
                                                  payload: {
                                                    residentId:
                                                      'temp_new_resident',
                                                    targetFamilyId:
                                                      suggestion.existingFamilyId,
                                                    role: rel.type,
                                                  },
                                                });
                                              } else {
                                                // Create new family
                                                const newFamilyId = `fam_${Date.now()}`;
                                                dispatch({
                                                  type: 'UPDATE_RESIDENT_FORM',
                                                  payload: {
                                                    familyId: newFamilyId,
                                                    familyRole: rel.type,
                                                    familyMembers: [
                                                      suggestion.resident.id,
                                                    ],
                                                    tempFamilyConnection: {
                                                      relatedResident:
                                                        suggestion.resident,
                                                      relationship: rel.type,
                                                    },
                                                  },
                                                });
                                              }
                                              // Hide suggestions after selection
                                              dispatch({
                                                type: 'SET_FAMILY_SUGGESTIONS',
                                                payload: [],
                                              });
                                            }}
                                            className='px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors'
                                          >
                                            ✓ {rel.label}
                                          </button>
                                        )
                                      )}
                                      <button
                                        type='button'
                                        onClick={() => {
                                          // Remove this suggestion
                                          const newSuggestions =
                                            state.residentForm.familySuggestions.filter(
                                              (_, i) => i !== index
                                            );
                                          dispatch({
                                            type: 'SET_FAMILY_SUGGESTIONS',
                                            payload: newSuggestions,
                                          });
                                        }}
                                        className='px-3 py-1.5 bg-gray-200 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-300 transition-colors'
                                      >
                                        ✗ Geen relatie
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            <div className='mt-3 pt-3 border-t border-blue-200'>
                              <button
                                type='button'
                                onClick={() =>
                                  dispatch({
                                    type: 'SET_FAMILY_SUGGESTIONS',
                                    payload: [],
                                  })
                                }
                                className='text-sm text-blue-600 hover:text-blue-800'
                              >
                                Alle suggesties verbergen
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Current Family Status */}
                      {state.residentForm.familyId && (
                        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                          <div className='flex items-center space-x-2 mb-2'>
                            <Users className='w-4 h-4 text-green-600' />
                            <span className='text-sm font-medium text-green-900'>
                              Onderdeel van familie #
                              {state.residentForm.familyId.slice(-3)}
                            </span>
                          </div>
                          <div className='flex items-center space-x-4'>
                            <span className='text-sm text-green-700'>
                              Rol:{' '}
                              <span className='font-medium capitalize'>
                                {state.residentForm.familyRole}
                              </span>
                            </span>
                            {state.residentForm.tempFamilyConnection && (
                              <span className='text-sm text-green-700'>
                                Relatie met:{' '}
                                <span className='font-medium'>
                                  {
                                    state.residentForm.tempFamilyConnection
                                      .relatedResident.name
                                  }
                                </span>
                              </span>
                            )}
                          </div>
                          <button
                            type='button'
                            onClick={() => {
                              dispatch({
                                type: 'UPDATE_RESIDENT_FORM',
                                payload: {
                                  familyId: null,
                                  familyRole: null,
                                  familyMembers: [],
                                  tempFamilyConnection: null,
                                },
                              });
                            }}
                            className='mt-2 text-xs text-red-600 hover:text-red-800'
                          >
                            Familie informatie verwijderen
                          </button>
                        </div>
                      )}

                      {/* Manual Family Selection */}
                      {!state.residentForm.familyId &&
                        state.residentForm.familySuggestions.length === 0 && (
                          <div className='p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-lg'>
                            <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                              Geen familie suggesties gevonden.
                            </p>
                            <p className='text-xs text-gray-500'>
                              Familie relaties worden automatisch voorgesteld op
                              basis van naam, nationaliteit en leeftijd.
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Documents - Only for humans */}
                    {state.residentForm.type === 'human' && (
                      <div>
                        <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 dark:text-gray-100 mb-4'>
                          Documenten Status
                        </h3>
                        <div className='space-y-2'>
                          <label
                            htmlFor='has-passport'
                            className='flex items-center space-x-3'
                          >
                            <input
                              id='has-passport'
                              type='checkbox'
                              checked={
                                state.residentForm.documents?.hasPassport ||
                                false
                              }
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: {
                                    documents: {
                                      ...state.residentForm.documents,
                                      hasPassport: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className='w-4 h-4 text-blue-600 rounded'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              Paspoort aanwezig
                            </span>
                          </label>
                          <label
                            htmlFor='has-residence-permit'
                            className='flex items-center space-x-3'
                          >
                            <input
                              id='has-residence-permit'
                              type='checkbox'
                              checked={
                                state.residentForm.documents
                                  ?.hasResidencePermit || false
                              }
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: {
                                    documents: {
                                      ...state.residentForm.documents,
                                      hasResidencePermit: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className='w-4 h-4 text-blue-600 rounded'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              Verblijfsvergunning aanwezig
                            </span>
                          </label>
                          <label
                            htmlFor='has-registration'
                            className='flex items-center space-x-3'
                          >
                            <input
                              id='has-registration'
                              type='checkbox'
                              checked={
                                state.residentForm.documents?.hasRegistration ||
                                false
                              }
                              onChange={(e) =>
                                dispatch({
                                  type: 'UPDATE_RESIDENT_FORM',
                                  payload: {
                                    documents: {
                                      ...state.residentForm.documents,
                                      hasRegistration: e.target.checked,
                                    },
                                  },
                                })
                              }
                              className='w-4 h-4 text-blue-600 rounded'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>
                              GBA registratie voltooid
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label
                        htmlFor='notes'
                        className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                      >
                        Notities
                      </label>
                      <textarea
                        id='notes'
                        value={state.residentForm.notes || ''}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_RESIDENT_FORM',
                            payload: { notes: e.target.value },
                          })
                        }
                        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                        rows='3'
                        placeholder='Bijzondere aandachtspunten, medische info, etc.'
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className='flex justify-end space-x-3 mt-6 pt-6 border-t'>
                    <button
                      type='button'
                      onClick={() => {
                        closeModal('addResident');
                        dispatch({ type: 'RESET_RESIDENT_FORM' });
                        dispatch({
                          type: 'SET_SELECTED_RESIDENT',
                          payload: null,
                        });
                      }}
                      className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 rounded-lg transition-colors'
                    >
                      Annuleren
                    </button>
                    <button
                      type='submit'
                      className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                    >
                      {state.selectedResident ? 'Opslaan' : 'Toevoegen'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Resident Modal */}
      {state.modals.archiveResident && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Huisdier Archiveren</h3>

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='archive-reason'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                >
                  Reden voor archivering *
                </label>
                <select
                  id='archive-reason'
                  value={state.residentForm.archiveReason}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_RESIDENT_FORM',
                      payload: { archiveReason: e.target.value },
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value=''>Selecteer een reden</option>
                  <option value='overleden'>Overleden</option>
                  <option value='verhuisd'>Verhuisd</option>
                  <option value='overgedragen'>Overgedragen</option>
                  <option value='vermist'>Vermist</option>
                  <option value='medisch'>Medische redenen</option>
                  <option value='andere'>Andere</option>
                </select>
              </div>

              {state.residentForm.archiveReason === 'andere' && (
                <div>
                  <label
                    htmlFor='archive-explanation'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
                  >
                    Uitleg *
                  </label>
                  <textarea
                    id='archive-explanation'
                    value={state.residentForm.archiveCustomText}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_RESIDENT_FORM',
                        payload: { archiveCustomText: e.target.value },
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    rows='3'
                    placeholder="Geef een uitleg voor 'andere' reden..."
                    required
                  />
                </div>
              )}

              {state.selectedResident && (
                <div className='bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3'>
                  <div className='flex items-center'>
                    <AlertTriangle className='w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2' />
                    <div className='text-sm'>
                      <p className='font-medium text-yellow-800 dark:text-yellow-200'>
                        Archivering van {state.selectedResident.name}
                      </p>
                      <p className='text-yellow-700 dark:text-yellow-300'>
                        {(() => {
                          const familyMembers = state.residents.filter(
                            (r) =>
                              r.familyId === state.selectedResident.familyId &&
                              r.familyMembers?.includes(
                                state.selectedResident.id
                              )
                          );
                          const isLastPet =
                            familyMembers.length > 0 &&
                            !state.residents.some(
                              (r) =>
                                r.type !== 'human' &&
                                r.id !== state.selectedResident.id &&
                                !r.isArchived &&
                                familyMembers.some((fm) =>
                                  fm.familyMembers?.includes(r.id)
                                )
                            );

                          return isLastPet
                            ? 'Dit is het laatste huisdier. Eigenaar labels worden automatisch verwijderd.'
                            : 'Deze actie kan niet ongedaan gemaakt worden.';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <button
                onClick={() => {
                  closeModal('archiveResident');
                  dispatch({
                    type: 'UPDATE_RESIDENT_FORM',
                    payload: { archiveReason: '', archiveCustomText: '' },
                  });
                }}
                className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  const isValid =
                    state.residentForm.archiveReason &&
                    (state.residentForm.archiveReason !== 'andere' ||
                      state.residentForm.archiveCustomText.trim());

                  if (isValid && state.selectedResident) {
                    // Log audit entry and trigger notification
                    const auditEntry = auditHelpers.logResidentArchived(
                      user,
                      state.selectedResident,
                      state.residentForm.archiveReason,
                      state.residentForm.archiveCustomText
                    );
                    processAuditEntry(auditEntry);

                    // Dispatch the archive action
                    dispatch({
                      type: 'ARCHIVE_RESIDENT',
                      payload: {
                        residentId: state.selectedResident.id,
                        reason: state.residentForm.archiveReason,
                        customText: state.residentForm.archiveCustomText,
                      },
                    });
                    closeModal('archiveResident');
                    dispatch({ type: 'SET_SELECTED_RESIDENT', payload: null });
                    dispatch({
                      type: 'UPDATE_RESIDENT_FORM',
                      payload: { archiveReason: '', archiveCustomText: '' },
                    });
                  }
                }}
                disabled={
                  !state.residentForm.archiveReason ||
                  (state.residentForm.archiveReason === 'andere' &&
                    !state.residentForm.archiveCustomText.trim())
                }
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Archiveren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Setup Wizard */}
      {state.modals.familyWizard && (
        <FamilySetupWizard
          isOpen={state.modals.familyWizard}
          onClose={() => closeModal('familyWizard')}
          onSave={(familyMembers, _familyId) => {
            // Add all family members to the residents list
            familyMembers.forEach((member) => {
              dispatch({ type: 'ADD_RESIDENT', payload: member });
            });

            // Log audit entry for family creation
            const auditEntry = auditHelpers.logFamilyCreated(
              user,
              familyMembers,
              _familyId
            );
            processAuditEntry(auditEntry);

            closeModal('familyWizard');
          }}
          locationType='CNO'
          caseworkers={[
            'Sarah Johnson',
            'Maria Rodriguez',
            'John Smith',
            'Lisa Williams',
            'Tom Anderson',
            'Emma Thompson',
          ]}
          existingResidents={state.residents}
        />
      )}

      {/* Labels Manager */}
      {state.modals.labelsManager && (
        <LabelsManager
          isOpen={state.modals.labelsManager}
          onClose={() => closeModal('labelsManager')}
          residents={state.residents}
          onLabelsUpdate={(updatedLabels) => {
            // Handle labels update if needed
            // eslint-disable-next-line no-console
            console.log('Labels updated:', updatedLabels);
          }}
        />
      )}
    </div>
  );
};

/*
// ALLE BESTAANDE CODE UITGECOMMENTARIEERD - WORDT STAP VOOR STAP OPGEBOUWD
//
// Stappenplan:
// 1. ✓ Basic component structure
// 2. ✓ Core state management
// 3. ✓ Navigation/sidebar
// 4. ✓ Label system
// 5. ✓ Residents with labels
// 6. ✓ Filtering by labels and search
// 7. [ ] Add/Edit resident functionality
// 8. [ ] Leave requests module
// 9. [ ] Other features
//
// Originele code is hier bewaard voor referentie...
//
// export default VMS;
//
// END OF ARCHIVED CODE - DO NOT USE
*/
