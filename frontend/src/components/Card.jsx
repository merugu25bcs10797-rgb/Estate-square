import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-warm-200 overflow-hidden shadow-sm transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-warm-300 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
