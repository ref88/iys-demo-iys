import React, { createContext, useContext, ReactNode } from 'react';
import { LocationContextValue } from '../types';

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
  value: LocationContextValue;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
  value,
}) => {
  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
