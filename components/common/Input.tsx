
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  type = 'text',
  error,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}) => {
  const baseInputStyle = `
    block w-full 
    bg-[var(--color-base-200)] text-[var(--color-base-content)] 
    border border-[length:var(--border)] border-[var(--color-neutral)] 
    rounded-[var(--radius-field)] 
    p-[var(--size-field)] 
    focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none
    placeholder:text-[var(--color-base-content)] placeholder:opacity-50
  `;
  const errorInputStyle = 'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-[var(--color-base-content)] mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`${baseInputStyle} ${error ? errorInputStyle : ''} ${inputClassName}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
};

export default Input;
