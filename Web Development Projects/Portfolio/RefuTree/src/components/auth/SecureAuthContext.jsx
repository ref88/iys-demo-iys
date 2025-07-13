// 🛡️ Secure Authentication Context for Nocto VMS
// Production-ready authentication with JWT, encryption, and audit logging

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { secureUserAuth, DEFAULT_LOGIN_CREDENTIALS } from '../../utils/secureUserDatabase.js';
import { 
  sessionUtils, 
  rateLimitUtils, 
  validationUtils, 
  auditUtils, 
  passwordUtils,
  tokenUtils 
} from '../../utils/security.js';

// 🔐 User roles and permissions (updated)
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  CASEWORKER: 'caseworker',
  VOLUNTEER: 'volunteer'
};

export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
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
  },
  [USER_ROLES.MANAGER]: {
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
  },
  [USER_ROLES.CASEWORKER]: {
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
  },
  [USER_ROLES.VOLUNTEER]: {
    canViewAllResidents: false,
    canEditAllResidents: false,
    canDeleteResidents: false,
    canManageUsers: false,
    canViewReports: true,
    canManageSettings: false,
    canApproveLeaveRequests: false,
    canViewMedicalInfo: false,
    canCanAccessAuditLog: false,
    canExportData: false
  }
};

// 🔒 Auth context state
const initialAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionData: null,
  permissions: {},
  loginError: null,
  rateLimitInfo: null
};

// 🔄 Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        loginError: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        sessionData: action.payload.sessionData,
        permissions: action.payload.permissions,
        loginError: null,
        rateLimitInfo: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionData: null,
        permissions: {},
        loginError: action.payload.error,
        rateLimitInfo: action.payload.rateLimitInfo
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionData: null,
        permissions: {},
        loginError: null,
        rateLimitInfo: null
      };
    case 'SESSION_RESTORED':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        sessionData: action.payload.sessionData,
        permissions: action.payload.permissions
      };
    case 'SESSION_EXPIRED':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        sessionData: null,
        permissions: {},
        loginError: 'Sessie verlopen. Log opnieuw in.'
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        loginError: null
      };
    default:
      return state;
  }
};

// 🔐 Create auth context
const SecureAuthContext = createContext();

// 🛡️ Auth Provider Component
export const SecureAuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // 🔄 Session restoration on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const sessionData = sessionUtils.getSession();
        
        if (sessionData) {
          // Verify user still exists and is active
          const user = secureUserAuth.getUserById(sessionData.user.id);
          
          if (user && user.isActive) {
            const permissions = getUserPermissions(user);
            
            dispatch({
              type: 'SESSION_RESTORED',
              payload: {
                user: user,
                sessionData: sessionData,
                permissions: permissions
              }
            });

            // Log session restoration
            auditUtils.logAction('SESSION_RESTORED', {
              userId: user.id,
              sessionId: sessionData.token.substring(0, 10)
            }, user);
          } else {
            // User no longer exists or is inactive
            sessionUtils.clearSession();
            dispatch({ type: 'SESSION_EXPIRED' });
          }
        } else {
          // No valid session
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        sessionUtils.clearSession();
        dispatch({ type: 'LOGOUT' });
      }
    };

    restoreSession();
  }, []);

  // 🔑 Login function
  const login = useCallback(async (username, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Validate input
      const sanitizedUsername = validationUtils.sanitizeInput(username);
      const usernameValidation = validationUtils.validateUsername(sanitizedUsername);
      
      if (!usernameValidation.isValid) {
        throw new Error('Ongeldige gebruikersnaam format');
      }

      // Check rate limiting
      const rateLimitInfo = rateLimitUtils.checkRateLimit(sanitizedUsername);
      
      if (rateLimitInfo.isLocked) {
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: `Te veel mislukte pogingen. Probeer opnieuw over ${rateLimitInfo.resetTime} seconden.`,
            rateLimitInfo: rateLimitInfo
          }
        });
        return { success: false, message: 'Account tijdelijk vergrendeld' };
      }

      // Attempt authentication
      const authResult = await secureUserAuth.authenticateUser(sanitizedUsername, password);

      if (authResult.success) {
        // Clear rate limiting on successful login
        rateLimitUtils.clearRateLimit(sanitizedUsername);

        // Create secure session
        const sessionData = sessionUtils.createSession(authResult.user);
        const permissions = getUserPermissions(authResult.user);

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: authResult.user,
            sessionData: sessionData,
            permissions: permissions
          }
        });

        // Log successful login
        auditUtils.logAction('LOGIN_SUCCESS', {
          userId: authResult.user.id,
          method: 'password'
        }, authResult.user);

        return { success: true, message: 'Succesvol ingelogd' };
      } else {
        // Record failed attempt
        rateLimitUtils.recordFailedAttempt(sanitizedUsername);
        
        // Log failed login attempt
        auditUtils.logAction('LOGIN_FAILED', {
          username: sanitizedUsername,
          reason: authResult.message,
          ipAddress: sessionUtils.getClientIP()
        }, { id: 'anonymous', username: 'anonymous', role: 'anonymous' });

        const updatedRateLimitInfo = rateLimitUtils.checkRateLimit(sanitizedUsername);

        dispatch({
          type: 'LOGIN_FAILURE',
          payload: {
            error: authResult.message,
            rateLimitInfo: updatedRateLimitInfo
          }
        });

        return { success: false, message: authResult.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: {
          error: 'Inloggen mislukt. Probeer opnieuw.',
          rateLimitInfo: null
        }
      });

      return { success: false, message: 'Inloggen mislukt' };
    }
  }, []);

  // 🚪 Logout function
  const logout = useCallback(() => {
    try {
      // Log logout action
      if (authState.user) {
        auditUtils.logAction('LOGOUT', {
          userId: authState.user.id,
          sessionDuration: Date.now() - (authState.sessionData?.loginTime || Date.now())
        }, authState.user);
      }

      // Clear session
      sessionUtils.clearSession();

      // Update state
      dispatch({ type: 'LOGOUT' });

      return { success: true, message: 'Succesvol uitgelogd' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Uitloggen mislukt' };
    }
  }, [authState.user, authState.sessionData]);

  // 🔄 Change password function
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      if (!authState.user) {
        throw new Error('Niet ingelogd');
      }

      const result = await secureUserAuth.changePassword(
        authState.user.id,
        currentPassword,
        newPassword
      );

      if (result.success) {
        // Log password change
        auditUtils.logAction('PASSWORD_CHANGED', {
          userId: authState.user.id
        }, authState.user);

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message, feedback: result.feedback };
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Wachtwoord wijzigen mislukt' };
    }
  }, [authState.user]);

  // 🔍 Permission check function
  const hasPermission = useCallback((permission) => {
    if (!authState.isAuthenticated || !authState.permissions) {
      return false;
    }
    
    return authState.permissions[permission] === true;
  }, [authState.isAuthenticated, authState.permissions]);

  // 👤 Update user profile
  const updateUserProfile = useCallback(async (updates) => {
    try {
      if (!authState.user) {
        throw new Error('Niet ingelogd');
      }

      const result = secureUserAuth.updateUserProfile(authState.user.id, updates);

      if (result.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: result.user
        });

        // Log profile update
        auditUtils.logAction('PROFILE_UPDATED', {
          userId: authState.user.id,
          updatedFields: Object.keys(updates)
        }, authState.user);

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profiel bijwerken mislukt' };
    }
  }, [authState.user]);

  // 🔒 Get user permissions
  const getUserPermissions = (user) => {
    const rolePermissions = PERMISSIONS[user.role] || {};
    const userPermissions = user.permissions || {};
    
    // Merge role permissions with user-specific permissions
    return { ...rolePermissions, ...userPermissions };
  };

  // 🧹 Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // 📊 Get login credentials (for development)
  const getLoginCredentials = useCallback(() => {
    return DEFAULT_LOGIN_CREDENTIALS;
  }, []);

  // 🔍 Session activity tracking
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        const currentSession = sessionUtils.getSession();
        if (!currentSession) {
          dispatch({ type: 'SESSION_EXPIRED' });
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated]);

  // 🎯 Context value
  const contextValue = {
    // State
    ...authState,
    
    // Actions
    login,
    logout,
    changePassword,
    updateUserProfile,
    hasPermission,
    clearError,
    
    // Utils
    getLoginCredentials,
    
    // Constants
    USER_ROLES,
    PERMISSIONS
  };

  return (
    <SecureAuthContext.Provider value={contextValue}>
      {children}
    </SecureAuthContext.Provider>
  );
};

// 🪝 Custom hook to use auth context
export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (!context) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};

// 🛡️ HOC for protected routes
export const withSecureAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useSecureAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <div>Niet geautoriseerd</div>;
    }
    
    return <Component {...props} />;
  };
};

// 🔒 Permission-based component wrapper
export const PermissionGate = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useSecureAuth();
  
  if (hasPermission(permission)) {
    return children;
  }
  
  return fallback;
};

export default SecureAuthContext;