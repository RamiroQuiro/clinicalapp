export const TextArea = ({ label, name, value, onChange, placeholder, rows = 4 }: any) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-2 font-semibold text-gray-700">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 transition"
    />
  </div>
);
