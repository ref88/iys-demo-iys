import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Simple hash function for demo purposes (NOT for production)
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COORDINATOR: 'coordinator',
  CASEWORKER: 'caseworker',
  VOLUNTEER: 'volunteer',
};

export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'view_all_residents',
    'edit_all_residents',
    'delete_residents',
    'manage_users',
    'view_reports',
    'manage_settings',
    'approve_leave_requests',
    'view_medical_info',
    'edit_intake_date',
    'add_residents',
  ],
  [USER_ROLES.MANAGER]: [
    'view_all_residents',
    'edit_all_residents',
    'view_reports',
    'approve_leave_requests',
    'view_medical_info',
    'edit_intake_date',
    'add_residents',
  ],
  [USER_ROLES.COORDINATOR]: [
    'view_all_residents',
    'edit_all_residents',
    'view_reports',
    'approve_leave_requests',
    'view_medical_info',
    'add_residents',
  ],
  [USER_ROLES.CASEWORKER]: [
    'view_assigned_residents',
    'edit_assigned_residents',
    'view_reports',
    'approve_leave_requests',
    'view_medical_info',
  ],
  [USER_ROLES.VOLUNTEER]: ['view_assigned_residents', 'view_reports'],
};

// Field-level permissions for sensitive data
export const FIELD_PERMISSIONS = {
  intakeDate: 'edit_intake_date',
  // Add more field restrictions as needed
};

// Sample users database with hashed passwords
const USERS_DATABASE = [
  {
    id: 1,
    username: 'admin',
    password: simpleHash('admin123'), // Hashed password
    email: 'admin@nocto.nl',
    name: 'Jan de Vries',
    role: USER_ROLES.ADMIN,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    assignedResidents: [], // Admin sees all
    lastLogin: null,
    isActive: true,
  },
  {
    id: 2,
    username: 'maria',
    password: simpleHash('maria123'),
    email: 'maria.vanderberg@nocto.nl',
    name: 'Maria van der Berg',
    role: USER_ROLES.MANAGER,
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    assignedResidents: [1, 4, 8], // Ahmad, Olena, Elena
    lastLogin: null,
    isActive: true,
  },
  {
    id: 3,
    username: 'lisa',
    password: simpleHash('lisa123'),
    email: 'lisa.janssen@nocto.nl',
    name: 'Lisa Janssen',
    role: USER_ROLES.CASEWORKER,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    assignedResidents: [3, 5, 7], // Yonas, Mohammed, Ali
    lastLogin: null,
    isActive: true,
  },
  {
    id: 4,
    username: 'sarah',
    password: simpleHash('sarah123'),
    email: 'sarah.coordinator@nocto.nl',
    name: 'Sarah de Wit',
    role: USER_ROLES.COORDINATOR,
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    assignedResidents: [], // Coordinator sees all
    lastLogin: null,
    isActive: true,
  },
  {
    id: 5,
    username: 'peter',
    password: simpleHash('peter123'),
    email: 'peter.volunteer@nocto.nl',
    name: 'Peter van Dijk',
    role: USER_ROLES.VOLUNTEER,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    assignedResidents: [2, 6], // Fatima, Sofia
    lastLogin: null,
    isActive: true,
  },
];

// Demo credentials for login screen
export const DEMO_CREDENTIALS = {
  admin: 'admin123',
  maria: 'maria123',
  lisa: 'lisa123',
  sarah: 'sarah123',
  peter: 'peter123',
};

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        isAuthenticated: false,
        user: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('vms_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      } catch {
        localStorage.removeItem('vms_user');
      }
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = USERS_DATABASE.find(
        (u) =>
          u.username === username &&
          u.password === simpleHash(password) &&
          u.isActive
      );

      if (user) {
        // Update last login
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem('vms_user', JSON.stringify(updatedUser));

        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser } });
        return { success: true };
      } else {
        throw new Error('Ongeldige gebruikersnaam of wachtwoord');
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('vms_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user profile
  const updateUser = (updates) => {
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('vms_user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user) {
      return false;
    }
    return PERMISSIONS[state.user.role]?.includes(permission) || false;
  };

  // Check if user can access resident
  const canAccessResident = (residentId) => {
    if (!state.user) {
      return false;
    }
    if (
      state.user.role === USER_ROLES.ADMIN ||
      state.user.role === USER_ROLES.MANAGER ||
      state.user.role === USER_ROLES.COORDINATOR
    ) {
      return true; // Admin, Manager and Coordinator can see all residents
    }
    return state.user.assignedResidents.includes(residentId);
  };

  // Get filtered residents based on user permissions
  const getFilteredResidents = (allResidents) => {
    if (!state.user) {
      return [];
    }
    if (
      state.user.role === USER_ROLES.ADMIN ||
      state.user.role === USER_ROLES.MANAGER ||
      state.user.role === USER_ROLES.COORDINATOR
    ) {
      return allResidents; // See all residents
    }
    return allResidents.filter((resident) =>
      state.user.assignedResidents.includes(resident.id)
    );
  };

  // Check if user can edit specific field
  const canEditField = (fieldName) => {
    if (!state.user) {
      return false;
    }
    const requiredPermission = FIELD_PERMISSIONS[fieldName];
    if (!requiredPermission) {
      return true; // No special permission required
    }
    return hasPermission(requiredPermission);
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    hasPermission,
    canAccessResident,
    getFilteredResidents,
    canEditField,
    USER_ROLES,
    PERMISSIONS,
    FIELD_PERMISSIONS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
