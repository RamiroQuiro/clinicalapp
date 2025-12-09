import { filtroBusqueda } from '@/context/store';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { RenderActionsPacientes } from '../../../components/tablaComponentes/RenderBotonesActions';
import Table from '../../../components/tablaComponentes/Table';

export default function ConfeccionTablaPaciente({ pacientesData, onEdit, onDelete, onAtender }) {
  const [pacientesFiltrados, setPacientesFiltrados] = useState(pacientesData); // Estado inicial igual a los datos completos
  const $filtro = useStore(filtroBusqueda).filtro;

  useEffect(() => {
    // Filtrar pacientes en función del filtr
    const filtrados = pacientesData.filter(paciente => {
      if ($filtro === 'todos') return true; // Mostrar todos si el filtro es 'todos'
      return (
        paciente.nombreApellido.toLowerCase().includes($filtro) ||
        paciente.dni.toString().includes($filtro) ||
        (paciente?.sexo?.toLowerCase() || '').includes($filtro) ||
        (paciente?.celular?.toString() || '').includes($filtro)
      );
    });

    setPacientesFiltrados(filtrados);
  }, [$filtro, pacientesData]); // Ejecutar cada vez que cambie $filtro o pacientesData

  const columnas = [
    { label: 'Nombre y Apellido', id: 1, selector: row => row.nombreApellido },
    { label: 'DNI', id: 2, selector: row => row.dni },
    { label: 'Edad', id: 4, selector: row => row.edad },
    { label: 'Sexo', id: 5, selector: row => row.sexo },
    { label: 'Celular', id: 6, selector: row => row.celular },
    {
      label: 'Acciones',
      id: 7,
      selector: row => (
        <div className="flex gap-x-2">
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            onClick={() => onEdit && onEdit(row.id)}
          >
            Editar
          </button>
          {/* 
          <button
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
            onClick={() => onDelete && onDelete(row.id)}
          >
            Eliminar
          </button>
           */}
           {/* El botón atender redirige o ejecuta acción */}
          <button
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
            onClick={() => onAtender ? onAtender(row.id) : (window.location.href = `/api/atencion/nueva?pacienteId=${row.id}`)}
          >
            Atender
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Tabla de pacientes */}
      <Table
        columnas={columnas}
        arrayBody={pacientesFiltrados}
        renderBotonActions={RenderActionsPacientes}
      />
    </div>
  );
}
