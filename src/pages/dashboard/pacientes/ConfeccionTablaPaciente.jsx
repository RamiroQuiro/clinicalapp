import React from 'react'
import Table from '../../../components/tablaComponentes/Table'
import { RenderActionsPacientes } from '../../../components/tablaComponentes/RenderBotonesActions';

export default function ConfeccionTablaPaciente({pacientesData}) {


    const columnas = [
        {
          label: "nombre y apellido",
          id: 1,
          selector: (row) => row.nombre,
        },
        {
          label: "DNI",
          id: 2,
          selector: (row) => row.dni,
        },
        {
          label: "edad",
          id: 4,
          selector: (row) => row.edad,
        },
        {
          label: "sexo",
          id: 5,
          selector: (row) => row.sexo,
        },
        {
          label: "celular",
          id: 6,
          selector: (row) => row.celular,
        },
        {
          label: "Acciones",
          id: 7,
          selector: (row) => (
            `<div className="flex gap-x-2">
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(row.id)}
              >
                Editar
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(row.id)}
              >
                Eliminar
              </button>
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={() => handleAtender(row.id)}
              >
                Atender
              </button>
            </div>`
          ),}
      ];
  return (
    <Table columnas={columnas} arrayBody={pacientesData}  renderBotonActions={RenderActionsPacientes} />
  )
}
