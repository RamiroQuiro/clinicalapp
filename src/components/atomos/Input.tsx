export const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  disabled = false,
}: any) => (
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

export default Input;
