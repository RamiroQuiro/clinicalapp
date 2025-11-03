import React from 'react';

interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
}

interface Props {
  profesionales: Profesional[];
  valorActual: string | null; // ID del profesional seleccionado o 'todos'
  onSeleccion: (id: string | null) => void;
  incluirOpcionTodos?: boolean; // Prop para decidir si se muestra la opción "Todos"
}

export default function SelectorProfesional({
  profesionales,
  valorActual,
  onSeleccion,
  incluirOpcionTodos = true
}: Props) {

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSeleccion(value === 'todos' ? null : value);
  };

  return (
    <div className="flex items-center justify-normal gap-2 ">
      <label htmlFor="medicoId" className="block text-sm font-medium text-gray-700 ">
        Profesional
      </label>
      <select
        id="medicoId"
        name="medicoId"
        value={valorActual ?? 'todos'}
        onChange={handleInputChange}
        className="block w-full pl-3 pr-10 py-0.5 text-primary-100 font-semibold border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white capitalize"
      >
        {incluirOpcionTodos && <option value="todos">Todos</option>}
        {profesionales?.map(profesional => (
          <option key={profesional.id} value={profesional.id}>
            {profesional.nombreApellido ? profesional.nombreApellido : profesional.nombre}  {profesional.apellido}
          </option>
        ))}
      </select>
    </div>
  );
}
