import React from 'react';
import { twMerge } from 'tailwind-merge';
import DivReact from '../atomos/DivReact';

type Props = {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  classContent?: string;
};

const Section = ({ title, children, rightContent, className, classContent }: Props) => (
  <DivReact className={classContent}>
    <div
      className={twMerge(
        'text-base font-semibold text-primary-textoTitle',
        'pb-1 mb-2',
        'flex items-center justify-between',
        className
      )}
    >
      <h3 className="w-full border-b border-gray-200 mb-1">{title}</h3>
      {rightContent && <div>{rightContent}</div>}
    </div>
    {children}
  </DivReact>
);

export default Section;
