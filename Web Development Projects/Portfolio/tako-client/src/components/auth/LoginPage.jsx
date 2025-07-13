import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  Shield,
  Users,
  Heart,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from './AuthContext.jsx';

const LoginPage = () => {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        // Error is already handled by the auth context
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.username.trim() && formData.password.trim();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4'>
      <div className='max-w-md w-full space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <div className='flex justify-center mb-6'>
            <div className='bg-blue-600 p-3 rounded-full'>
              <Building className='w-8 h-8 text-white' />
            </div>
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>VMS</h2>
          <p className='text-gray-600'>Vluchtelingen Management Systeem</p>
          <p className='text-sm text-gray-500 mt-2'>
            Log in om toegang te krijgen tot het systeem
          </p>
        </div>

        {/* Login Form */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-8'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Username Field */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Gebruikersnaam
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='username'
                  name='username'
                  type='text'
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                  placeholder='Voer je gebruikersnaam in'
                  disabled={loading || isSubmitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Wachtwoord
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className='block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'
                  placeholder='Voer je wachtwoord in'
                  disabled={loading || isSubmitting}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors'
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-center'>
                  <AlertCircle className='h-5 w-5 text-red-400 mr-2' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!isFormValid || loading || isSubmitting}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                isFormValid && !loading && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {loading || isSubmitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                  Inloggen...
                </>
              ) : (
                'Inloggen'
              )}
            </button>
          </form>

          {/* Demo Accounts Info */}
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <p className='text-xs text-gray-500 text-center mb-3'>
              Demo accounts voor testen:
            </p>
            <div className='space-y-2 text-xs'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Admin:</span>
                <span className='font-mono text-gray-800'>
                  admin / {DEMO_CREDENTIALS.admin}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Manager:</span>
                <span className='font-mono text-gray-800'>
                  maria / {DEMO_CREDENTIALS.maria}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Caseworker:</span>
                <span className='font-mono text-gray-800'>
                  lisa / {DEMO_CREDENTIALS.lisa}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Coordinator:</span>
                <span className='font-mono text-gray-800'>
                  sarah / {DEMO_CREDENTIALS.sarah}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Volunteer:</span>
                <span className='font-mono text-gray-800'>
                  peter / {DEMO_CREDENTIALS.peter}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center'>
          <div className='flex justify-center space-x-6 text-gray-400 mb-4'>
            <div className='flex items-center space-x-1'>
              <Shield className='w-4 h-4' />
              <span className='text-xs'>Beveiligd</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Users className='w-4 h-4' />
              <span className='text-xs'>Multi-user</span>
            </div>
            <div className='flex items-center space-x-1'>
              <Heart className='w-4 h-4' />
              <span className='text-xs'>Humanitair</span>
            </div>
          </div>
          <p className='text-xs text-gray-500'>
            © 2024 RefuTree VMS. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
