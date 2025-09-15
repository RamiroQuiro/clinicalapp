import React from 'react';
import DivReact from '../atomos/DivReact';

type Props = {
  title: string;
  children: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
};

const Section = ({ title, children, rightContent, className }: Props) => (
  <DivReact className=" relative">
    <div
      className={` text-base font-semibold text-primary-textoTitle border-b  border-gray-200 pb-1 mb-2 flex items-center justify-between ${className}`}
    >
      <h3>{title}</h3>
      {rightContent && <div>{rightContent}</div>}
    </div>
    {children}
  </DivReact>
);

export default Section;
