import React from 'react'
import Table from '../../../../../components/tablaComponentes/Table'
import { useStore } from '@nanostores/react'
import { atencion } from '../../../../../context/store'
import { RenderActionsEditDeletDiagnostico } from '../../../../../components/tablaComponentes/RenderBotonesActions'

export default function ConfeccionTablaDiagnostico({ isExistDiagnosticos }) {

  const $diagnosticosStore=useStore(atencion).diagnosticos
  console.log($diagnosticosStore)
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
    <Table columnas={columns} arrayBody={$diagnosticosStore} renderBotonActions={RenderActionsEditDeletDiagnostico} />
  )
}
