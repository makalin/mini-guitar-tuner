import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  children?: React.ReactNode;
}

export function Alert({ className = '', variant = 'default', children, ...props }: AlertProps) {
  const variantClass =
    variant === 'destructive'
      ? 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      : 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200';
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />;
}

export function AlertDescription({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />;
}
