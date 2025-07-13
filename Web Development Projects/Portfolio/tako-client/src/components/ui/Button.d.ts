import { ReactNode, MouseEventHandler, ComponentType } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ComponentType<{ className?: string }> | null;
}

declare const Button: React.FC<ButtonProps>;
export default Button;