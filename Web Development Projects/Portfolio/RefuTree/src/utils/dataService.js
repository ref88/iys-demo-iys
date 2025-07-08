// Centralized Data Service for VMS
// Handles all localStorage operations consistently

const STORAGE_KEYS = {
  RESIDENTS: 'vms_residents',
  LEAVE_REQUESTS: 'vms_leave_requests',
  DOCUMENTS: 'vms_documents',
  NOTIFICATIONS: 'vms_notifications',
  SHIFTS: 'vms_shifts',
  INCIDENTS: 'vms_incidents',
  LABELS: 'vms_labels',
  AUDIT_LOGS: 'vms_audit_logs',
  USER: 'vms_user'
};

class DataService {
  // Generic CRUD operations
  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  static set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  // Residents operations
  static getResidents() {
    return this.get(STORAGE_KEYS.RESIDENTS) || [];
  }

  static setResidents(residents) {
    return this.set(STORAGE_KEYS.RESIDENTS, residents);
  }

  static addResident(resident) {
    const residents = this.getResidents();
    const newResident = {
      ...resident,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    residents.push(newResident);
    this.setResidents(residents);
    return newResident;
  }

  static updateResident(updatedResident) {
    const residents = this.getResidents();
    const index = residents.findIndex(r => r.id === updatedResident.id);
    if (index !== -1) {
      residents[index] = {
        ...residents[index],
        ...updatedResident,
        updatedAt: new Date().toISOString()
      };
      this.setResidents(residents);
      return residents[index];
    }
    return null;
  }

  static deleteResident(residentId) {
    const residents = this.getResidents();
    const filteredResidents = residents.filter(r => r.id !== residentId);
    this.setResidents(filteredResidents);
    return true;
  }

  // Leave requests operations
  static getLeaveRequests() {
    return this.get(STORAGE_KEYS.LEAVE_REQUESTS) || [];
  }

  static setLeaveRequests(requests) {
    return this.set(STORAGE_KEYS.LEAVE_REQUESTS, requests);
  }

  static addLeaveRequest(request) {
    const requests = this.getLeaveRequests();
    const newRequest = {
      ...request,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    this.setLeaveRequests(requests);
    return newRequest;
  }

  static updateLeaveRequest(updatedRequest) {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex(r => r.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updatedRequest,
        updatedAt: new Date().toISOString()
      };
      this.setLeaveRequests(requests);
      return requests[index];
    }
    return null;
  }

  // Documents operations
  static getDocuments() {
    return this.get(STORAGE_KEYS.DOCUMENTS) || [];
  }

  static setDocuments(documents) {
    return this.set(STORAGE_KEYS.DOCUMENTS, documents);
  }

  static addDocument(document) {
    const documents = this.getDocuments();
    const newDocument = {
      ...document,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    documents.push(newDocument);
    this.setDocuments(documents);
    return newDocument;
  }

  // Shifts operations
  static getShifts() {
    return this.get(STORAGE_KEYS.SHIFTS) || [];
  }

  static setShifts(shifts) {
    return this.set(STORAGE_KEYS.SHIFTS, shifts);
  }

  static addShift(shift) {
    const shifts = this.getShifts();
    const newShift = {
      ...shift,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    shifts.push(newShift);
    this.setShifts(shifts);
    return newShift;
  }

  static updateShift(updatedShift) {
    const shifts = this.getShifts();
    const index = shifts.findIndex(s => s.id === updatedShift.id);
    if (index !== -1) {
      shifts[index] = {
        ...shifts[index],
        ...updatedShift,
        updatedAt: new Date().toISOString()
      };
      this.setShifts(shifts);
      return shifts[index];
    }
    return null;
  }

  // Incidents operations
  static getIncidents() {
    return this.get(STORAGE_KEYS.INCIDENTS) || [];
  }

  static setIncidents(incidents) {
    return this.set(STORAGE_KEYS.INCIDENTS, incidents);
  }

  static addIncident(incident) {
    const incidents = this.getIncidents();
    const newIncident = {
      ...incident,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    incidents.push(newIncident);
    this.setIncidents(incidents);
    return newIncident;
  }

  // Labels operations
  static getLabels() {
    return this.get(STORAGE_KEYS.LABELS) || [];
  }

  static setLabels(labels) {
    return this.set(STORAGE_KEYS.LABELS, labels);
  }

  static addLabel(label) {
    const labels = this.getLabels();
    const newLabel = {
      ...label,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    labels.push(newLabel);
    this.setLabels(labels);
    return newLabel;
  }

  // Audit logs operations
  static getAuditLogs() {
    return this.get(STORAGE_KEYS.AUDIT_LOGS) || [];
  }

  static addAuditLog(log) {
    const logs = this.getAuditLogs();
    const newLog = {
      ...log,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Add to beginning
    // Keep only last 10000 logs
    const trimmedLogs = logs.slice(0, 10000);
    this.set(STORAGE_KEYS.AUDIT_LOGS, trimmedLogs);
    return newLog;
  }

  // Export/Import operations
  static exportAllData() {
    const data = {
      residents: this.getResidents(),
      leaveRequests: this.getLeaveRequests(),
      documents: this.getDocuments(),
      shifts: this.getShifts(),
      incidents: this.getIncidents(),
      labels: this.getLabels(),
      auditLogs: this.getAuditLogs(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    return data;
  }

  static importData(data) {
    try {
      if (data.residents) this.setResidents(data.residents);
      if (data.leaveRequests) this.setLeaveRequests(data.leaveRequests);
      if (data.documents) this.setDocuments(data.documents);
      if (data.shifts) this.setShifts(data.shifts);
      if (data.incidents) this.setIncidents(data.incidents);
      if (data.labels) this.setLabels(data.labels);
      if (data.auditLogs) this.set(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data (for testing/reset)
  static clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.USER) { // Don't clear user session
        this.remove(key);
      }
    });
  }

  // Get data statistics
  static getDataStats() {
    return {
      residents: this.getResidents().length,
      leaveRequests: this.getLeaveRequests().length,
      documents: this.getDocuments().length,
      shifts: this.getShifts().length,
      incidents: this.getIncidents().length,
      labels: this.getLabels().length,
      auditLogs: this.getAuditLogs().length
    };
  }
}

export default DataService;
export { STORAGE_KEYS }; 