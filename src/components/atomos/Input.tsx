export const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  disabled = false,
  isLoading = false,
}: any) => {
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
      <input
        type={type}
        id={name}
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition ${className}`}
      />
    </div>
  );
};

export default Input;
