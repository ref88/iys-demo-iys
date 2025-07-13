// Core domain types
import React from 'react';

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed or legacy field
  birthDate?: string;
  gender?: 'M' | 'V' | '';
  nationality?: string;
  roomNumber?: string;
  labels: string[];
  registrationDate: string;
  phone?: string;
  email?: string;
  emergencyContact: EmergencyContact;
  bsn?: string;
  intakeDate?: string;
  notes?: string;
  type: 'human' | 'cat' | 'dog';
  archived: boolean;
  archivedDate?: string;

  // Animal-specific fields
  breed?: string;
  weight?: string;
  isVaccinated?: boolean;
  vaccinationDate?: string;
  nextVaccinationDate?: string;
  isChipped?: boolean;
  chipNumber?: string;
  isSterilized?: boolean;
  sterilizationDate?: string;

  // Family fields
  familyId?: string;
  familyRole?: 'parent' | 'child' | 'guardian';
  familyMembers?: FamilyMember[];
  guardianInfo?: GuardianInfo;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  lastSeen?: string;
  attendance?: string;
  leaveBalance?: number;
  labelHistory?: LabelHistoryEntry[];
  documents?: Document[];
}

export interface EmergencyContact {
  firstName: string;
  lastName: string;
  gender: 'M' | 'V' | '';
  relationship: string;
  phone: string;
}

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  birthDate?: string;
  gender?: 'M' | 'V' | '';
}

export interface GuardianInfo {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface LabelHistoryEntry {
  date: string;
  action: 'added' | 'removed';
  label: string;
  user: string;
}

// Form types
export interface ResidentForm {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'V' | '';
  nationality: string;
  roomNumber: string;
  labels: string[];
  arrivalDate: string;
  phone: string;
  email: string;
  emergencyContact: EmergencyContact;
  bsn: string;
  notes: string;
  type: 'human' | 'cat' | 'dog';
  breed: string;
  weight: string;
  isVaccinated: boolean;
  vaccinationDate: string;
  nextVaccinationDate: string;
  isChipped: boolean;
  chipNumber: string;
  isSterilized: boolean;
  sterilizationDate: string;
  familyMembers: FamilyMember[];
  familyRole: string;
  familyId: string;
  guardianInfo: GuardianInfo;
  labelHistory: LabelHistoryEntry[];
}

// State management types
export interface VMSState {
  activeView: string;
  sidebarCollapsed: boolean;
  modals: {
    addResident: boolean;
    viewResident: boolean;
    addLeaveRequest: boolean;
    addDocument: boolean;
    addLabel: boolean;
    labelsManager: boolean;
    familyWizard: boolean;
    archiveResident: boolean;
  };
  selectedResident: Resident | null;
  selectedDocument: Document | null;
  residentForm: ResidentForm;
  searchTerm: string;
  selectedLabels: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  leaveRequests: LeaveRequest[];
  documents: Document[];
  auditLog: AuditLogEntry[];
}

// Other domain types
export interface LeaveRequest {
  id: string;
  residentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export interface Document {
  id: string;
  residentId: string;
  name: string;
  type: string;
  url?: string;
  uploadDate: string;
  uploadedBy: string;
  size?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  residentId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  automatic?: boolean;
  category?: string;
}

// Analytics types
export interface AnalyticsData {
  overview: {
    totalResidents: number;
    families: number;
    children: number;
    individuals: number;
    recentRegistrations: number;
    averageAge: number;
    emergencyContacts: number;
    documentsCount: number;
  };
  distributions: {
    gender: Record<string, number>;
    nationality: Record<string, number>;
    type: Record<string, number>;
    ageGroups: Record<string, number>;
    labels: Record<string, number>;
  };
  capacity: {
    totalCapacity: number;
    currentOccupancy: number;
    occupancyRate: number;
    availableSpaces: number;
  };
  roomOccupancy: Record<string, number>;
  registrationTrends: Record<string, number>;
  trends: {
    monthlyRegistrations: Record<string, number>;
    occupancyTrend: number[];
  };
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Hook return types
export interface UseResidentsReturn {
  residents: Resident[];
  addResident: (residentData: Partial<Resident>) => void;
  updateResident: (residentData: Resident) => void;
  deleteResident: (residentId: string) => void;
  archiveResident: (residentId: string) => void;
  updateLabels: () => void;
  getActiveResidents: () => Resident[];
  getArchivedResidents: () => Resident[];
  getResidentById: (id: string) => Resident | undefined;
  getResidentsByType: (type: Resident['type']) => Resident[];
  getResidentsByLabel: (label: string) => Resident[];
}

export interface UseVMSStateReturn {
  state: VMSState;
  setView: (view: string) => void;
  toggleSidebar: () => void;
  openModal: (modal: keyof VMSState['modals']) => void;
  closeModal: (modal: keyof VMSState['modals']) => void;
  setSelectedResident: (resident: Resident | null) => void;
  updateResidentForm: (formData: Partial<ResidentForm>) => void;
  resetResidentForm: () => void;
  setSearchTerm: (term: string) => void;
  setSelectedLabels: (labels: string[]) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  addLeaveRequest: (request: LeaveRequest) => void;
  updateLeaveRequest: (request: LeaveRequest) => void;
  deleteLeaveRequest: (requestId: string) => void;
  addDocument: (document: Document) => void;
  deleteDocument: (documentId: string) => void;
  addAuditLog: (logEntry: AuditLogEntry) => void;
}

// Event handler types
export type ResidentEventHandler = (resident: Resident) => void;
export type FormSubmitHandler<T = unknown> = (data: T) => Promise<ApiResponse>;
export type ValidationHandler = (data: unknown) => ValidationResult;

// Context value types
export interface DarkModeContextValue {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export interface NotificationContextValue {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: string;
  }>;
  notify: (
    message: string,
    options?: { type?: 'success' | 'error' | 'info' | 'warning' }
  ) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export interface LanguageContextValue {
  language: 'nl' | 'en' | 'ar';
  setLanguage: (lang: 'nl' | 'en' | 'ar') => void;
  t: (key: string, ...args: any[]) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface LocationContextValue {
  currentLocation: string;
}
