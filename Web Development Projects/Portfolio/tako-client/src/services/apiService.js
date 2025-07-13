// API Service Layer - Replaces localStorage with REST API calls
// Maintains backward compatibility with existing dataService interface

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle no-content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`API Request failed: ${url}`, error);

      // Fallback to localStorage if API is unavailable
      if (error.name === 'TypeError' && endpoint.startsWith('/')) {
        // eslint-disable-next-line no-console
        console.warn('API unavailable, falling back to localStorage');
        return this.fallbackToLocalStorage(endpoint, options);
      }

      throw error;
    }
  }

  fallbackToLocalStorage(endpoint, options) {
    // Extract entity type from endpoint
    const entity = endpoint.split('/')[1].replace('-', '_');
    const storageKey = `vms_${entity}`;

    try {
      if (options.method === 'GET' || !options.method) {
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : [];
      }

      if (options.method === 'POST') {
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newItem = {
          id: `${entity}_${Date.now()}`,
          ...JSON.parse(options.body),
          createdAt: new Date().toISOString(),
        };
        existing.push(newItem);
        localStorage.setItem(storageKey, JSON.stringify(existing));
        return newItem;
      }

      throw new Error('Fallback operation not supported');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fallback to localStorage failed:', error);
      return [];
    }
  }

  // Cache management
  getCacheKey(endpoint) {
    return endpoint;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Generic CRUD operations
  async getAll(entity) {
    const cacheKey = this.getCacheKey(`/${entity}`);
    const cached = this.getCache(cacheKey);

    if (cached) {
      return cached;
    }

    const data = await this.request(`/${entity}`);
    this.setCache(cacheKey, data);
    return data;
  }

  async getById(entity, id) {
    const data = await this.getAll(entity);
    return data.find((item) => item.id === id) || null;
  }

  async create(entity, data) {
    const result = await this.request(`/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.clearCache(entity);
    return result;
  }

  async update(entity, id, data) {
    const result = await this.request(`/${entity}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    this.clearCache(entity);
    return result;
  }

  async delete(entity, id) {
    await this.request(`/${entity}/${id}`, {
      method: 'DELETE',
    });

    this.clearCache(entity);
    return true;
  }

  // Specific entity methods for backward compatibility

  // Residents
  async getResidents() {
    return this.getAll('residents');
  }

  async createResident(resident) {
    return this.create('residents', resident);
  }

  async updateResident(id, resident) {
    return this.update('residents', id, resident);
  }

  async deleteResident(id) {
    return this.delete('residents', id);
  }

  // Leave Requests
  async getLeaveRequests() {
    return this.getAll('leave-requests');
  }

  async createLeaveRequest(request) {
    return this.create('leave-requests', request);
  }

  async updateLeaveRequest(id, request) {
    return this.update('leave-requests', id, request);
  }

  // Incidents
  async getIncidents() {
    return this.getAll('incidents');
  }

  async createIncident(incident) {
    return this.create('incidents', incident);
  }

  async updateIncident(id, incident) {
    return this.update('incidents', id, incident);
  }

  // Labels
  async getLabels() {
    return this.getAll('labels');
  }

  async createLabel(label) {
    return this.create('labels', label);
  }

  async updateLabel(id, label) {
    return this.update('labels', id, label);
  }

  async deleteLabel(id) {
    return this.delete('labels', id);
  }

  // Documents
  async getDocuments() {
    return this.getAll('documents');
  }

  async createDocument(document) {
    return this.create('documents', document);
  }

  async updateDocument(id, document) {
    return this.update('documents', id, document);
  }

  async deleteDocument(id) {
    return this.delete('documents', id);
  }

  // Shifts
  async getShifts() {
    return this.getAll('shifts');
  }

  async createShift(shift) {
    return this.create('shifts', shift);
  }

  async updateShift(id, shift) {
    return this.update('shifts', id, shift);
  }

  // Users
  async getUsers() {
    return this.getAll('users');
  }

  async createUser(user) {
    return this.create('users', user);
  }

  async updateUser(id, user) {
    return this.update('users', id, user);
  }

  // Audit Logs
  async getAuditLogs() {
    return this.getAll('audit-logs');
  }

  async createAuditLog(log) {
    return this.create('audit-logs', log);
  }

  // Health check
  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Data migration helper
  async migrateFromLocalStorage() {
    const migrations = [];

    const entities = [
      'residents',
      'leave-requests',
      'incidents',
      'labels',
      'documents',
      'shifts',
      'users',
      'audit-logs',
    ];

    for (const entity of entities) {
      try {
        const storageKey = `vms_${entity.replace('-', '_')}`;
        const localData = localStorage.getItem(storageKey);

        if (localData) {
          const data = JSON.parse(localData);
          if (Array.isArray(data) && data.length > 0) {
            // eslint-disable-next-line no-console
            console.log(`Migrating ${data.length} ${entity} records...`);

            for (const item of data) {
              try {
                await this.create(entity, item);
                migrations.push({ entity, id: item.id, status: 'success' });
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Failed to migrate ${entity} ${item.id}:`, error);
                migrations.push({
                  entity,
                  id: item.id,
                  status: 'failed',
                  error: error.message,
                });
              }
            }
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Migration failed for ${entity}:`, error);
        migrations.push({ entity, status: 'failed', error: error.message });
      }
    }

    return migrations;
  }
}

// Create singleton instance
const apiService = new APIService();

// Export both the instance and class for flexibility
export default apiService;
export { APIService };
