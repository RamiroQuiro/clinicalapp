import React from 'react';
import DivReact from '../atomos/DivReact';

type Props = {
  title: string;
  children: React.ReactNode;
  botonera?: string;
  className?: string;
};

// --- Componentes de UI para el Formulario ---
const Section = ({ title, children, botonera, className }: Props) => (
  <DivReact className=" relative">
    <div
      className={` text-base font-semibold text-primary-textoTitle border-b border-gray-200 pb-3 mb-2 flex items-center justify-between ${className}`}
    >
      <h3>{title}</h3>
    </div>
    {children}
  </DivReact>
);

export default Section;
