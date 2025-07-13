import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, RefreshCw, Home, Phone } from 'lucide-react';
import {
  NetworkResilience,
  ErrorAnalytics,
  getResilienceStatus,
} from '../../utils/resilienceInit';

// 🚀 PHASE 4: USER-FRIENDLY ERROR RECOVERY

interface OfflineBannerProps {
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const unsubscribe = NetworkResilience.onStatusChange((online: boolean) => {
      setIsOnline(online);
      if (!online) {
        setShowBanner(true);
      } else {
        // Hide banner with delay when coming back online
        setTimeout(() => setShowBanner(false), 2000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`
      fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 shadow-lg
      transform transition-transform duration-300 ${className}
    `}
    >
      <div className='flex items-center justify-center space-x-3'>
        <Wifi className='w-5 h-5' />
        <span className='font-medium'>
          {isOnline
            ? 'Verbinding hersteld! Wijzigingen worden gesynchroniseerd...'
            : 'Geen internetverbinding - Werkend in offline modus'}
        </span>
        {isOnline && (
          <div className='w-2 h-2 bg-green-300 rounded-full animate-pulse' />
        )}
      </div>
    </div>
  );
};

interface ErrorRecoveryPanelProps {
  errorId?: string;
  onRecover?: () => void;
}

export const ErrorRecoveryPanel: React.FC<ErrorRecoveryPanelProps> = ({
  errorId,
  onRecover,
}) => {
  const [status, setStatus] = useState(getResilienceStatus());
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getResilienceStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRecover = async () => {
    setIsRecovering(true);

    try {
      // Wait for network if offline
      if (!status.network) {
        const isOnline = await NetworkResilience.waitForOnline(10000);
        if (!isOnline) {
          throw new Error('Network timeout');
        }
      }

      // Call recovery callback
      onRecover?.();

      // Log recovery attempt
      ErrorAnalytics.logError('Manual recovery attempted', {
        component: 'ErrorRecovery',
        level: 'warning',
        metadata: { errorId, recovered: true },
      });
    } catch (error) {
      ErrorAnalytics.logError(error as Error, {
        component: 'ErrorRecovery',
        level: 'warning',
        metadata: { errorId, recovered: false },
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-orange-200 dark:border-orange-800'>
      <div className='flex items-start space-x-4'>
        <AlertTriangle className='w-8 h-8 text-orange-500 flex-shrink-0 mt-1' />

        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
            Herstel Opties
          </h3>

          <div className='space-y-3 mb-4'>
            <div className='flex items-center space-x-2 text-sm'>
              <div
                className={`w-3 h-3 rounded-full ${
                  status.network ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className='text-gray-600 dark:text-gray-300'>
                Internetverbinding: {status.network ? 'Actief' : 'Offline'}
              </span>
            </div>

            <div className='flex items-center space-x-2 text-sm'>
              <div
                className={`w-3 h-3 rounded-full ${
                  status.performance === 'good'
                    ? 'bg-green-500'
                    : status.performance === 'needs-improvement'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className='text-gray-600 dark:text-gray-300'>
                App prestaties:{' '}
                {status.performance === 'good'
                  ? 'Goed'
                  : status.performance === 'needs-improvement'
                    ? 'Matig'
                    : 'Slecht'}
              </span>
            </div>

            {status.errors.recent > 0 && (
              <div className='text-sm text-gray-600 dark:text-gray-300'>
                {status.errors.recent} recente fouten gedetecteerd
              </div>
            )}
          </div>

          <div className='flex flex-wrap gap-3'>
            <button
              onClick={handleRecover}
              disabled={isRecovering}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isRecovering ? 'animate-spin' : ''}`}
              />
              {isRecovering ? 'Herstellen...' : 'Probeer Opnieuw'}
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              <Home className='w-4 h-4 mr-2' />
              Naar Dashboard
            </button>

            <button
              onClick={() => window.location.reload()}
              className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              <RefreshCw className='w-4 h-4 mr-2' />
              Vernieuwen
            </button>
          </div>

          {errorId && (
            <div className='mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs'>
              <span className='text-gray-500 dark:text-gray-400'>
                Fout ID: <code>{errorId}</code>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmergencyContactProps {
  supportEmail?: string;
  supportPhone?: string;
}

export const EmergencyContact: React.FC<EmergencyContactProps> = ({
  supportEmail = 'support@tako-vms.nl',
  supportPhone = '+31 20 123 4567',
}) => {
  return (
    <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
      <h4 className='font-medium text-red-800 dark:text-red-200 mb-2 flex items-center'>
        <Phone className='w-4 h-4 mr-2' />
        Noodcontact
      </h4>
      <p className='text-sm text-red-700 dark:text-red-300 mb-3'>
        Als het probleem aanhoudt, neem dan contact op met de technische
        ondersteuning:
      </p>
      <div className='space-y-2'>
        <a
          href={`mailto:${supportEmail}`}
          className='block text-sm text-red-600 dark:text-red-400 hover:underline'
        >
          📧 {supportEmail}
        </a>
        <a
          href={`tel:${supportPhone}`}
          className='block text-sm text-red-600 dark:text-red-400 hover:underline'
        >
          📞 {supportPhone}
        </a>
      </div>
    </div>
  );
};

// Combined recovery component
export const FullErrorRecovery: React.FC<{
  errorId?: string;
  onRecover?: () => void;
  showEmergencyContact?: boolean;
}> = ({ errorId, onRecover, showEmergencyContact = false }) => {
  return (
    <div className='space-y-4 max-w-2xl mx-auto p-6'>
      <ErrorRecoveryPanel
        {...(errorId !== undefined && { errorId })}
        {...(onRecover !== undefined && { onRecover })}
      />
      {showEmergencyContact && <EmergencyContact />}
      <OfflineBanner />
    </div>
  );
};
