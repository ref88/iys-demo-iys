import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    // eslint-disable-next-line no-console
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleResetData = () => {
    try {
      // Clear potentially corrupted localStorage data
      const keysToRemove = ['vms_residents', 'vms_pets', 'vms_labels'];
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Reload the page to start fresh
      window.location.reload();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing localStorage:', error);
      // Force reload as fallback
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback: FallbackComponent, showDetails = false } = this.props;

      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onResetData={this.handleResetData}
            retryCount={retryCount}
          />
        );
      }

      // Default error UI
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-6'>
            <div className='flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
            </div>

            <h1 className='text-xl font-bold text-gray-900 text-center mb-2'>
              Er is iets misgegaan
            </h1>

            <p className='text-gray-600 text-center mb-6'>
              {this.isDataCorruptionError(error)
                ? 'Er lijkt een probleem te zijn met de opgeslagen gegevens. U kunt proberen de gegevens te herstellen of de applicatie opnieuw te starten.'
                : 'Er is een onverwachte fout opgetreden. Probeer het opnieuw of herstart de applicatie.'}
            </p>

            <div className='space-y-3'>
              {retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className='w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <RefreshCw className='w-4 h-4' />
                  Opnieuw proberen
                </button>
              )}

              {this.isDataCorruptionError(error) && (
                <button
                  onClick={this.handleResetData}
                  className='w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors'
                >
                  <Home className='w-4 h-4' />
                  Gegevens herstellen
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className='w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='w-4 h-4' />
                Applicatie herstarten
              </button>
            </div>

            {showDetails && error && (
              <details className='mt-6'>
                <summary className='text-sm text-gray-500 cursor-pointer hover:text-gray-700'>
                  Technische details
                </summary>
                <div className='mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto max-h-32'>
                  <strong>Error:</strong> {error.toString()}
                  {errorInfo && (
                    <>
                      <br />
                      <strong>Stack:</strong>
                      <pre className='whitespace-pre-wrap mt-1'>
                        {errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <p className='text-xs text-gray-500 text-center mt-4'>
              Als het probleem blijft bestaan, neem contact op met de beheerder.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  // Helper method to detect data corruption errors
  isDataCorruptionError(error) {
    if (!error) {
      return false;
    }

    const message = error.message?.toLowerCase() || '';
    return (
      message.includes('localstorage') ||
      message.includes('json') ||
      message.includes('parse') ||
      message.includes('unexpected token') ||
      message.includes('invalid') ||
      message.includes('corrupt')
    );
  }
}

export default ErrorBoundary;
