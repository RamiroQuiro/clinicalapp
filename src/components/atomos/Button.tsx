import { cn } from '@/utils/cn'; // Importamos nuestra nueva utilidad
import * as React from 'react';

// Definimos las variantes que el botón puede tener
const buttonVariants = {
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    variant: {
      primary: 'bg-primary-100 text-white hover:bg-primary-100/90 focus:ring-primary-100',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
      cancel: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-600',
      outline: 'bg-transparent text-gray-800 hover:bg-gray-200 focus:ring-gray-400',
      downloadPDF: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
      grisOscuro: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700',
      // Estilo copiado de BotonIndigo.tsx
      indigo:
        'border border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500',
      // Nuevo estilo para iconos/texto
      bgTransparent:
        'bg-transparent border border-gray-300/50 hover:bg-gray-200/50 hover:border-gray-300 rounded-lg',
    },
    size: {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
};

// Definimos las props del componente para que TypeScript nos ayude
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants.variant;
  size?: keyof typeof buttonVariants.variants.size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    // Usamos `cn` para construir las clases finales
    const finalClassName = cn(
      buttonVariants.base,
      buttonVariants.variants.variant[variant || buttonVariants.defaultVariants.variant],
      buttonVariants.variants.size[size || buttonVariants.defaultVariants.size],
      className
    );

    return <button className={finalClassName} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export default Button;
export { Button, buttonVariants };
