export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
}: any) => {
  const baseClasses =
    'md:px-3 md:py-2 px-2 py-1 bg-primary-100 text-white rounded text-xs md:text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2';
  const variantClasses = {
    primary: 'bg-primary-100 text-white hover:bg-primary-600 focus:ring-primary-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    cancel: 'bg-primary-400 text-white hover:bg-primary-600 focus:ring-primary-600',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
