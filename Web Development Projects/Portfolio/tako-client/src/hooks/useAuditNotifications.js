import { useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext.jsx';
// import { AUDIT_ACTIONS } from '../utils/auditLogger.js';

// Default notification settings - use actual action values, not the constant names
const DEFAULT_SETTINGS = {
  CREATE: { enabled: true, persistent: false }, // RESIDENT_CREATE
  UPDATE: { enabled: true, persistent: false }, // RESIDENT_UPDATE
  ARCHIVE: { enabled: true, persistent: true }, // RESIDENT_ARCHIVE
  RESTORE: { enabled: true, persistent: false }, // RESIDENT_RESTORE
  ASSIGN: { enabled: true, persistent: false }, // LABEL_ASSIGN
  INCIDENT: { enabled: true, persistent: true }, // INCIDENT_CREATE
  WARNING: { enabled: true, persistent: true }, // WARNING_ADD
  FAMILY_CREATE: { enabled: true, persistent: true }, // FAMILY_CREATE
  PET_CREATE: { enabled: true, persistent: false }, // PET_CREATE
  PET_UPDATE: { enabled: true, persistent: false }, // PET_UPDATE
  PET_DELETE: { enabled: true, persistent: false }, // PET_DELETE
};

const useAuditNotifications = () => {
  const { addNotification, showToast } = useNotifications();

  // Get notification settings from localStorage
  const getNotificationSettings = useCallback(() => {
    const saved = localStorage.getItem('vms_notification_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // eslint-disable-next-line no-console
        console.warn(
          'Invalid notification settings in localStorage, using defaults'
        );
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }, []);

  // Save notification settings to localStorage
  const saveNotificationSettings = useCallback((settings) => {
    localStorage.setItem('vms_notification_settings', JSON.stringify(settings));
  }, []);

  // Process an audit entry and trigger notifications if enabled
  const processAuditEntry = useCallback(
    (auditEntry) => {
      const settings = getNotificationSettings();
      const { actionType, entity, details, reason } = auditEntry;

      // eslint-disable-next-line no-console
      console.log('🔔 Processing audit entry:', {
        actionType,
        entity,
        details,
        reason,
      });
      // eslint-disable-next-line no-console
      console.log('📋 Available settings keys:', Object.keys(settings));
      // eslint-disable-next-line no-console
      console.log('🎛️ Settings for this action:', settings[actionType]);

      // Check if notifications are enabled for this action type
      const actionSettings = settings[actionType];
      if (!actionSettings || !actionSettings.enabled) {
        // eslint-disable-next-line no-console
        console.log(
          '❌ Notifications disabled for:',
          actionType,
          '- Settings:',
          actionSettings
        );
        return; // Notifications disabled for this action
      }

      // Determine notification type and persistence based on action
      let notificationType = 'info';
      let persistent = actionSettings.persistent;

      // Smart notification type detection - use actual action values
      if (actionType === 'ARCHIVE') {
        // Deaths are warnings and persistent, others are info
        notificationType = reason === 'overleden' ? 'warning' : 'info';
        persistent = reason === 'overleden' ? true : actionSettings.persistent;
      } else if (actionType === 'RESTORE') {
        notificationType = 'success';
      } else if (actionType === 'CREATE') {
        notificationType = 'success';
      } else if (actionType === 'INCIDENT' || actionType === 'WARNING') {
        notificationType = 'warning';
        persistent = true; // Always persistent for incidents/warnings
      } else if (actionType === 'UPDATE') {
        notificationType = 'success';
      } else if (actionType === 'FAMILY_CREATE') {
        notificationType = 'success';
      } else if (actionType === 'PET_CREATE' || actionType === 'PET_UPDATE') {
        notificationType = 'success';
      } else if (actionType === 'PET_DELETE') {
        notificationType = 'info';
      }

      // Create proper notification structure
      const notification = {
        type: notificationType,
        title: details || 'Actie uitgevoerd', // Fallback if no details
        message: `Door ${auditEntry.userName || 'Onbekend'} om ${new Date(auditEntry.timestamp).toLocaleTimeString()}`, // Add context message
        action: actionType.includes('CREATE') ? 'view_resident' : null,
        actionData:
          entity === 'Resident'
            ? { residentId: auditEntry.newValue?.id }
            : null,
      };

      // eslint-disable-next-line no-console
      console.log('📢 Creating notification:', notification);

      if (persistent) {
        // Add to notification center (existing behavior)
        addNotification(notification);
      } else {
        // Show as toast (new behavior) - only use title for toasts
        showToast({
          type: notificationType,
          message: details,
          duration: 4000,
          action: notification.action,
          actionData: notification.actionData,
        });
      }
    },
    [addNotification, showToast, getNotificationSettings]
  );

  return {
    processAuditEntry,
    getNotificationSettings,
    saveNotificationSettings,
    DEFAULT_SETTINGS,
  };
};

export default useAuditNotifications;
