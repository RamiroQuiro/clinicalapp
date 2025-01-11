import React from 'react'
import Table from '../../../../components/tablaComponentes/Table'

export default function ConfeccionTablaMedicamentosHistoriaModal({arrayMedicamentos}) {
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
            label:'',
            id:6,
        },
    ]
    let newArrayMedicamentos = arrayMedicamentos?.map((med) => {
      return {
        id: med.id,
        medicamento: med.nombre,
        dosis: med.dosis,
        frecuencia:med.frecuencia,
        duracion:med.duracion
      }
    })
    return (
      <Table columnas={columns} arrayBody={newArrayMedicamentos} />
    )
  }
  