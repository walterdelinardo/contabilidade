// src/components/ui/select.jsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Verifique o caminho para 'utils'

const selectVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
);

const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(selectVariants(), className)} {...props} />
));

Select.displayName = 'Select';

const SelectValue = ({ children }) => {
  return <span>{children}</span>;
};

const SelectItem = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export { Select, SelectValue, SelectItem };