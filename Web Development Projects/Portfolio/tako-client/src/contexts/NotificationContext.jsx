import React, { createContext, useContext, useState, useEffect } from 'react';
import { logAuditAction } from '../utils/auditLogger.js';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

// Also export as useNotification (singular) for consistency with component imports
export const useNotification = useNotifications;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [nextToastId, setNextToastId] = useState(1);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('vms_notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n) => !n.read).length);
    } else {
      // Initialize with demo notifications
      const demoNotifications = [
        {
          id: 1,
          type: 'success',
          title: 'Nieuwe bewoner toegevoegd',
          message: 'Ahmad Al-Rashid is succesvol toegevoegd aan het systeem.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          action: 'view_resident',
          actionData: { residentId: 1 },
        },
        {
          id: 2,
          type: 'info',
          title: 'Verlofaanvraag goedgekeurd',
          message:
            'Verlofaanvraag van Fatima Hassan voor 20-22 januari is goedgekeurd.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          read: false,
          action: 'view_leave_request',
          actionData: { requestId: 2 },
        },
        {
          id: 3,
          type: 'warning',
          title: 'Document verlopen',
          message:
            'Medische verklaring van Omar Khalil is verlopen en moet vernieuwd worden.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          read: true,
          action: 'view_document',
          actionData: { documentId: 3 },
        },
        {
          id: 4,
          type: 'error',
          title: 'Systeem onderhoud',
          message:
            'Gepland onderhoud van het VMS systeem op zondag 21 januari van 02:00-04:00.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true,
          action: 'system_maintenance',
          actionData: {},
        },
      ];
      setNotifications(demoNotifications);
      setUnreadCount(2);
      localStorage.setItem(
        'vms_notifications',
        JSON.stringify(demoNotifications)
      );
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vms_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Toast management methods
  const showToast = (toast) => {
    const newToast = {
      id: nextToastId,
      timestamp: new Date().toISOString(),
      duration: toast.duration || 4000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    setNextToastId((prev) => prev + 1);

    // Auto-dismiss after duration
    if (newToast.duration > 0) {
      setTimeout(() => dismissToast(newToast.id), newToast.duration);
    }
  };

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const updateToast = (toastId, updates) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === toastId ? { ...toast, ...updates } : toast
      )
    );
  };

  // Helper to get current user for audit logging
  const getCurrentUser = () => {
    try {
      const authData = localStorage.getItem('vms_auth');
      if (authData) {
        const auth = JSON.parse(authData);
        return {
          id: auth.userId || 1,
          name: auth.userName || 'Systeem',
          role: auth.userRole || 'admin',
        };
      }
    } catch {
      // Fallback if no auth data
    }
    return { id: 1, name: 'Systeem', role: 'admin' };
  };

  // Unified notification method with audit trail integration
  const notify = (message, options = {}) => {
    const {
      type = 'info',
      persistent = false,
      duration = 4000,
      action = null,
      actionData = null,
      skipAudit = false,
    } = options;

    // Log notification to audit trail (unless explicitly skipped)
    if (!skipAudit) {
      const user = getCurrentUser();
      logAuditAction({
        user,
        actionType: 'NOTIFICATION_CREATED',
        entity: 'Notification',
        details: message,
        newValue: {
          type,
          message,
          persistent,
          action,
          actionData,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (persistent) {
      // Add to notification center (existing behavior)
      addNotification({ type, title: message, action, actionData });
    } else {
      // Show as toast (new behavior)
      showToast({ type, message, duration, action, actionData });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'error':
        return 'AlertCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Nu';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min geleden`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} uur geleden`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dag geleden`;
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    toasts,
    showToast,
    dismissToast,
    updateToast,
    notify,
    getNotificationIcon,
    getNotificationColor,
    formatTimestamp,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
