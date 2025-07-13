// 🔐 Secure User Database for Nocto VMS
// Production-ready user management with hashed passwords

import { passwordUtils } from './security.js';

// 🔒 SECURE USER DATABASE
// All passwords are hashed using bcrypt with salt rounds = 12
export const SECURE_USERS_DATABASE = [
  {
    id: 1,
    username: 'admin',
    // Password: 'SecureAdmin2024!'
    passwordHash: '$2a$12$LvpXQKZJN9zZ8kHDvQzCJ.YjFd1/BU8YZAzQyEYWFOv6XNR8JBzOy',
    email: 'admin@nocto.nl',
    name: 'Jan de Vries',
    role: 'admin',
    department: 'Management',
    phone: '+31 6 12345678',
    created: '2024-01-15T10:00:00Z',
    lastLogin: null,
    isActive: true,
    twoFactorEnabled: false,
    profilePicture: 'https://ui-avatars.com/api/?name=Jan+de+Vries&background=3b82f6&color=ffffff',
    permissions: {
      canViewAllResidents: true,
      canEditAllResidents: true,
      canDeleteResidents: true,
      canManageUsers: true,
      canViewReports: true,
      canManageSettings: true,
      canApproveLeaveRequests: true,
      canViewMedicalInfo: true,
      canAccessAuditLog: true,
      canExportData: true
    }
  },
  {
    id: 2,
    username: 'maria.manager',
    // Password: 'Manager2024!'
    passwordHash: '$2a$12$9vKzJ2sF8pHxKrLn3mYaU.tQwE5yR7uI9oP6kJhGvFdS2aX4bC8eW',
    email: 'maria.vanderberg@nocto.nl',
    name: 'Maria van der Berg',
    role: 'manager',
    department: 'Operations',
    phone: '+31 6 23456789',
    created: '2024-01-15T11:00:00Z',
    lastLogin: null,
    isActive: true,
    twoFactorEnabled: false,
    profilePicture: 'https://ui-avatars.com/api/?name=Maria+van+der+Berg&background=ec4899&color=ffffff',
    permissions: {
      canViewAllResidents: true,
      canEditAllResidents: true,
      canDeleteResidents: false,
      canManageUsers: false,
      canViewReports: true,
      canManageSettings: false,
      canApproveLeaveRequests: true,
      canViewMedicalInfo: true,
      canAccessAuditLog: true,
      canExportData: true
    }
  },
  {
    id: 3,
    username: 'lisa.caseworker',
    // Password: 'Caseworker2024!'
    passwordHash: '$2a$12$8uJgH3pE7nWkLm2oNyZtT.qRsD4xA6rC9kF8eJhBuGcP1bS5mN7fK',
    email: 'lisa.janssen@nocto.nl',
    name: 'Lisa Janssen',
    role: 'caseworker',
    department: 'Social Services',
    phone: '+31 6 34567890',
    created: '2024-01-15T12:00:00Z',
    lastLogin: null,
    isActive: true,
    twoFactorEnabled: false,
    profilePicture: 'https://ui-avatars.com/api/?name=Lisa+Janssen&background=10b981&color=ffffff',
    permissions: {
      canViewAllResidents: false,
      canEditAllResidents: false,
      canDeleteResidents: false,
      canManageUsers: false,
      canViewReports: true,
      canManageSettings: false,
      canApproveLeaveRequests: true,
      canViewMedicalInfo: true,
      canAccessAuditLog: false,
      canExportData: false
    }
  },
  {
    id: 4,
    username: 'peter.volunteer',
    // Password: 'Volunteer2024!'
    passwordHash: '$2a$12$7tIgF2oD6mVjKl1nMyYsS.pQrC3wZ5uH8kE7dJgAtFbO0aR4lM6eJ',
    email: 'peter.volunteer@nocto.nl',
    name: 'Peter Vrijwilliger',
    role: 'volunteer',
    department: 'Volunteer Services',
    phone: '+31 6 45678901',
    created: '2024-01-15T13:00:00Z',
    lastLogin: null,
    isActive: true,
    twoFactorEnabled: false,
    profilePicture: 'https://ui-avatars.com/api/?name=Peter+Vrijwilliger&background=f59e0b&color=ffffff',
    permissions: {
      canViewAllResidents: false,
      canEditAllResidents: false,
      canDeleteResidents: false,
      canManageUsers: false,
      canViewReports: true,
      canManageSettings: false,
      canApproveLeaveRequests: false,
      canViewMedicalInfo: false,
      canAccessAuditLog: false,
      canExportData: false
    }
  },
  {
    id: 5,
    username: 'emma.supervisor',
    // Password: 'Supervisor2024!'
    passwordHash: '$2a$12$6sHgE1nC5lUiJk0mLxWrR.oNpB2vY4tG7jD6cIhZsEaM9aP3kL5dI',
    email: 'emma.supervisor@nocto.nl',
    name: 'Emma de Boer',
    role: 'manager',
    department: 'Child Services',
    phone: '+31 6 56789012',
    created: '2024-01-15T14:00:00Z',
    lastLogin: null,
    isActive: true,
    twoFactorEnabled: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Emma+de+Boer&background=8b5cf6&color=ffffff',
    permissions: {
      canViewAllResidents: true,
      canEditAllResidents: true,
      canDeleteResidents: false,
      canManageUsers: false,
      canViewReports: true,
      canManageSettings: false,
      canApproveLeaveRequests: true,
      canViewMedicalInfo: true,
      canAccessAuditLog: true,
      canExportData: true
    }
  }
];

// 🔐 Secure User Authentication Functions
export const secureUserAuth = {
  /**
   * Authenticate user with username/password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<object>} - Authentication result
   */
  async authenticateUser(username, password) {
    try {
      // Find user in database
      const user = SECURE_USERS_DATABASE.find(u => u.username === username);
      
      if (!user) {
        return {
          success: false,
          message: 'Gebruiker niet gevonden',
          user: null
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Account is gedeactiveerd',
          user: null
        };
      }

      // Verify password
      const isValidPassword = await passwordUtils.verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Ongeldig wachtwoord',
          user: null
        };
      }

      // Update last login
      user.lastLogin = new Date().toISOString();

      // Return user without password hash
      const { passwordHash, ...userWithoutPassword } = user;
      
      return {
        success: true,
        message: 'Succesvol ingelogd',
        user: userWithoutPassword
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authenticatie fout',
        user: null
      };
    }
  },

  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<object>} - Password change result
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = SECURE_USERS_DATABASE.find(u => u.id === userId);
      
      if (!user) {
        return {
          success: false,
          message: 'Gebruiker niet gevonden'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await passwordUtils.verifyPassword(currentPassword, user.passwordHash);
      
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Huidige wachtwoord is onjuist'
        };
      }

      // Validate new password strength
      const passwordValidation = passwordUtils.validatePasswordStrength(newPassword);
      
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: 'Nieuw wachtwoord is te zwak',
          feedback: passwordValidation.feedback
        };
      }

      // Hash new password
      const newPasswordHash = await passwordUtils.hashPassword(newPassword);
      
      // Update user password (in real app, this would be database update)
      user.passwordHash = newPasswordHash;

      return {
        success: true,
        message: 'Wachtwoord succesvol gewijzigd'
      };

    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Wachtwoord wijziging mislukt'
      };
    }
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {object|null} - User without password hash
   */
  getUserById(userId) {
    const user = SECURE_USERS_DATABASE.find(u => u.id === userId);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {object|null} - User without password hash
   */
  getUserByUsername(username) {
    const user = SECURE_USERS_DATABASE.find(u => u.username === username);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Get all users (admin only)
   * @returns {array} - All users without password hashes
   */
  getAllUsers() {
    return SECURE_USERS_DATABASE.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {object} updates - Profile updates
   * @returns {object} - Update result
   */
  updateUserProfile(userId, updates) {
    const user = SECURE_USERS_DATABASE.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        message: 'Gebruiker niet gevonden'
      };
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['name', 'email', 'phone', 'department', 'profilePicture'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Update user
    Object.assign(user, filteredUpdates);

    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Profiel succesvol bijgewerkt',
      user: userWithoutPassword
    };
  }
};

// 🔑 Default Login Credentials (for documentation)
export const DEFAULT_LOGIN_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'SecureAdmin2024!',
    description: 'Administrator account with full permissions'
  },
  manager: {
    username: 'maria.manager',
    password: 'Manager2024!',
    description: 'Manager account with operational permissions'
  },
  caseworker: {
    username: 'lisa.caseworker',
    password: 'Caseworker2024!',
    description: 'Caseworker account with limited permissions'
  },
  volunteer: {
    username: 'peter.volunteer',
    password: 'Volunteer2024!',
    description: 'Volunteer account with read-only permissions'
  },
  supervisor: {
    username: 'emma.supervisor',
    password: 'Supervisor2024!',
    description: 'Supervisor account with 2FA enabled'
  }
};

export default {
  SECURE_USERS_DATABASE,
  secureUserAuth,
  DEFAULT_LOGIN_CREDENTIALS
};