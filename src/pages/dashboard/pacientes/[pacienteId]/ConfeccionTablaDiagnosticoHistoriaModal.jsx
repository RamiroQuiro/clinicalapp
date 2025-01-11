import React from 'react'
import Table from '../../../../components/tablaComponentes/Table'

export default function ConfeccionTablaDiagnosticoHistoriaModal({arrayDiagnosticos}) {
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
        label:'',
        id:6,
    },
    ]
    let newArrayDiagnosticos = arrayDiagnosticos?.map((diag) => {
      return {
        id: diag.id,
        diagnostico: diag.diagnostico,
        observaciones: diag.observaciones
      }
    })
    return (
      <Table columnas={columns} arrayBody={newArrayDiagnosticos} />
    )
  }
  