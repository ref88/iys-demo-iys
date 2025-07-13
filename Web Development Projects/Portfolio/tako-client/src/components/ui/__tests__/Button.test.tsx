import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' })
    ).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply variant classes correctly', () => {
    const { rerender } = render(<Button variant='primary'>Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<Button variant='secondary'>Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100');

    rerender(<Button variant='danger'>Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Button size='sm'>Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

    rerender(<Button size='md'>Medium</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-sm');

    rerender(<Button size='lg'>Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    // The disabled styles are applied with CSS classes in the base classes
    expect(button).toHaveClass(
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    );
  });

  it('should show loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    // Loading spinner should be present (Loader component from lucide-react)
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should not trigger onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not trigger onClick when loading', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} loading>
        Loading
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Button className='custom-class'>Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('should render with icon component', () => {
    const TestIcon = ({ className }: { className?: string }) => (
      <span className={className} data-testid='test-icon'>
        🔥
      </span>
    );
    render(<Button icon={TestIcon}>With Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });
});
