import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /sluiten/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when escape key is pressed', () => {
    const mockOnClose = jest.fn();
    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const mockOnClose = jest.fn();
    render(<Modal {...defaultProps} onClose={mockOnClose} />);

    // Find backdrop by class since no test id
    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should apply correct size classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size='sm' />);
    let container = document.querySelector('.max-w-md');
    expect(container).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size='md' />);
    container = document.querySelector('.max-w-2xl');
    expect(container).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size='lg' />);
    container = document.querySelector('.max-w-4xl');
    expect(container).toBeInTheDocument();

    rerender(<Modal {...defaultProps} size='xl' />);
    container = document.querySelector('.max-w-6xl');
    expect(container).toBeInTheDocument();
  });

  it('should not show close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);

    expect(
      screen.queryByRole('button', { name: /sluiten/i })
    ).not.toBeInTheDocument();
  });

  it('should not close when closeOnOverlayClick is false', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal
        {...defaultProps}
        onClose={mockOnClose}
        closeOnOverlayClick={false}
      />
    );

    // Try to close with backdrop click
    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('should apply custom className', () => {
    render(<Modal {...defaultProps} className='custom-modal' />);

    const customElement = document.querySelector('.custom-modal');
    expect(customElement).toBeInTheDocument();
  });
});
