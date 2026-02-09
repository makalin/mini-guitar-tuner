import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg';
  children?: React.ReactNode;
}

export function Button({
  className = '',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  const sizeClass =
    size === 'lg' ? 'h-11 px-8 text-base' : size === 'sm' ? 'h-8 px-3 text-sm' : 'h-9 px-4';
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
