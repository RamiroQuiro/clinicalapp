import React from 'react';

type Props = {
  label: string;
  name: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  isMulti?: boolean;
};

export default function Select({ label, name, value, onChange, options, isMulti = false }: Props) {
  // Función para manejar la selección múltiple
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    // Crear un evento sintético con los valores seleccionados
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: selectedOptions
      }
    };
    onChange(syntheticEvent as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div className="flex flex-col h-fit w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={isMulti ? handleMultiSelectChange : onChange}
        multiple={isMulti}
        size={isMulti ? 4 : 1} // Mejor visualización para múltiple
        className="p-2 border border-gray-300 rounded-md  select:focus:outline-none select:focus:ring-2 select:focus:ring-offset-2 select:focus:ring-primary-100 select:focus:border-primary-100 placeholder:text-gray-400 transition h-auto"
      >
        {options.map(option => (
          <option key={option.value} className='select:bg-gray-50 select:rounded-xl select:border-gray-300 select:focus:outline-none select:focus:ring-2 select:focus:ring-offset-2 select:focus:ring-primary-100 select:focus:border-primary-100' value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Mostrar selecciones actuales en modo múltiple */}
      {isMulti && Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Seleccionados: </span>
          {value.map(selectedValue => {
            const option = options.find(opt => opt.value === selectedValue);
            return option ? option.label : selectedValue;
          }).join(', ')}
        </div>
      )}
    </div>
  );
}