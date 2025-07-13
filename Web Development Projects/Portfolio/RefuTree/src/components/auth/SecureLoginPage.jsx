// 🔐 Secure Login Page for Nocto VMS
// Production-ready login with security features

import React, { useState, useEffect } from 'react';
import { useSecureAuth } from './SecureAuthContext.jsx';
import { passwordUtils, validationUtils } from '../../utils/security.js';
import { 
  Eye, EyeOff, Lock, User, AlertCircle, CheckCircle, 
  Shield, Clock, Info, RefreshCw, LogIn
} from 'lucide-react';

const SecureLoginPage = () => {
  const { 
    login, 
    isLoading, 
    loginError, 
    rateLimitInfo, 
    clearError,
    getLoginCredentials
  } = useSecureAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Rate limiting countdown
  const [countdownTime, setCountdownTime] = useState(0);

  // 🔄 Clear errors when user starts typing
  useEffect(() => {
    if (loginError) {
      clearError();
    }
  }, [formData.username, formData.password, clearError]);

  // ⏰ Rate limiting countdown
  useEffect(() => {
    if (rateLimitInfo && rateLimitInfo.isLocked && rateLimitInfo.resetTime) {
      setCountdownTime(rateLimitInfo.resetTime);
      
      const interval = setInterval(() => {
        setCountdownTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimitInfo]);

  // 📝 Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input
    const sanitizedValue = validationUtils.sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear field-specific validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // ✅ Validate form
  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Gebruikersnaam is verplicht';
    } else {
      const usernameValidation = validationUtils.validateUsername(formData.username);
      if (!usernameValidation.isValid) {
        errors.username = 'Ongeldige gebruikersnaam format';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      errors.password = 'Wachtwoord moet minimaal 8 karakters zijn';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🚪 Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (rateLimitInfo && rateLimitInfo.isLocked) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Login successful - AuthContext will handle navigation
        console.log('Login successful');
      } else {
        // Login failed - error is handled by AuthContext
        console.log('Login failed:', result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 Auto-fill credentials (development only)
  const fillCredentials = (credentialType) => {
    const credentials = getLoginCredentials();
    const cred = credentials[credentialType];
    
    if (cred) {
      setFormData({
        username: cred.username,
        password: cred.password
      });
    }
  };

  // 🔒 Get security status
  const getSecurityStatus = () => {
    if (rateLimitInfo && rateLimitInfo.isLocked) {
      return {
        type: 'locked',
        icon: Lock,
        message: `Account vergrendeld voor ${countdownTime} seconden`,
        color: 'red'
      };
    }
    
    if (rateLimitInfo && rateLimitInfo.remainingAttempts <= 2) {
      return {
        type: 'warning',
        icon: AlertCircle,
        message: `Nog ${rateLimitInfo.remainingAttempts} pogingen over`,
        color: 'orange'
      };
    }
    
    return {
      type: 'secure',
      icon: Shield,
      message: 'Beveiligde login',
      color: 'green'
    };
  };

  const securityStatus = getSecurityStatus();
  const SecurityIcon = securityStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Nocto VMS</h2>
          <p className="mt-2 text-sm text-gray-600">
            Beveiligde toegang tot het vluchtelingen management systeem
          </p>
        </div>

        {/* Security Status */}
        <div className={`bg-${securityStatus.color}-50 border border-${securityStatus.color}-200 rounded-lg p-4`}>
          <div className="flex items-center">
            <SecurityIcon className={`h-5 w-5 text-${securityStatus.color}-600 mr-3`} />
            <span className={`text-sm font-medium text-${securityStatus.color}-800`}>
              {securityStatus.message}
            </span>
          </div>
          
          {countdownTime > 0 && (
            <div className="mt-2 flex items-center text-sm text-red-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>Probeer opnieuw over {countdownTime} seconden</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Gebruikersnaam
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.username ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Voer uw gebruikersnaam in"
                  disabled={isSubmitting || (rateLimitInfo && rateLimitInfo.isLocked)}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Wachtwoord
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-10 pr-10 py-2 border ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Voer uw wachtwoord in"
                  disabled={isSubmitting || (rateLimitInfo && rateLimitInfo.isLocked)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || (rateLimitInfo && rateLimitInfo.isLocked)}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Inloggen
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Development Credentials */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Test Accounts
            </div>
            {showCredentials ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          
          {showCredentials && (
            <div className="mt-4 space-y-3">
              <div className="text-xs text-gray-500 mb-3">
                Klik om automatisch in te vullen:
              </div>
              
              {Object.entries(getLoginCredentials()).map(([key, cred]) => (
                <button
                  key={key}
                  onClick={() => fillCredentials(key)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cred.username}</div>
                      <div className="text-xs text-gray-500">{cred.description}</div>
                    </div>
                    <div className="text-xs text-gray-400">{cred.password}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Deze applicatie gebruikt enterprise-grade beveiliging met JWT tokens,
            <br />
            bcrypt password hashing, en audit logging.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecureLoginPage;