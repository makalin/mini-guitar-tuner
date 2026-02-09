import React, { useState } from 'react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value = '', onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: onValueChange ?? (() => {}),
        open,
        setOpen,
      }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder = '' }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return <>{placeholder}</>;
  return <span>{ctx.value || placeholder}</span>;
}

export function SelectContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx || !ctx.open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className = '' }: SelectItemProps) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  return (
    <div
      role="option"
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-8 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 ${
        ctx.value === value ? 'bg-gray-100 dark:bg-gray-700' : ''
      } ${className}`}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
    >
      {children}
    </div>
  );
}
