import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export default function BotonIndigo({ children, className, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
