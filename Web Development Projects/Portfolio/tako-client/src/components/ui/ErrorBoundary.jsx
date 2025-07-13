import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
            <div className='flex items-center mb-4'>
              <AlertTriangle className='w-8 h-8 text-red-500 mr-3' />
              <h1 className='text-xl font-semibold text-gray-900'>
                Er is een fout opgetreden
              </h1>
            </div>

            <p className='text-gray-600 mb-6'>
              De applicatie heeft een onverwachte fout ondervonden. Probeer de
              pagina te vernieuwen of neem contact op met de beheerder.
            </p>

            <div className='flex space-x-3'>
              <button
                onClick={this.handleReset}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Probeer opnieuw
              </button>

              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                Vernieuwen
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='mt-6 p-4 bg-gray-100 rounded-lg'>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Debug informatie:
                </h3>
                <pre className='text-xs text-gray-700 overflow-auto'>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
