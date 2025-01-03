import React from 'react'
import Table from '../../../../../components/tablaComponentes/Table'
import { RenderActionsEditDelet, RenderActionsPacientes } from '../../../../../components/tablaComponentes/RenderBotonesActions'

export default function ConfeccionTablaDiagnostico({ isExistDiagnosticos }) {

  const columns = [
    {
      label: "diagnostico",
      id: 1,
    },
    {
      label: "observaciones",
      id: 2,
    },
    {
      label: "accion",
      id: 3,
    },
  ]

  let newArrayDiagnosticos = isExistDiagnosticos?.map((diag) => {
    return {
      id: diag.id,
      diagnostico: diag.diagnostico,
      observaciones: diag.observaciones
    }
  })
  return (
    <Table columnas={columns} arrayBody={newArrayDiagnosticos} renderBotonActions={RenderActionsEditDelet} />
  )
}
