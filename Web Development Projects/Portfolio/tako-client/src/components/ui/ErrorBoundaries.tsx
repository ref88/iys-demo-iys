import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react';

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

// 🚀 PHASE 4: PRODUCTION-READY ERROR BOUNDARIES

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  maxRetries?: number;
  level?: 'page' | 'component' | 'critical';
  name?: string;
}

// 🛡️ Advanced Error Boundary with Retry Logic
export class AdvancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState((prevState) => ({
      errorInfo,
      errorId:
        prevState.errorId ||
        `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }));

    // Call custom error handler
    this.props.onError?.(error, errorInfo, this.state.errorId);

    // Log to production monitoring
    this.logErrorToService(error, errorInfo, this.state.errorId);
  }

  private logErrorToService = (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string
  ): void => {
    // In production, send to monitoring service
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV === 'production'
    ) {
      // Send to Sentry, LogRocket, or other monitoring service
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', {
        errorId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component',
        name: this.props.name || 'Unknown',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary] Dev Error:', error, errorInfo);
    }
  };

  private handleRetry = (): void => {
    const maxRetries = this.props.maxRetries || 3;

    if (this.state.retryCount < maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level || 'component';
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <div
          className={`
          flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 
          ${level === 'page' ? 'min-h-screen' : 'min-h-64'}
        `}
        >
          <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800'>
            <div className='flex items-center mb-4'>
              <Shield className='w-8 h-8 text-red-500 mr-3' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                  {level === 'critical' ? 'Kritieke Fout' : 'Er ging iets mis'}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>

            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              {level === 'critical'
                ? 'Er is een kritieke fout opgetreden. De applicatie kan mogelijk niet correct functioneren.'
                : level === 'page'
                  ? 'Deze pagina kan niet worden geladen vanwege een onverwachte fout.'
                  : 'Dit onderdeel kan niet worden geladen.'}
            </p>

            <div className='space-y-3'>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className='w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Probeer opnieuw ({maxRetries - this.state.retryCount} pogingen
                  over)
                </button>
              )}

              <div className='flex space-x-3'>
                {level === 'page' && (
                  <button
                    onClick={this.handleGoHome}
                    className='flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                  >
                    <Home className='w-4 h-4 mr-2' />
                    Home
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className='flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                >
                  Vernieuwen
                </button>
              </div>
            </div>

            {typeof process !== 'undefined' &&
              process.env?.NODE_ENV === 'development' &&
              this.state.error && (
                <details className='mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
                  <summary className='font-semibold text-gray-900 dark:text-gray-100 cursor-pointer flex items-center'>
                    <Bug className='w-4 h-4 mr-2' />
                    Debug Details
                  </summary>
                  <pre className='mt-2 text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40'>
                    <strong>Error:</strong> {this.state.error.message}
                    {'\n\n'}
                    <strong>Stack:</strong> {this.state.error.stack}
                    {'\n\n'}
                    <strong>Component Stack:</strong>{' '}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🎯 Specialized Error Boundaries for Different Scenarios

// Critical App-Level Boundary
export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AdvancedErrorBoundary
    level='critical'
    name='CriticalApp'
    maxRetries={1}
    onError={(error, errorInfo, errorId) => {
      // Send critical alerts
      // eslint-disable-next-line no-console
      console.error('[CRITICAL]', { error, errorInfo, errorId });
    }}
  >
    {children}
  </AdvancedErrorBoundary>
);

// Page-Level Boundary
export const PageErrorBoundary: React.FC<{
  children: ReactNode;
  pageName?: string;
}> = ({ children, pageName }) => (
  <AdvancedErrorBoundary
    level='page'
    name={`Page_${pageName || 'Unknown'}`}
    maxRetries={2}
  >
    {children}
  </AdvancedErrorBoundary>
);

// Component-Level Boundary with Custom Fallback
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => (
  <AdvancedErrorBoundary
    level='component'
    name={`Component_${componentName || 'Unknown'}`}
    maxRetries={3}
    fallback={fallback}
  >
    {children}
  </AdvancedErrorBoundary>
);

// Async Data Boundary for API failures
export const AsyncErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <AdvancedErrorBoundary
    level='component'
    name='AsyncData'
    maxRetries={5}
    fallback={
      <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg'>
        <div className='flex items-center'>
          <AlertTriangle className='w-5 h-5 text-yellow-500 mr-2' />
          <span className='text-yellow-800 dark:text-yellow-200'>
            Data kon niet worden geladen. Controleer uw internetverbinding.
          </span>
        </div>
      </div>
    }
  >
    {children}
  </AdvancedErrorBoundary>
);
