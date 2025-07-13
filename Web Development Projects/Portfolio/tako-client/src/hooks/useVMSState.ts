import { useReducer, useCallback } from 'react';
import {
  VMSState,
  ResidentForm,
  Resident,
  LeaveRequest,
  Document,
  AuditLogEntry,
  UseVMSStateReturn,
} from '../types';

const initialVMSState: VMSState = {
  activeView: 'dashboard',
  sidebarCollapsed: false,

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
    gender: '' as 'M' | 'V' | '',
    nationality: '',
    roomNumber: '',
    labels: [],
    arrivalDate: new Date().toISOString().split('T')[0] || '',
    phone: '',
    email: '',
    emergencyContact: {
      firstName: '',
      lastName: '',
      gender: '' as 'M' | 'V' | '',
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
  sortBy: 'firstName',
  sortOrder: 'asc',
  viewMode: 'grid',

  leaveRequests: [],
  documents: [],
  auditLog: [],
};

type VMSAction =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_MODAL'; payload: keyof VMSState['modals'] }
  | { type: 'CLOSE_MODAL'; payload: keyof VMSState['modals'] }
  | { type: 'SET_SELECTED_RESIDENT'; payload: Resident | null }
  | { type: 'SET_SELECTED_DOCUMENT'; payload: Document | null }
  | { type: 'UPDATE_RESIDENT_FORM'; payload: Partial<ResidentForm> }
  | { type: 'RESET_RESIDENT_FORM' }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SELECTED_LABELS'; payload: string[] }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'ADD_LEAVE_REQUEST'; payload: LeaveRequest }
  | { type: 'UPDATE_LEAVE_REQUEST'; payload: LeaveRequest }
  | { type: 'DELETE_LEAVE_REQUEST'; payload: string }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'ADD_AUDIT_LOG'; payload: AuditLogEntry };

const vmsReducer = (state: VMSState, action: VMSAction): VMSState => {
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

    case 'SET_SELECTED_RESIDENT':
      return { ...state, selectedResident: action.payload };

    case 'SET_SELECTED_DOCUMENT':
      return { ...state, selectedDocument: action.payload };

    case 'UPDATE_RESIDENT_FORM':
      return {
        ...state,
        residentForm: { ...state.residentForm, ...action.payload },
      };

    case 'RESET_RESIDENT_FORM':
      return { ...state, residentForm: initialVMSState.residentForm };

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

    default:
      return state;
  }
};

export const useVMSState = (): UseVMSStateReturn => {
  const [state, dispatch] = useReducer(vmsReducer, initialVMSState);

  const setView = useCallback((view: string): void => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const toggleSidebar = useCallback((): void => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const openModal = useCallback((modal: keyof VMSState['modals']): void => {
    dispatch({ type: 'OPEN_MODAL', payload: modal });
  }, []);

  const closeModal = useCallback((modal: keyof VMSState['modals']): void => {
    dispatch({ type: 'CLOSE_MODAL', payload: modal });
  }, []);

  const setSelectedResident = useCallback((resident: Resident | null): void => {
    dispatch({ type: 'SET_SELECTED_RESIDENT', payload: resident });
  }, []);

  const updateResidentForm = useCallback(
    (formData: Partial<ResidentForm>): void => {
      dispatch({ type: 'UPDATE_RESIDENT_FORM', payload: formData });
    },
    []
  );

  const resetResidentForm = useCallback((): void => {
    dispatch({ type: 'RESET_RESIDENT_FORM' });
  }, []);

  const setSearchTerm = useCallback((term: string): void => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setSelectedLabels = useCallback((labels: string[]): void => {
    dispatch({ type: 'SET_SELECTED_LABELS', payload: labels });
  }, []);

  const setSortBy = useCallback((sortBy: string): void => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc'): void => {
    dispatch({ type: 'SET_SORT_ORDER', payload: order });
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list'): void => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const addLeaveRequest = useCallback((request: LeaveRequest): void => {
    dispatch({ type: 'ADD_LEAVE_REQUEST', payload: request });
  }, []);

  const updateLeaveRequest = useCallback((request: LeaveRequest): void => {
    dispatch({ type: 'UPDATE_LEAVE_REQUEST', payload: request });
  }, []);

  const deleteLeaveRequest = useCallback((requestId: string): void => {
    dispatch({ type: 'DELETE_LEAVE_REQUEST', payload: requestId });
  }, []);

  const addDocument = useCallback((document: Document): void => {
    dispatch({ type: 'ADD_DOCUMENT', payload: document });
  }, []);

  const deleteDocument = useCallback((documentId: string): void => {
    dispatch({ type: 'DELETE_DOCUMENT', payload: documentId });
  }, []);

  const addAuditLog = useCallback((logEntry: AuditLogEntry): void => {
    dispatch({ type: 'ADD_AUDIT_LOG', payload: logEntry });
  }, []);

  return {
    state,
    setView,
    toggleSidebar,
    openModal,
    closeModal,
    setSelectedResident,
    updateResidentForm,
    resetResidentForm,
    setSearchTerm,
    setSelectedLabels,
    setSortBy,
    setSortOrder,
    setViewMode,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    addDocument,
    deleteDocument,
    addAuditLog,
  };
};
