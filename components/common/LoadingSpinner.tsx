
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-[6px]',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full 
          border-[var(--color-primary)] border-t-transparent 
          ${sizeClasses[size]}
        `}
        style={{ borderTopColor: 'transparent' }} // Ensure transparent part
      ></div>
      {text && <p className="mt-2 text-sm text-[var(--color-base-content)]">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
