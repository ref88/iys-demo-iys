import { render, screen } from '@testing-library/react';
import LabelChip from '../LabelChip';

describe('LabelChip Component', () => {
  const mockLabel = {
    id: 'l1',
    name: 'Test Label',
    color: 'blue',
    description: 'Test description',
  };

  it('should render label chip with name', () => {
    render(<LabelChip label={mockLabel} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should apply correct color classes', () => {
    const { rerender } = render(
      <LabelChip label={{ ...mockLabel, color: 'blue' }} />
    );
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-blue-500/20',
      'text-blue-700'
    );

    rerender(<LabelChip label={{ ...mockLabel, color: 'red' }} />);
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-red-500/20',
      'text-red-700'
    );

    rerender(<LabelChip label={{ ...mockLabel, color: 'green' }} />);
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-green-500/20',
      'text-green-700'
    );

    rerender(<LabelChip label={{ ...mockLabel, color: 'yellow' }} />);
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-yellow-500/20',
      'text-yellow-700'
    );

    rerender(<LabelChip label={{ ...mockLabel, color: 'purple' }} />);
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-purple-500/20',
      'text-purple-700'
    );

    rerender(<LabelChip label={{ ...mockLabel, color: 'gray' }} />);
    expect(screen.getByText('Test Label')).toHaveClass(
      'bg-gray-500/20',
      'text-gray-700'
    );
  });

  it('should have title attribute with label name', () => {
    render(<LabelChip label={mockLabel} />);

    const chip = screen.getByText('Test Label');
    expect(chip).toHaveAttribute('title', 'Test Label');
  });

  it('should apply custom className', () => {
    render(<LabelChip label={mockLabel} className='custom-chip' />);

    expect(screen.getByText('Test Label')).toHaveClass('custom-chip');
  });

  it('should have default styling', () => {
    render(<LabelChip label={mockLabel} />);

    const chip = screen.getByText('Test Label');
    expect(chip).toHaveClass(
      'inline-block',
      'px-3',
      'py-1',
      'rounded',
      'text-xs',
      'font-medium'
    );
  });

  it('should fallback to default color for unknown colors', () => {
    const labelWithUnknownColor = { ...mockLabel, color: 'unknown' };
    render(<LabelChip label={labelWithUnknownColor} />);

    const chip = screen.getByText('Test Label');
    expect(chip).toHaveClass('bg-blue-100', 'text-blue-800'); // fallback color
  });
});
