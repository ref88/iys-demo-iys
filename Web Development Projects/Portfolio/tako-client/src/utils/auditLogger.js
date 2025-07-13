// Audit Logger Utility
export const logAuditAction = (actionData) => {
  const {
    user,
    actionType,
    entity,
    details,
    oldValue = null,
    newValue = null,
    reason = null,
  } = actionData;

  if (!user) {
    // eslint-disable-next-line no-console
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
    sessionId: getSessionId(),
  };

  // Save to localStorage
  const existingLogs = JSON.parse(
    localStorage.getItem('vms_audit_logs') || '[]'
  );
  const updatedLogs = [auditLog, ...existingLogs].slice(0, 10000); // Keep last 10k logs
  localStorage.setItem('vms_audit_logs', JSON.stringify(updatedLogs));

  // Console log for development
  // eslint-disable-next-line no-console
  console.log('🔍 Audit Log:', auditLog);

  return auditLog;
};

// Get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('vms_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
  RESIDENT_ARCHIVE: 'ARCHIVE',
  RESIDENT_RESTORE: 'RESTORE',

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

  // Family actions
  FAMILY_CREATE: 'FAMILY_CREATE',
  FAMILY_UPDATE: 'FAMILY_UPDATE',
  FAMILY_MERGE: 'FAMILY_MERGE',

  // Pet actions
  PET_CREATE: 'PET_CREATE',
  PET_UPDATE: 'PET_UPDATE',
  PET_DELETE: 'PET_DELETE',

  // System actions
  SYSTEM_BACKUP: 'BACKUP',
  SYSTEM_EXPORT: 'EXPORT',
  SYSTEM_IMPORT: 'IMPORT',

  // Notification actions
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
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
      newValue: resident,
    });
  },

  logResidentUpdated: (user, resident, changes) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_UPDATE,
      entity: 'Resident',
      details: `Bewoner bijgewerkt: ${resident.name}`,
      oldValue: changes.old,
      newValue: changes.new,
    });
  },

  logResidentDeleted: (user, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_DELETE,
      entity: 'Resident',
      details: `Bewoner verwijderd: ${resident.name}`,
      oldValue: resident,
    });
  },

  // Incident audit helpers
  logIncidentCreated: (user, incident, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.INCIDENT_CREATE,
      entity: 'Incident',
      details: `Incident geregistreerd voor ${resident.name}: ${incident.description}`,
      newValue: incident,
    });
  },

  logWarningAdded: (user, warning, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.WARNING_ADD,
      entity: 'Warning',
      details: `Waarschuwing toegevoegd aan ${resident.name}: ${warning.type}`,
      newValue: warning,
    });
  },

  logWarningEscalated: (user, warning, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.WARNING_ESCALATE,
      entity: 'Warning',
      details: `Waarschuwing geëscaleerd voor ${resident.name}: ${warning.type}`,
      oldValue: warning.previous,
      newValue: warning.current,
    });
  },

  // User session helpers
  logUserSwitched: (user) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.USER_SWITCH,
      entity: 'Session',
      details: `Gebruiker gewisseld naar: ${user.name} (${user.role})`,
    });
  },

  // Label helpers
  logLabelAssigned: (user, label, resident) => {
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.LABEL_ASSIGN,
      entity: 'Label',
      details: `Label "${label.name}" toegewezen aan ${resident.name}`,
      newValue: label,
    });
  },

  // Archive helpers
  logResidentArchived: (user, resident, reason, customText) => {
    // Create natural message inline for now
    const name = resident.firstName || resident.name;
    const type =
      resident.type === 'human'
        ? 'bewoner'
        : resident.type === 'cat'
          ? 'kat'
          : 'hond';

    const reasonMessages = {
      overleden: `${type} ${name} is overleden`,
      verhuisd: `${type} ${name} is verhuisd naar een nieuwe locatie`,
      overgedragen: `${type} ${name} is overgedragen aan een andere instelling`,
      vermist: `${type} ${name} is vermist`,
      medisch: `${type} ${name} is om medische redenen gearchiveerd`,
      andere: `${type} ${name} is gearchiveerd: ${customText}`,
    };

    const naturalMessage =
      reasonMessages[reason] || `${type} ${name} is gearchiveerd`;
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_ARCHIVE,
      entity: 'Resident',
      details: naturalMessage,
      reason: reason,
      oldValue: { ...resident, isArchived: false },
      newValue: {
        ...resident,
        isArchived: true,
        archiveReason: reason,
        archiveCustomText: customText,
      },
    });
  },

  logResidentRestored: (user, resident) => {
    const name = resident.firstName || resident.name;
    const type =
      resident.type === 'human'
        ? 'bewoner'
        : resident.type === 'cat'
          ? 'kat'
          : 'hond';

    const naturalMessage = `${type} ${name} is hersteld en weer actief`;
    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.RESIDENT_RESTORE,
      entity: 'Resident',
      details: naturalMessage,
      oldValue: { ...resident, isArchived: true },
      newValue: {
        ...resident,
        isArchived: false,
        archiveReason: '',
        archiveCustomText: '',
      },
    });
  },

  // Family audit helpers
  logFamilyCreated: (user, familyMembers, familyId) => {
    const memberCount = familyMembers.length;
    const memberNames = familyMembers.map((m) => m.name).join(', ');

    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.FAMILY_CREATE,
      entity: 'Family',
      details: `Familie ${familyId} aangemaakt met ${memberCount} leden`,
      newValue: { familyId, members: familyMembers, memberNames },
    });
  },

  // Pet audit helpers
  logPetCreated: (user, pet) => {
    const owners = pet.owners || [];
    const ownerNames = owners.length > 0 ? ` voor ${owners.join(', ')}` : '';

    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.PET_CREATE,
      entity: 'Pet',
      details: `${pet.type} ${pet.name} toegevoegd${ownerNames}`,
      newValue: pet,
    });
  },

  logPetUpdated: (user, pet, changes) => {
    const owners = pet.owners || [];
    const ownerNames =
      owners.length > 0 ? ` (eigenaren: ${owners.join(', ')})` : '';

    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.PET_UPDATE,
      entity: 'Pet',
      details: `${pet.type} ${pet.name} bijgewerkt${ownerNames}`,
      oldValue: changes.old,
      newValue: changes.new,
    });
  },

  logPetDeleted: (user, pet) => {
    const owners = pet.owners || [];
    const ownerNames =
      owners.length > 0 ? ` (eigenaren: ${owners.join(', ')})` : '';

    return logAuditAction({
      user,
      actionType: AUDIT_ACTIONS.PET_DELETE,
      entity: 'Pet',
      details: `${pet.type} ${pet.name} verwijderd${ownerNames}`,
      oldValue: pet,
    });
  },
};

// Natural language message generator for archive operations
export const createNaturalArchiveMessage = (resident, reason, customText) => {
  const name = resident.firstName || resident.name;
  const type =
    resident.type === 'human'
      ? 'bewoner'
      : resident.type === 'cat'
        ? 'kat'
        : 'hond';

  const reasonMessages = {
    overleden: `${type} ${name} is overleden`,
    verhuisd: `${type} ${name} is verhuisd naar een nieuwe locatie`,
    overgedragen: `${type} ${name} is overgedragen aan een andere instelling`,
    vermist: `${type} ${name} is vermist`,
    medisch: `${type} ${name} is om medische redenen gearchiveerd`,
    andere: `${type} ${name} is gearchiveerd: ${customText}`,
  };

  return reasonMessages[reason] || `${type} ${name} is gearchiveerd`;
};

export const createNaturalRestoreMessage = (resident) => {
  const name = resident.firstName || resident.name;
  const type =
    resident.type === 'human'
      ? 'bewoner'
      : resident.type === 'cat'
        ? 'kat'
        : 'hond';

  return `${type} ${name} is hersteld en weer actief`;
};

export default logAuditAction;
