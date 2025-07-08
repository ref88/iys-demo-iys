import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Also export as useNotification (singular) for consistency with component imports
export const useNotification = useNotifications;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('vms_notifications');
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
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
          actionData: { residentId: 1 }
        },
        {
          id: 2,
          type: 'info',
          title: 'Verlofaanvraag goedgekeurd',
          message: 'Verlofaanvraag van Fatima Hassan voor 20-22 januari is goedgekeurd.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          read: false,
          action: 'view_leave_request',
          actionData: { requestId: 2 }
        },
        {
          id: 3,
          type: 'warning',
          title: 'Document verlopen',
          message: 'Medische verklaring van Omar Khalil is verlopen en moet vernieuwd worden.',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          read: true,
          action: 'view_document',
          actionData: { documentId: 3 }
        },
        {
          id: 4,
          type: 'error',
          title: 'Systeem onderhoud',
          message: 'Gepland onderhoud van het VMS systeem op zondag 21 januari van 02:00-04:00.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true,
          action: 'system_maintenance',
          actionData: {}
        }
      ];
      setNotifications(demoNotifications);
      setUnreadCount(2);
      localStorage.setItem('vms_notifications', JSON.stringify(demoNotifications));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vms_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    getNotificationIcon,
    getNotificationColor,
    formatTimestamp
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 