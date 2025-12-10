import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface InputPasswordProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const InputPassword = ({
  label,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  disabled = false,
  isLoading = false,
  className,
}: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Mostrar skeleton cuando está cargando
  if (isLoading) {
    return (
      <div className="flex flex-col w-full">
        {/* Skeleton del label */}
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
        {/* Skeleton del input */}
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <label
        htmlFor={name}
        className="mb-1 text-sm font-semibold text-primary-texto disabled:text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          disabled={disabled}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default InputPassword;
