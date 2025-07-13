import React, { Suspense, ReactNode, useState, useEffect } from 'react';
import { getSkeletonForView } from './LoadingSkeletons.jsx';

// 🚀 PHASE 4: INTELLIGENT SUSPENSE WITH PROGRESSIVE LOADING

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  type?: string;
  minDelay?: number; // Minimum time to show loading (prevent flashing)
  timeout?: number; // Maximum time before showing error
  onTimeout?: () => void;
}

interface ProgressiveLoadingProps {
  children: ReactNode;
  steps: Array<{
    delay: number;
    component: ReactNode;
  }>;
}

// 🎭 Progressive Loading with Multiple States
export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  children,
  steps,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timers: number[] = [];

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        if (!isLoaded) {
          setCurrentStep(index + 1);
        }
      }, step.delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [steps, isLoaded]);

  useEffect(() => {
    // Detect when component has loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [children]);

  if (isLoaded) {
    return <>{children}</>;
  }

  const currentStepComponent =
    steps[Math.min(currentStep, steps.length - 1)]?.component;
  return <>{currentStepComponent}</>;
};

// 🧠 Smart Suspense with Anti-Flash and Timeout
export const SmartSuspense: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback,
  type = 'dashboard',
  minDelay = 200,
  timeout = 10000,
  onTimeout,
}) => {
  const [showFallback, setShowFallback] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Anti-flash: Don't show loading immediately
    const delayTimer = setTimeout(() => {
      setShowFallback(true);
    }, minDelay);

    // Timeout detection
    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(timeoutTimer);
    };
  }, [minDelay, timeout, onTimeout]);

  const defaultFallback = showFallback ? (
    <div className='relative'>
      {getSkeletonForView(type)}
      {hasTimedOut && (
        <div className='absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center'>
          <div className='text-center p-6'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4' />
            <p className='text-gray-600 dark:text-gray-400'>
              Laden duurt langer dan verwacht...
            </p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Vernieuwen
            </button>
          </div>
        </div>
      )}
    </div>
  ) : null;

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

// 🔄 Retry-Enabled Suspense
export const RetrySuspense: React.FC<{
  children: ReactNode;
  type?: string;
  maxRetries?: number;
}> = ({ children, type = 'dashboard', maxRetries = 3 }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [key, setKey] = useState(0);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      setKey((prev) => prev + 1);
    }
  };

  const fallback = (
    <div className='relative'>
      {getSkeletonForView(type)}
      {retryCount > 0 && (
        <div className='absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3'>
          <p className='text-sm text-yellow-800 dark:text-yellow-200'>
            Poging {retryCount} van {maxRetries}
          </p>
          {retryCount >= maxRetries && (
            <button
              onClick={() => window.location.reload()}
              className='mt-2 text-xs bg-yellow-600 text-white px-2 py-1 rounded'
            >
              Vernieuwen
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <SmartSuspense
      key={key}
      type={type}
      fallback={fallback}
      onTimeout={handleRetry}
      timeout={5000}
    >
      {children}
    </SmartSuspense>
  );
};

// 🌐 Network-Aware Suspense
export const NetworkAwareSuspense: React.FC<{
  children: ReactNode;
  type?: string;
}> = ({ children, type = 'dashboard' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState<'slow' | 'fast' | 'offline'>(
    'fast'
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnection('fast');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnection('offline');
    };

    // Detect slow connections (if supported)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const networkInfo = (navigator as any).connection;
    let handleConnectionChange: (() => void) | undefined;

    if (networkInfo) {
      handleConnectionChange = () => {
        const effectiveType = networkInfo.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnection('slow');
        } else {
          setConnection('fast');
        }
      };

      networkInfo.addEventListener('change', handleConnectionChange);
      handleConnectionChange(); // Initial check
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkInfo) {
        networkInfo.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  if (!isOnline) {
    return (
      <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
        <div className='flex items-center'>
          <div className='w-3 h-3 bg-red-500 rounded-full mr-3' />
          <div>
            <p className='font-medium text-red-800 dark:text-red-200'>
              Geen internetverbinding
            </p>
            <p className='text-sm text-red-600 dark:text-red-300'>
              Controleer uw verbinding en probeer opnieuw.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const timeout = connection === 'slow' ? 15000 : 5000;
  const minDelay = connection === 'slow' ? 500 : 200;

  return (
    <SmartSuspense type={type} timeout={timeout} minDelay={minDelay}>
      {children}
    </SmartSuspense>
  );
};
