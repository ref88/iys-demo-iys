import React from 'react';
import { AuthProvider } from './components/auth/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { LocationProvider } from './contexts/LocationContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import ToastContainer from './components/ui/ToastContainer.jsx';
// 🚀 PHASE 4: PRODUCTION-READY ERROR BOUNDARIES
import {
  CriticalErrorBoundary,
  PageErrorBoundary,
} from './components/ui/ErrorBoundaries';
import { NetworkAwareSuspense } from './components/ui/SuspenseWrapper';
// 🚀 OPTIMIZED ROUTER WITH CODE SPLITTING
import AppRouter from './router/AppRouter.jsx';

function App() {
  return (
    <CriticalErrorBoundary>
      <LanguageProvider>
        <DarkModeProvider>
          <AuthProvider>
            <NotificationProvider>
              <LocationProvider value={{ currentLocation: 'main' }}>
                <PageErrorBoundary pageName='MainApp'>
                  <ProtectedRoute>
                    {/* 🔥 ROUTE-BASED CODE SPLITTING WITH NETWORK AWARENESS */}
                    <NetworkAwareSuspense type='dashboard'>
                      <AppRouter />
                    </NetworkAwareSuspense>
                  </ProtectedRoute>
                  <ToastContainer />
                </PageErrorBoundary>
              </LocationProvider>
            </NotificationProvider>
          </AuthProvider>
        </DarkModeProvider>
      </LanguageProvider>
    </CriticalErrorBoundary>
  );
}

export default App;
