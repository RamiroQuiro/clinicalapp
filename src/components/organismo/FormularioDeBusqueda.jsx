import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { busqueda } from '../../context/store'
import useBusquedaFiltros from '../../hook/useBusquedaFiltro'
import { generateId } from 'lucia'

export default function FormularioDeBusqueda({ value, arrayABuscar, id,placeholder,opcionesFiltrado,onACtion}) {
    // const [clientSelect, setClientSelect] = useState([])
    const arr = []
    const $pacienteSelect = useStore(busqueda)

    const { encontrado, handleSearch, search, setSearch } = useBusquedaFiltros(arrayABuscar,opcionesFiltrado)

    const handleClick = (leg) => {
        busqueda.set({
            pacienteSelect: leg
        })
        if(opcionesFiltrado?.length>=1){
            const idAtencion=generateId(13)
            document.location.href=`/dashboard/consultas/aperturaPaciente/${leg.id}/${idAtencion}`
            setSearch('')
        }
        setSearch('')
    }

    return (
        <div className={`${"styleContenedor"} w-full flex  items relative flex-col items-start gap- duration-300 group -md border rounded-lg`}>

            <input
                onChange={handleSearch}
                placeholder={placeholder}
                value={search}
                type="search" name="busquedaCliente" id="busquedaCliente" className=' w-full text-sm bg-white  rounded-lg group-hover:ring-2  border-gray-300  ring-primary-100/70 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2' />
            {search?.length >= 2  && (
                <div className="w-full  absolute z-40 shadow-md bg-white top-[110%] rounded-xl animate-apDeArriba bg-primari-100 border  text-sm  flex flex-col items-start gap-y-2">
                    {encontrado?.length>=1 ? (
                        encontrado?.map((leg, i) => (
                            <div
                                onClick={onACtion?onACtion:() => handleClick(leg)}
                                className="w-full animate-aparecer py-2 rounded-lg hover:bg-primary-100/40 flex gap-2 items-center  font-semibold  border-b cursor-pointer px-2 text-sm "
                                key={i}
                            >
                                {
                                opcionesFiltrado.length==0?
                                <p>{leg}</p>
                                :
                                opcionesFiltrado.map((item)=>(
                                    <p className='capitalize font-normal text-primary-texto'>{`${item}: `}<span className=' text-primary-textoTitle font-semibold'>{`${leg[item]}`}</span></p>

                                ))}
                            </div>
                        ))
                    ) : (<>
                        <span className='text-xs py-2 px-3 border-y w-full font-semibold'>No se encontro registros</span>
                        <button className='text-xs py-2 px-3 text-primary-100 font-semibold'>+ Agregar registro</button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
