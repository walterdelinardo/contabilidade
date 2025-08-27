// src/components/ui/dialog.jsx
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils'; // Verifique o caminho para 'utils'

const dialogVariants = cva(
  "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Dialog = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn(dialogVariants({}), className)} {...props}>
    {children}
  </div>
));

Dialog.displayName = "Dialog";

export { Dialog };