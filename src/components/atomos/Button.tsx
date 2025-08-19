export const Button = ({ children, onClick, type = 'button', variant = 'primary' }: any) => {
  const baseClasses =
    'px-2 py-1 bg-primary-100 text-white rounded-lg text-sm hover:bg-primary/90 transition-colors';
  const variantClasses = {
    primary: 'bg-primary-100 text-white hover:bg-primary-600 focus:ring-primary-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
  };
  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};

export default Button;
