import React from 'react'
import { AuthProvider } from './components/auth/AuthContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { LocationProvider } from './contexts/LocationContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import VMS from './components/features/VMS.jsx'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LocationProvider value={{ currentLocation: 'main' }}>
          <ProtectedRoute>
            <VMS />
          </ProtectedRoute>
        </LocationProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App 