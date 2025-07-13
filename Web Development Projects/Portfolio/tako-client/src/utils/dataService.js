// Centralized Data Service for VMS
// Handles both API and localStorage operations with automatic fallback

import apiService from '../services/apiService.js';

const STORAGE_KEYS = {
  RESIDENTS: 'vms_residents',
  LEAVE_REQUESTS: 'vms_leave_requests',
  DOCUMENTS: 'vms_documents',
  NOTIFICATIONS: 'vms_notifications',
  SHIFTS: 'vms_shifts',
  INCIDENTS: 'vms_incidents',
  LABELS: 'vms_labels',
  AUDIT_LOGS: 'vms_audit_logs',
  USER: 'vms_user',
};

// Configuration for API vs localStorage mode
const USE_API = process.env.REACT_APP_USE_API !== 'false';

class DataService {
  // ID counter for unique ID generation
  static _idCounter = Date.now();

  // Generate unique ID
  static generateId() {
    return ++this._idCounter;
  }

  // Generic CRUD operations with enhanced error handling
  static get(key) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return null;
      }

      // Try to parse JSON
      const parsed = JSON.parse(data);

      // Validate data structure if it's an array
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && typeof item === 'object');
      }

      return parsed;
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error(`Error reading from localStorage (${key}):`, _error);

      // Try to recover corrupted data
      this.handleCorruptedData(key, _error);
      return null;
    }
  }

  static set(key, data) {
    try {
      // Validate data before storing
      if (data === null || data === undefined) {
        // eslint-disable-next-line no-console
        console.warn(`Attempting to store null/undefined data for key: ${key}`);
        return false;
      }

      const jsonString = JSON.stringify(data);

      // Check if storage quota would be exceeded
      const storageSize = this.getStorageSize();
      const newDataSize = new Blob([jsonString]).size;

      if (storageSize + newDataSize > 5 * 1024 * 1024) {
        // 5MB limit

        // eslint-disable-next-line no-console
        console.warn('LocalStorage approaching quota limit');
        this.cleanupOldData();
      }

      localStorage.setItem(key, jsonString);
      return true;
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error(`Error writing to localStorage (${key}):`, _error);

      if (_error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded(key);
      }

      return false;
    }
  }

  // Storage management helpers
  static getStorageSize() {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  static handleCorruptedData(key, _error) {
    // eslint-disable-next-line no-console
    console.warn(
      `Corrupted data detected for key: ${key}. Attempting recovery...`
    );

    try {
      // Try to backup corrupted data
      const corruptedData = localStorage.getItem(key);
      if (corruptedData) {
        localStorage.setItem(`${key}_corrupted_${Date.now()}`, corruptedData);
      }

      // Remove corrupted data
      localStorage.removeItem(key);

      // Initialize with empty array/object based on key type
      if (
        key.includes('residents') ||
        key.includes('requests') ||
        key.includes('documents')
      ) {
        this.set(key, []);
      } else {
        this.set(key, {});
      }

      // eslint-disable-next-line no-console
      console.log(`Recovered from corrupted data for key: ${key}`);
    } catch (recoveryError) {
      // eslint-disable-next-line no-console
      console.error('Failed to recover from corrupted data:', recoveryError);
    }
  }

  static handleStorageQuotaExceeded(_key) {
    // eslint-disable-next-line no-console
    console.warn('Storage quota exceeded. Cleaning up old data...');

    try {
      // Remove old audit logs first
      const auditLogs = this.get(STORAGE_KEYS.AUDIT_LOGS) || [];
      if (auditLogs.length > 100) {
        const recentLogs = auditLogs.slice(-50); // Keep only last 50
        this.set(STORAGE_KEYS.AUDIT_LOGS, recentLogs);
      }

      // Remove old notifications
      const notifications = this.get(STORAGE_KEYS.NOTIFICATIONS) || [];
      if (notifications.length > 50) {
        const recentNotifications = notifications.slice(-25); // Keep only last 25
        this.set(STORAGE_KEYS.NOTIFICATIONS, recentNotifications);
      }

      // Clean up any corrupted backup data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('_corrupted_')) {
          const timestamp = parseInt(key.split('_corrupted_')[1]);
          const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (timestamp < oneWeekAgo) {
            localStorage.removeItem(key);
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log('Storage cleanup completed');
    } catch (cleanupError) {
      // eslint-disable-next-line no-console
      console.error('Error during storage cleanup:', cleanupError);
    }
  }

  static cleanupOldData() {
    // Proactive cleanup to prevent quota issues
    this.handleStorageQuotaExceeded('cleanup');
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error(`Error removing from localStorage (${key}):`, _error);
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    residents.push(newResident);
    this.setResidents(residents);
    return newResident;
  }

  static updateResident(updatedResident) {
    const residents = this.getResidents();
    const index = residents.findIndex((r) => r.id === updatedResident.id);
    if (index !== -1) {
      residents[index] = {
        ...residents[index],
        ...updatedResident,
        updatedAt: new Date().toISOString(),
      };
      this.setResidents(residents);
      return residents[index];
    }
    return null;
  }

  static deleteResident(residentId) {
    const residents = this.getResidents();
    const filteredResidents = residents.filter((r) => r.id !== residentId);
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    this.setLeaveRequests(requests);
    return newRequest;
  }

  static updateLeaveRequest(updatedRequest) {
    const requests = this.getLeaveRequests();
    const index = requests.findIndex((r) => r.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updatedRequest,
        updatedAt: new Date().toISOString(),
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    shifts.push(newShift);
    this.setShifts(shifts);
    return newShift;
  }

  static updateShift(updatedShift) {
    const shifts = this.getShifts();
    const index = shifts.findIndex((s) => s.id === updatedShift.id);
    if (index !== -1) {
      shifts[index] = {
        ...shifts[index],
        ...updatedShift,
        updatedAt: new Date().toISOString(),
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
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
      id: this.generateId(),
      createdAt: new Date().toISOString(),
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
      id: this.generateId(),
      timestamp: new Date().toISOString(),
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
      version: '1.0.0',
    };
    return data;
  }

  static importData(data) {
    try {
      if (data.residents) {
        this.setResidents(data.residents);
      }
      if (data.leaveRequests) {
        this.setLeaveRequests(data.leaveRequests);
      }
      if (data.documents) {
        this.setDocuments(data.documents);
      }
      if (data.shifts) {
        this.setShifts(data.shifts);
      }
      if (data.incidents) {
        this.setIncidents(data.incidents);
      }
      if (data.labels) {
        this.setLabels(data.labels);
      }
      if (data.auditLogs) {
        this.set(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      }
      return true;
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.error('Error importing data:', _error);
      return false;
    }
  }

  // Clear all data (for testing/reset)
  static clearAllData() {
    Object.values(STORAGE_KEYS).forEach((_key) => {
      if (_key !== STORAGE_KEYS.USER) {
        // Don't clear user session
        this.remove(_key);
      }
    });
  }

  // Get data statistics
  static async getDataStats() {
    if (USE_API) {
      try {
        const [
          residents,
          leaveRequests,
          documents,
          shifts,
          incidents,
          labels,
          auditLogs,
        ] = await Promise.all([
          apiService.getResidents(),
          apiService.getLeaveRequests(),
          apiService.getDocuments(),
          apiService.getShifts(),
          apiService.getIncidents(),
          apiService.getLabels(),
          apiService.getAuditLogs(),
        ]);

        return {
          residents: residents.length,
          leaveRequests: leaveRequests.length,
          documents: documents.length,
          shifts: shifts.length,
          incidents: incidents.length,
          labels: labels.length,
          auditLogs: auditLogs.length,
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to get API stats, falling back to localStorage');
      }
    }

    return {
      residents: this.getResidents().length,
      leaveRequests: this.getLeaveRequests().length,
      documents: this.getDocuments().length,
      shifts: this.getShifts().length,
      incidents: this.getIncidents().length,
      labels: this.getLabels().length,
      auditLogs: this.getAuditLogs().length,
    };
  }

  // API-aware methods that maintain backward compatibility

  // Residents API methods
  static async getResidentsAsync() {
    if (USE_API) {
      try {
        return await apiService.getResidents();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.getResidents();
  }

  static async addResidentAsync(resident) {
    if (USE_API) {
      try {
        return await apiService.createResident(resident);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.addResident(resident);
  }

  static async updateResidentAsync(updatedResident) {
    if (USE_API) {
      try {
        return await apiService.updateResident(
          updatedResident.id,
          updatedResident
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.updateResident(updatedResident);
  }

  static async deleteResidentAsync(id) {
    if (USE_API) {
      try {
        await apiService.deleteResident(id);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.deleteResident(id);
  }

  // Leave Requests API methods
  static async getLeaveRequestsAsync() {
    if (USE_API) {
      try {
        return await apiService.getLeaveRequests();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.getLeaveRequests();
  }

  static async addLeaveRequestAsync(request) {
    if (USE_API) {
      try {
        return await apiService.createLeaveRequest(request);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.addLeaveRequest(request);
  }

  static async updateLeaveRequestAsync(updatedRequest) {
    if (USE_API) {
      try {
        return await apiService.updateLeaveRequest(
          updatedRequest.id,
          updatedRequest
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.updateLeaveRequest(updatedRequest);
  }

  // Incidents API methods
  static async getIncidentsAsync() {
    if (USE_API) {
      try {
        return await apiService.getIncidents();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.getIncidents();
  }

  static async addIncidentAsync(incident) {
    if (USE_API) {
      try {
        return await apiService.createIncident(incident);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.addIncident(incident);
  }

  static async updateIncidentAsync(updatedIncident) {
    if (USE_API) {
      try {
        return await apiService.updateIncident(
          updatedIncident.id,
          updatedIncident
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.updateIncident(updatedIncident);
  }

  // Labels API methods
  static async getLabelsAsync() {
    if (USE_API) {
      try {
        return await apiService.getLabels();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.getLabels();
  }

  static async addLabelAsync(label) {
    if (USE_API) {
      try {
        return await apiService.createLabel(label);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.addLabel(label);
  }

  static async updateLabelAsync(updatedLabel) {
    if (USE_API) {
      try {
        return await apiService.updateLabel(updatedLabel.id, updatedLabel);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.updateLabel(updatedLabel);
  }

  static async deleteLabelAsync(id) {
    if (USE_API) {
      try {
        await apiService.deleteLabel(id);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.deleteLabel(id);
  }

  // Documents API methods
  static async getDocumentsAsync() {
    if (USE_API) {
      try {
        return await apiService.getDocuments();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.getDocuments();
  }

  static async addDocumentAsync(document) {
    if (USE_API) {
      try {
        return await apiService.createDocument(document);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.addDocument(document);
  }

  static async updateDocumentAsync(updatedDocument) {
    if (USE_API) {
      try {
        return await apiService.updateDocument(
          updatedDocument.id,
          updatedDocument
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.updateDocument(updatedDocument);
  }

  static async deleteDocumentAsync(id) {
    if (USE_API) {
      try {
        await apiService.deleteDocument(id);
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, using localStorage fallback');
      }
    }
    return this.deleteDocument(id);
  }

  // Migration helper
  static async migrateToAPI() {
    if (!USE_API) {
      // eslint-disable-next-line no-console
      console.warn('API mode is disabled');
      return { success: false, message: 'API mode disabled' };
    }

    try {
      const result = await apiService.migrateFromLocalStorage();
      // eslint-disable-next-line no-console
      console.log('Migration completed:', result);
      return { success: true, result };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Health check
  static async checkAPIHealth() {
    if (!USE_API) {
      return { status: 'disabled', message: 'API mode is disabled' };
    }

    try {
      return await apiService.healthCheck();
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

export default DataService;
export { STORAGE_KEYS };
