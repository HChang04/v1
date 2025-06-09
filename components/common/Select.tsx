
import React, { SelectHTMLAttributes, ChangeEventHandler } from 'react';
import { ICONS } from '../../constants';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  placeholder?: string; // Added placeholder prop
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  error,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  placeholder, // Destructure placeholder
  ...props
}) => {
  const baseSelectStyle = `
    block w-full 
    bg-[var(--color-base-200)] text-[var(--color-base-content)] 
    border border-[length:var(--border)] border-[var(--color-neutral)] 
    rounded-[var(--radius-field)] 
    p-[var(--size-field)] 
    focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none
    appearance-none 
    pr-8 
  `; // Added pr-8 for icon space
  const errorSelectStyle = 'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]';

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`block text-sm font-medium text-[var(--color-base-content)] mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`${baseSelectStyle} ${error ? errorSelectStyle : ''} ${selectClassName}`}
          {...props}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[var(--color-base-300)] text-[var(--color-base-content)]">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-base-content)]"
          dangerouslySetInnerHTML={{ __html: ICONS.CHEVRON_DOWN }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
};

export default Select;
