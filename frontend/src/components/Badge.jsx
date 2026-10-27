import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = ''
}) => {
  const variants = {
    default: 'bg-warm-200 text-charcoal border-warm-300',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    confirmed: 'bg-blue-50 text-blue-800 border-blue-200',
    cancelled: 'bg-warm-100 text-charcoal-muted border-warm-300',
    completed: 'bg-purple-50 text-purple-800 border-purple-200',
    sale: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    rent: 'bg-blue-100 text-blue-900 border-blue-300'
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };

  const selectedVariant = variants[variant.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full uppercase tracking-wider ${selectedVariant} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
