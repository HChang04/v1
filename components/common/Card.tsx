
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  actions?: ReactNode; // e.g., buttons at the bottom of the card
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  actions,
}) => {
  return (
    <div
      className={`
        bg-[var(--color-base-300)] 
        text-[var(--color-base-content)] 
        rounded-[var(--radius-box)] 
        border border-[length:var(--border)] border-[var(--color-neutral)] 
        shadow-[var(--depth)]  // Shadow might be 0 based on theme
        overflow-hidden 
        ${className}
      `}
    >
      {title && (
        <div className={`p-4 border-b border-[length:var(--border)] border-[var(--color-neutral)] ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-[var(--color-primary-content)]">{title}</h3>
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
      {actions && (
        <div className={`p-4 border-t border-[length:var(--border)] border-[var(--color-neutral)] flex justify-end space-x-2 ${titleClassName}`}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
