import React from 'react'
import FormularioDeBusqueda from '../../../../../components/organismo/FormularioDeBusqueda'
import { useStore } from '@nanostores/react'
import { atencion, busqueda } from '../../../../../context/store'

export default function ContenedorFormularioBusqueda({ arrayABuscar }) {

  const $pacienteSelect = useStore(busqueda)

  busqueda.subscribe((state) => {
    atencion.set({
      ...atencion.get(),
      motivoInicial: state.pacienteSelect
    })
  })

  const handleNoHayRegistro = (search,setSearch) => {
    busqueda.set({
      pacienteSelect:search
    })
    setSearch('')
  }

  return (
    <div className="flex-1 flex items-center justify-normal gap-2">
      <FormularioDeBusqueda
        handleNoHayRegistro={handleNoHayRegistro}
        opcionesFiltrado={[]}
        arrayABuscar={arrayABuscar}
        placeholder={"Ingrese el motivo aqui..."}
      />
      <span className='text-xs  w-1/5 text-primary-textoTitle '>
        {$pacienteSelect.pacienteSelect && $pacienteSelect.pacienteSelect}
      </span>
    </div>
  )
}
