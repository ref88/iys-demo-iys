import { updateResidentWithLabels } from '../utils/residentUtils.js';

const initialState = {
  activeView: 'dashboard',
  sidebarCollapsed: false,

  residents: [
    {
      id: 'r1',
      name: 'Ahmed Hassan',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      birthDate: '1985-03-15',
      gender: 'M',
      nationality: 'Syrisch',
      roomNumber: '101',
      labels: ['l1', 'l2'],
      registrationDate: '2024-01-15T10:00:00Z',
      phone: '+31 6 12345678',
      email: 'ahmed.hassan@example.com',
      emergencyContact: {
        firstName: 'Fatima',
        lastName: 'Hassan',
        gender: 'V',
        relationship: 'Echtgenote',
        phone: '+31 6 87654321',
      },
      bsn: '123456789',
      notes: 'Heeft hulp nodig met Nederlandse documenten',
      type: 'human',
      archived: false,
    },
  ],

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

  selectedResident: null,
  selectedDocument: null,

  residentForm: {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
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
    type: 'human',
    breed: '',
    weight: '',
    isVaccinated: false,
    vaccinationDate: '',
    nextVaccinationDate: '',
    isChipped: false,
    chipNumber: '',
    isSterilized: false,
    sterilizationDate: '',
    familyMembers: [],
    familyRole: '',
    familyId: '',
    guardianInfo: {
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
    },
    labelHistory: [],
  },

  searchTerm: '',
  selectedLabels: [],
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid',

  leaveRequests: [],
  documents: [],
  auditLog: [],
};

function vmsReducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, activeView: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

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

    case 'ADD_RESIDENT': {
      const newResident = {
        id: `r${Date.now()}`,
        ...action.payload,
        registrationDate: new Date().toISOString(),
        archived: false,
      };

      const newResidentWithLabels = updateResidentWithLabels(newResident);

      return {
        ...state,
        residents: [...state.residents, newResidentWithLabels],
        modals: { ...state.modals, addResident: false },
        residentForm: initialState.residentForm,
      };
    }

    case 'UPDATE_RESIDENT': {
      const updatedResident = updateResidentWithLabels(action.payload);

      return {
        ...state,
        residents: state.residents.map((resident) =>
          resident.id === action.payload.id ? updatedResident : resident
        ),
        selectedResident: updatedResident,
      };
    }

    case 'DELETE_RESIDENT':
      return {
        ...state,
        residents: state.residents.filter(
          (resident) => resident.id !== action.payload
        ),
        selectedResident: null,
      };

    case 'ARCHIVE_RESIDENT':
      return {
        ...state,
        residents: state.residents.map((resident) =>
          resident.id === action.payload.id
            ? {
                ...resident,
                archived: true,
                archivedDate: action.payload.archivedDate,
              }
            : resident
        ),
        modals: { ...state.modals, archiveResident: false },
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

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };

    case 'SET_SELECTED_LABELS':
      return { ...state, selectedLabels: action.payload };

    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };

    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'ADD_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: [...state.leaveRequests, action.payload],
      };

    case 'UPDATE_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: state.leaveRequests.map((req) =>
          req.id === action.payload.id ? action.payload : req
        ),
      };

    case 'DELETE_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: state.leaveRequests.filter(
          (req) => req.id !== action.payload
        ),
      };

    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [...state.documents, action.payload],
      };

    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
      };

    case 'ADD_AUDIT_LOG':
      return {
        ...state,
        auditLog: [action.payload, ...state.auditLog],
      };

    case 'UPDATE_LABELS': {
      const residentsWithUpdatedLabels = state.residents.map((resident) => {
        return updateResidentWithLabels(resident);
      });

      return {
        ...state,
        residents: residentsWithUpdatedLabels,
      };
    }

    default:
      return state;
  }
}

export { vmsReducer, initialState };
