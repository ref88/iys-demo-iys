import React from 'react'
import { SecureAuthProvider } from './components/auth/SecureAuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { LocationProvider } from './contexts/LocationContext.jsx'
import SecureProtectedRoute from './components/auth/SecureProtectedRoute.jsx'
import VMS from './components/features/VMS.jsx'

function App() {
  return (
    <SecureAuthProvider>
      <NotificationProvider>
        <LocationProvider value={{ currentLocation: 'main' }}>
          <SecureProtectedRoute>
            <VMS />
          </SecureProtectedRoute>
        </LocationProvider>
      </NotificationProvider>
    </SecureAuthProvider>
  )
}

export default App 