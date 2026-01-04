import { cn } from '@/lib/utilsStyles';
import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import DivReact from '../atomos/DivReact';

type Props = {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  classContent?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
  icon?: any;
  classNameIcon?: string;
};

const Section = ({
  title,
  children,
  rightContent,
  className,
  classContent,
  isCollapsible = false,
  defaultOpen = true,
  icon: Icon,
  classNameIcon,
}: Props) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (isCollapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <DivReact
      className={twMerge(
        'transition-all duration-200',
        isCollapsible && !isOpen && 'py-1',
        classContent
      )}
    >
      <div
        className={twMerge(
          'text-primary-textoTitle font-medium',
          isOpen ? 'mb-2' : 'mb-0',
          'flex items-center justify-between w-full select-none',
          isCollapsible && 'cursor-pointer px-1 -mx-1 rounded transition-colors hover:bg-black/5',
          className
        )}
      >
        <div
          onClick={isCollapsible ? handleToggle : undefined}
          className="flex items-center gap-2 py-2 flex-1"
        >
          {isCollapsible && (
            <ChevronDown
              size={14}
              className={twMerge(
                'transition-transform duration-200 text-gray-400',
                !isOpen && '-rotate-90'
              )}
            />
          )}
          <h3
            className={twMerge(
              'w-full transition-all text-sm font-semibold inline-flex items-center gap-2  tracking-wider',
              isOpen ? 'border-b border-gray-100 text-gray-700' : 'border-transparent text-gray-400'
            )}
          >
            {Icon && <Icon size={14} className={cn('text-primary-100', classNameIcon)} />} {title}
          </h3>
        </div>
        {rightContent && (
          <div className="ml-4" onClick={e => e.stopPropagation()}>
            {rightContent}
          </div>
        )}
      </div>

      {(!isCollapsible || isOpen) && <div className="w-full animate-aparecer">{children}</div>}
    </DivReact>
  );
};

export default Section;
