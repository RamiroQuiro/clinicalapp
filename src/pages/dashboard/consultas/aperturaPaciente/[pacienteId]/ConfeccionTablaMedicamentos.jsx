import React from 'react'
import Table from '../../../../../components/tablaComponentes/Table'
import { RenderActionsEditDelet, RenderActionsPacientes } from '../../../../../components/tablaComponentes/RenderBotonesActions'

export default function ConfeccionTablaMedicamentos({ isExistMedicamentos }) {

  const columns = [
    {
      label: "Medicamento",
      id: 1,
    },
    {
      label: "Dosis",
      id: 2,
    },
    {
      label: "Frecuencia",
      id: 3,
    },
    {
        label:'Duracion',
        id:4,
    },
    {
        label:'Accion',
        id:5,
    }
  ]

  let newArrayMedicamentos = isExistMedicamentos?.map((med) => {
    return {
      id: med.id,
      medicamento: med.nombre,
      dosis: med.dosis,
      frecuencia:med.frecuencia,
      duracion:med.duracion
    }
  })
  return (
    <Table columnas={columns} arrayBody={newArrayMedicamentos} renderBotonActions={RenderActionsEditDelet} />
  )
}
