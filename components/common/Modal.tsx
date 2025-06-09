
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full rounded-none',
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-base-100)] bg-opacity-75 transition-opacity"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className={`
          bg-[var(--color-base-300)] text-[var(--color-base-content)]
          rounded-[var(--radius-box)] shadow-[var(--depth)] 
          border border-[length:var(--border)] border-[var(--color-neutral)]
          flex flex-col
          w-full m-4
          ${sizeClasses[size]}
          ${size !== 'full' ? 'max-h-[90vh]' : 'h-full'}
        `}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[length:var(--border)] border-[var(--color-neutral)]">
            <h3 className="text-lg font-semibold text-[var(--color-primary-content)]">{title}</h3>
            <button
              onClick={onClose}
              className="text-[var(--color-base-content)] hover:text-[var(--color-primary-content)] transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto flex-grow">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-[length:var(--border)] border-[var(--color-neutral)] flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  const modalRoot = document.getElementById('root'); // Or a dedicated modal root
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default Modal;
