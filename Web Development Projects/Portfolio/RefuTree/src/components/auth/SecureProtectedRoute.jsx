// 🛡️ Secure Protected Route Component for Nocto VMS
// Production-ready route protection with session management

import React from 'react';
import { useSecureAuth } from './SecureAuthContext.jsx';
import SecureLoginPage from './SecureLoginPage.jsx';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';

const SecureProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, sessionData } = useSecureAuth();

  // 🔄 Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nocto VMS</h2>
            <p className="text-gray-600 mb-4">Beveiliging wordt geverifieerd...</p>
            <div className="flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Sessie wordt hersteld</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 Not authenticated - show login page
  if (!isAuthenticated) {
    return <SecureLoginPage />;
  }

  // ✅ Authenticated - show protected content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Veilig ingelogd als {user.name}
              </p>
              <p className="text-xs text-gray-500">
                Sessie actief sinds{' '}
                {sessionData?.loginTime 
                  ? new Date(sessionData.loginTime).toLocaleString('nl-NL')
                  : 'onbekend'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                Beveiligd
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default SecureProtectedRoute;