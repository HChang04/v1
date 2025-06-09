
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  const baseStyle = `font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-base-100)] transition-all duration-150 ease-in-out inline-flex items-center justify-center border border-[length:var(--border)] rounded-[var(--radius-selector)]`;

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: `px-3 py-1.5 text-sm leading-tight min-h-[calc(1.5rem+var(--size-selector)*2+var(--border)*2)]`, // Adjusted for --size-selector
    md: `px-4 py-2 text-sm min-h-[calc(1.75rem+var(--size-selector)*2+var(--border)*2)]`,
    lg: `px-6 py-3 text-base min-h-[calc(2rem+var(--size-selector)*2+var(--border)*2)]`,
  };
  
  // Adjusted padding according to --size-selector
  // Default padding 'var(--size-selector)' horizontal, 'calc(var(--size-selector) / 2)' vertical (approx)
  // Let's use Tailwind's padding which is more standard. The DaisyUI variables might be for internal component calculations.
  // Using explicit padding values for better control:
  const paddingBasedOnSize = {
    xs: 'px-2.5 py-[var(--size-selector)] text-xs',
    sm: 'px-3 py-[var(--size-selector)] text-sm',
    md: 'px-4 py-[calc(var(--size-selector)*1.5)] text-base', // Slightly more vertical padding for md
    lg: 'px-5 py-[calc(var(--size-selector)*2)] text-lg',
  };


  const variantStyles = {
    primary: 'bg-[var(--color-primary)] text-[var(--color-primary-content)] border-[var(--color-primary)] hover:bg-opacity-80 focus:ring-[var(--color-primary)]',
    secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-content)] border-[var(--color-secondary)] hover:bg-opacity-80 focus:ring-[var(--color-secondary)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-accent-content)] border-[var(--color-accent)] hover:bg-opacity-80 focus:ring-[var(--color-accent)]',
    ghost: 'bg-transparent text-[var(--color-base-content)] border-transparent hover:bg-[var(--color-neutral)] hover:text-[var(--color-neutral-content)] focus:ring-[var(--color-neutral)]',
    link: 'bg-transparent text-[var(--color-info)] border-transparent hover:underline focus:ring-[var(--color-info)] p-0',
    danger: 'bg-[var(--color-error)] text-[var(--color-error-content)] border-[var(--color-error)] hover:bg-opacity-80 focus:ring-[var(--color-error)]',
    success: 'bg-[var(--color-success)] text-[var(--color-success-content)] border-[var(--color-success)] hover:bg-opacity-80 focus:ring-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)] text-[var(--color-warning-content)] border-[var(--color-warning)] hover:bg-opacity-80 focus:ring-[var(--color-warning)]',
    info: 'bg-[var(--color-info)] text-[var(--color-info-content)] border-[var(--color-info)] hover:bg-opacity-80 focus:ring-[var(--color-info)]',
  };
  
  const disabledStyle = 'opacity-50 cursor-not-allowed';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type="button"
      className={`${baseStyle} ${paddingBasedOnSize[size]} ${variantStyles[variant]} ${widthStyle} ${className} ${disabled || isLoading ? disabledStyle : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
