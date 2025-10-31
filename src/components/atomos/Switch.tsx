'use client';
import { cn } from '@/utils/cn';
import * as React from 'react';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    return (
      <label
        className={`flex items-center  justify-between w-fit  gap-3 cursor-pointer p-2  border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition ${className}`}
      >
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-all">
          <input
            type="checkbox"
            ref={ref}
            className="sr-only"
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <div
            className={cn(
              'w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700',
              'peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800',
              'transition-all'
            )}
          ></div>
          <div
            className={cn(
              'absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5',
              'transition-all',
              checked ? 'translate-x-full' : 'translate-x-0',
              checked ? 'border-white' : 'border-gray-300'
            )}
          ></div>
          <div
            className={cn(
              'absolute inset-0 h-full w-full rounded-full',
              'transition-all',
              checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            )}
          ></div>
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full',
              'transition-transform',
              checked ? 'transform translate-x-full' : 'transform translate-x-0'
            )}
          ></div>
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
