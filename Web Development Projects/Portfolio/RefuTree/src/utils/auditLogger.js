// Audit Logger Utility
export const logAuditAction = (actionData) => {
  const {
    user,
    actionType,
    entity,
    details,
    oldValue = null,
    newValue = null,
    reason = null
  } = actionData;

  if (!user) {
    console.warn('Audit log: Geen gebruiker opgegeven');
    return;
  }

  const auditLog = {
    id: Date.now() + Math.random(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    actionType,
    entity,
    details,
    oldValue,
    newValue,
    reason,
    ipAddress: getClientIP(), // Placeholder for IP detection
    sessionId: getSessionId()
  };

  // Save to localStorage
  const existingLogs = JSON.parse(localStorage.getItem('vms_audit_logs') || '[]');
  const updatedLogs = [auditLog, ...existingLogs].slice(0, 10000); // Keep last 10k logs
  localStorage.setItem('vms_audit_logs', JSON.stringify(updatedLogs));

  // Console log for development
  console.log('🔍 Audit Log:', auditLog);

  return auditLog;
};

// Get client IP (placeholder - would need backend implementation)
const getClientIP = () => {
  // In a real implementation, this would come from the server
  return '127.0.0.1'; // Placeholder
};

// Get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('vms_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('vms_session_id', sessionId);
  }
  return sessionId;
};

// Predefined audit actions
export const AUDIT_ACTIONS = {
  // Resident actions
  RESIDENT_CREATE: 'CREATE',
  RESIDENT_UPDATE: 'UPDATE',
  RESIDENT_DELETE: 'DELETE',
  RESIDENT_VIEW: 'VIEW',
  
  // Incident actions
  INCIDENT_CREATE: 'INCIDENT',
  INCIDENT_UPDATE: 'UPDATE',
  INCIDENT_DELETE: 'DELETE',
  
  // Warning actions
  WARNING_ADD: 'WARNING',
  WARNING_ESCALATE: 'ESCALATE',
  WARNING_REMOVE: 'REMOVE',
  
  // Label actions
  LABEL_CREATE: 'CREATE',
  LABEL_UPDATE: 'UPDATE',
  LABEL_DELETE: 'DELETE',
  LABEL_ASSIGN: 'ASSIGN',
  
  // User actions
  USER_LOGIN: 'LOGIN',
  USER_LOGOUT: 'LOGOUT',
  USER_SWITCH: 'SWITCH',
  
  // System actions
  SYSTEM_BACKUP: 'BACKUP',
  SYSTEM_EXPORT: 'EXPORT',
  SYSTEM_IMPORT: 'IMPORT'
};

// Helper functions for common audit scenarios
export const auditHelpers = {
  // Resident audit helpers
  logResidentCreated: (user, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_CREATE,
      entity: 'Resident',
      details: `Nieuwe bewoner toegevoegd: ${resident.name}`,
      newValue: resident
    });
  },

  logResidentUpdated: (user, resident, changes) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_UPDATE,
      entity: 'Resident',
      details: `Bewoner bijgewerkt: ${resident.name}`,
      oldValue: changes.old,
      newValue: changes.new
    });
  },

  logResidentDeleted: (user, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_DELETE,
      entity: 'Resident',
      details: `Bewoner verwijderd: ${resident.name}`,
      oldValue: resident
    });
  },

  // Incident audit helpers
  logIncidentCreated: (user, incident, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.INCIDENT_CREATE,
      entity: 'Incident',
      details: `Incident geregistreerd voor ${resident.name}: ${incident.description}`,
      newValue: incident
    });
  },

  logWarningAdded: (user, warning, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.WARNING_ADD,
      entity: 'Warning',
      details: `Waarschuwing toegevoegd aan ${resident.name}: ${warning.type}`,
      newValue: warning
    });
  },

  logWarningEscalated: (user, warning, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.WARNING_ESCALATE,
      entity: 'Warning',
      details: `Waarschuwing geëscaleerd voor ${resident.name}: ${warning.type}`,
      oldValue: warning.previous,
      newValue: warning.current
    });
  },

  // User session helpers
  logUserSwitched: (user) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.USER_SWITCH,
      entity: 'Session',
      details: `Gebruiker gewisseld naar: ${user.name} (${user.role})`
    });
  },

  // Label helpers
  logLabelAssigned: (user, label, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.LABEL_ASSIGN,
      entity: 'Label',
      details: `Label "${label.name}" toegewezen aan ${resident.name}`,
      newValue: label
    });
  }
};

export default logAuditAction; 