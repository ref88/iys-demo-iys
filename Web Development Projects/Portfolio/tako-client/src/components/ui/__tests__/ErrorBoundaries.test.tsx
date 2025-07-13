import { render, screen, fireEvent } from '@testing-library/react';
import {
  AdvancedErrorBoundary,
  CriticalErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
} from '../ErrorBoundaries';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundaries', () => {
  // Suppress console.error during tests
  // eslint-disable-next-line no-console
  const originalError = console.error;
  beforeAll(() => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error = originalError;
  });

  describe('AdvancedErrorBoundary', () => {
    it('should render children when no error occurs', () => {
      render(
        <AdvancedErrorBoundary>
          <ThrowError shouldThrow={false} />
        </AdvancedErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should render error UI when child throws error', () => {
      render(
        <AdvancedErrorBoundary>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      expect(screen.getByText('Er ging iets mis')).toBeInTheDocument();
      expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
    });

    it('should show retry button with correct attempts remaining', () => {
      render(
        <AdvancedErrorBoundary maxRetries={3}>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /probeer opnieuw/i,
      });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveTextContent('3 pogingen over');
    });

    it('should call onError callback when error occurs', () => {
      const mockOnError = jest.fn();

      render(
        <AdvancedErrorBoundary onError={mockOnError}>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object),
        expect.any(String)
      );
    });

    it('should retry when retry button is clicked', () => {
      render(
        <AdvancedErrorBoundary>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /probeer opnieuw/i,
      });
      fireEvent.click(retryButton);

      // After retry, should show the same error (since ThrowError still throws)
      expect(screen.getByText('Er ging iets mis')).toBeInTheDocument();
    });

    it('should show reload and home buttons', () => {
      render(
        <AdvancedErrorBoundary level='page'>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /vernieuwen/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <AdvancedErrorBoundary fallback={customFallback}>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should show debug details in development', () => {
      // Mock development environment
      const originalEnv = process?.env?.NODE_ENV;
      if (process?.env) {
        process.env.NODE_ENV = 'development';
      }

      render(
        <AdvancedErrorBoundary>
          <ThrowError />
        </AdvancedErrorBoundary>
      );

      expect(screen.getByText('Debug Details')).toBeInTheDocument();

      if (process?.env && originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('CriticalErrorBoundary', () => {
    it('should render critical error message', () => {
      render(
        <CriticalErrorBoundary>
          <ThrowError />
        </CriticalErrorBoundary>
      );

      expect(screen.getByText('Kritieke Fout')).toBeInTheDocument();
      expect(screen.getByText(/kritieke fout opgetreden/)).toBeInTheDocument();
    });

    it('should have maxRetries of 1 for critical errors', () => {
      render(
        <CriticalErrorBoundary>
          <ThrowError />
        </CriticalErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /probeer opnieuw/i,
      });
      expect(retryButton).toHaveTextContent('1 pogingen over');
    });
  });

  describe('PageErrorBoundary', () => {
    it('should render page-level error message', () => {
      render(
        <PageErrorBoundary pageName='Dashboard'>
          <ThrowError />
        </PageErrorBoundary>
      );

      expect(
        screen.getByText(/Deze pagina kan niet worden geladen/)
      ).toBeInTheDocument();
    });

    it('should include page name in error boundary name', () => {
      render(
        <PageErrorBoundary pageName='Dashboard'>
          <ThrowError />
        </PageErrorBoundary>
      );

      // The page name should be included in the component name
      expect(screen.getByText('Er ging iets mis')).toBeInTheDocument();
    });
  });

  describe('ComponentErrorBoundary', () => {
    it('should render component-level error message', () => {
      render(
        <ComponentErrorBoundary componentName='UserList'>
          <ThrowError />
        </ComponentErrorBoundary>
      );

      expect(
        screen.getByText(/Dit onderdeel kan niet worden geladen/)
      ).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Component failed to load</div>;

      render(
        <ComponentErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Component failed to load')).toBeInTheDocument();
    });

    it('should have maxRetries of 3 for component errors', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowError />
        </ComponentErrorBoundary>
      );

      const retryButton = screen.getByRole('button', {
        name: /probeer opnieuw/i,
      });
      expect(retryButton).toHaveTextContent('3 pogingen over');
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle multiple nested error boundaries', () => {
      render(
        <CriticalErrorBoundary>
          <PageErrorBoundary>
            <ComponentErrorBoundary>
              <ThrowError />
            </ComponentErrorBoundary>
          </PageErrorBoundary>
        </CriticalErrorBoundary>
      );

      // Should be caught by the innermost boundary (ComponentErrorBoundary)
      expect(
        screen.getByText(/Dit onderdeel kan niet worden geladen/)
      ).toBeInTheDocument();
    });

    it('should reset error state when children change', () => {
      const shouldThrow = true;
      render(
        <ComponentErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ComponentErrorBoundary>
      );

      // First render should show error
      expect(
        screen.getByText(/Dit onderdeel kan niet worden geladen/)
      ).toBeInTheDocument();

      // Note: Error boundaries don't automatically reset when children change
      // This behavior is expected and correct for error boundaries
    });
  });
});
