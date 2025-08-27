export default function InputFormularioSolicitud({
  name,
  type,
  id,
  label,
  onchange,
  value,
  className,
}) {
  return (
    <div className="relative w-full my-2 group flex flex-col">
      <label
        for={id}
        className=" top-0 left-0 duration-300 ring-0 valid:ring-0 py-1  focus:outline-none outline-none z-20 text-sm text-primary-textTitle"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onchange}
        className={`p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:border-transparent focus:ring-offset-2 focus:ring-primary-100 text-sm focus:border-primary-100 placeholder:text-gray-400 transition ${className}`}
      />
    </div>
  );
}
