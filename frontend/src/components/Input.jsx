import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      type = 'text',
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-charcoal">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors text-charcoal placeholder-charcoal-light focus:outline-none focus:ring-1 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
              : 'border-warm-300 focus:border-forest focus:ring-forest'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
