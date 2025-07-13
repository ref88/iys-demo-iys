// 🚀 PHASE 4: RESILIENCE INITIALIZATION

// Global process declaration for TypeScript
declare global {
  var process:
    | {
        env?: {
          NODE_ENV?: string;
        };
      }
    | undefined;
}

import {
  ErrorAnalytics,
  NetworkResilience,
  DataResilience,
} from './resilience';

// Re-export for external use
export { ErrorAnalytics, NetworkResilience, DataResilience };

// 🔧 Initialize all resilience systems
export function initializeResilience(): void {
  // eslint-disable-next-line no-console
  console.log('[Resilience] Initializing production error handling...');

  // Setup network monitoring
  NetworkResilience.init();

  // Setup global error handling
  setupGlobalErrorHandlers();

  // Setup performance monitoring
  setupPerformanceMonitoring();

  // Setup unhandled promise rejection handling
  setupPromiseRejectionHandling();

  // Cleanup old data
  DataResilience.clearExpiredData();

  // Retry any pending error reports
  if (NetworkResilience.isOnlineNow()) {
    ErrorAnalytics.retryPendingErrors();
  }

  // eslint-disable-next-line no-console
  console.log('[Resilience] All systems initialized ✅');
}

function setupGlobalErrorHandlers(): void {
  // Catch all JavaScript errors
  window.addEventListener('error', (event) => {
    ErrorAnalytics.logError(event.error || event.message, {
      component: 'GlobalJS',
      level: 'error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // Catch all unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ErrorAnalytics.logError(event.reason, {
      component: 'UnhandledPromise',
      level: 'error',
      metadata: {
        promise: 'unhandled_rejection',
      },
    });
  });
}

function setupPromiseRejectionHandling(): void {
  // Enhanced promise rejection handling
  window.addEventListener('unhandledrejection', (event) => {
    // Log the error
    ErrorAnalytics.logError(event.reason, {
      component: 'PromiseRejection',
      level: 'error',
    });

    // Prevent default browser console error
    event.preventDefault();

    // Show user-friendly notification
    showUserFriendlyError(
      'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
    );
  });
}

function setupPerformanceMonitoring(): void {
  // Monitor Core Web Vitals
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      // Monitor Largest Contentful Paint (LCP)
      // eslint-disable-next-line no-undef
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // eslint-disable-next-line no-console
          console.log('[Performance] LCP:', entry.startTime);
          if (entry.startTime > 4000) {
            // LCP > 4s is poor
            ErrorAnalytics.logError('Poor LCP performance', {
              component: 'Performance',
              level: 'warning',
              metadata: { lcp: entry.startTime },
            });
          }
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      // eslint-disable-next-line no-undef
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // PerformanceEventTiming not available in all environments
          if (fidEntry.processingStart && fidEntry.startTime) {
            // eslint-disable-next-line no-console
            console.log(
              '[Performance] FID:',
              fidEntry.processingStart - fidEntry.startTime
            );
            if (fidEntry.processingStart - fidEntry.startTime > 300) {
              // FID > 300ms is poor
              ErrorAnalytics.logError('Poor FID performance', {
                component: 'Performance',
                level: 'warning',
                metadata: {
                  fid: fidEntry.processingStart - fidEntry.startTime,
                },
              });
            }
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      // eslint-disable-next-line no-undef
      const clsObserver = new PerformanceObserver((list) => {
        let clsScore = 0;
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any; // LayoutShift interface not available in all environments
          if (layoutShift.hadRecentInput === false && layoutShift.value) {
            clsScore += layoutShift.value;
          }
        }
        if (clsScore > 0.25) {
          // CLS > 0.25 is poor
          ErrorAnalytics.logError('Poor CLS performance', {
            component: 'Performance',
            level: 'warning',
            metadata: { cls: clsScore },
          });
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Resilience] Performance monitoring not available:', error);
    }
  }
}

function showUserFriendlyError(message: string): void {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className =
    'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
        ✕
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

// 📊 Get resilience health status
export function getResilienceStatus(): {
  errors: ReturnType<typeof ErrorAnalytics.getErrorSummary>;
  network: boolean;
  performance: 'good' | 'needs-improvement' | 'poor';
} {
  const errors = ErrorAnalytics.getErrorSummary();
  const network = NetworkResilience.isOnlineNow();

  // Simple performance assessment based on error frequency
  let performance: 'good' | 'needs-improvement' | 'poor' = 'good';
  if (errors.recent > 10) {
    performance = 'poor';
  } else if (errors.recent > 3) {
    performance = 'needs-improvement';
  }

  return {
    errors,
    network,
    performance,
  };
}

// 🔧 Export for testing and debugging
export const ResilienceDebug = {
  getErrorSummary: () => ErrorAnalytics.getErrorSummary(),
  isOnline: () => NetworkResilience.isOnlineNow(),
  simulateError: (message: string) => {
    ErrorAnalytics.logError(message, {
      component: 'Debug',
      level: 'warning',
    });
  },
  clearErrors: () => {
    localStorage.removeItem('errorLogs');
    localStorage.removeItem('pendingErrors');
  },
};

// Make debugging available globally in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  (window as any).ResilienceDebug = ResilienceDebug; // eslint-disable-line @typescript-eslint/no-explicit-any
}
