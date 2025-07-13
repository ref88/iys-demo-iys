import { render, screen, fireEvent } from '@testing-library/react';
import { DarkModeProvider, useDarkMode } from '../DarkModeContext';

// Test component to use the context
const TestComponent = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div>
      <span data-testid='dark-mode-status'>
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
      <button onClick={toggleDarkMode} data-testid='toggle-button'>
        Toggle
      </button>
    </div>
  );
};

describe('DarkModeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove any existing dark class
    document.documentElement.classList.remove('dark');

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('should provide default light mode', () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    expect(screen.getByTestId('dark-mode-status')).toHaveTextContent('Light');
  });

  it('should toggle dark mode when button is clicked', () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    const status = screen.getByTestId('dark-mode-status');

    // Initially light
    expect(status).toHaveTextContent('Light');

    // Toggle to dark
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent('Dark');

    // Toggle back to light
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent('Light');
  });

  it('should persist dark mode preference in localStorage', () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // Toggle to dark mode
    fireEvent.click(toggleButton);

    // Check if preference is saved
    expect(localStorage.getItem('darkMode')).toBe('true');

    // Toggle back to light mode
    fireEvent.click(toggleButton);

    // Check if preference is updated
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  it('should restore dark mode preference from localStorage', () => {
    // Set dark mode in localStorage before rendering
    localStorage.setItem('darkMode', 'true');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Should start in dark mode
    expect(screen.getByTestId('dark-mode-status')).toHaveTextContent('Dark');
  });

  it('should apply dark class to document element in dark mode', () => {
    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    // Initially no dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark mode
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to light mode
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should handle system preference when no localStorage value exists', () => {
    // Mock matchMedia for system preference
    const mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Should call matchMedia to check system preference
    expect(mockMatchMedia).toHaveBeenCalled();
  });

  it('should use light mode as default when no preference exists', () => {
    // Ensure no localStorage value exists
    localStorage.removeItem('darkMode');

    render(
      <DarkModeProvider>
        <TestComponent />
      </DarkModeProvider>
    );

    // Should default to light mode (since matchMedia is mocked to return false)
    expect(screen.getByTestId('dark-mode-status')).toHaveTextContent('Light');
  });
});
