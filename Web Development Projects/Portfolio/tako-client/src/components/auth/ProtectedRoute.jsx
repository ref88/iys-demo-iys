import React from 'react';
import { Shield, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import LoginPage from './LoginPage.jsx';

const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, loading, user, hasPermission } = useAuth();

  // Error boundary - if there's an error, show a simple message
  if (!isAuthenticated && !loading) {
    return <LoginPage />;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader className='w-8 h-8 text-blue-600 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Beveiliging controleren...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If permission is required, check if user has it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center'>
          <div className='mb-6'>
            <div className='bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Toegang Geweigerd
            </h2>
            <p className='text-gray-600 mb-4'>
              Je hebt geen toestemming om deze pagina te bekijken.
            </p>
          </div>

          <div className='bg-gray-50 rounded-lg p-4 mb-6'>
            <p className='text-sm text-gray-600 mb-2'>
              <strong>Vereiste toestemming:</strong>
            </p>
            <p className='text-sm font-mono text-gray-800 bg-white px-2 py-1 rounded border'>
              {requiredPermission}
            </p>
          </div>

          <div className='bg-blue-50 rounded-lg p-4'>
            <p className='text-sm text-gray-600 mb-2'>
              <strong>Je rol:</strong> {user?.role}
            </p>
            <p className='text-sm text-gray-600'>
              Neem contact op met je beheerder voor toegang.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and has permission (or no permission required), render children
  return (
    <div className='relative'>
      {/* Security indicator */}
      <div className='fixed top-4 right-4 z-50'>
        <div className='bg-green-100 border border-green-200 rounded-lg px-3 py-1 flex items-center space-x-2'>
          <Shield className='w-4 h-4 text-green-600' />
          <span className='text-xs font-medium text-green-800'>
            {user?.role}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
};

export default ProtectedRoute;
