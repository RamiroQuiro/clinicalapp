export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className,
}: any) => {
  const baseClasses =
    'px-3 py-2 bg-primary-100 text-white rounded text-sm hover:bg-primary/90 transition-colors';
  const variantClasses = {
    primary: 'bg-primary-100 text-white hover:bg-primary-600 focus:ring-primary-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
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
