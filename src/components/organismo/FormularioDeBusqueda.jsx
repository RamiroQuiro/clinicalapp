import { useStore } from '@nanostores/react'
import React, { useEffect, useState } from 'react'
import { busqueda } from '../../context/store'
import useBusquedaFiltros from '../../hook/useBusquedaFiltro'

export default function FormularioDeBusqueda({ value, clientes, id,placeholder}) {
    // const [clientSelect, setClientSelect] = useState([])

    const arr = []
    const $clienteSelect = useStore(busqueda)

    // console.log('',$clienteSelect)
    const { encontrado, handleSearch, search, setSearch } = useBusquedaFiltros(clientes,['nombre','apellido','dni'])

    const handleClick = (leg) => {
        busqueda.set({
            clientSelect: leg
        })
        setSearch('')
    }

    return (
        <div className={`${"styleContenedor"} w-full flex items relative flex-col items-start gap- duration-300 group -md `}>

            <input
                onChange={handleSearch}
                placeholder={placeholder}
                value={search}
                type="search" name="busquedaCliente" id="busquedaCliente" className=' w-full text-sm bg-primary-200/10  rounded-md group-hover:ring-2  border-gray-300  ring-primary-100/60 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2' />
            {search?.length >= 2  && (
                <div className="w-full text-primary-400 absolute z-30 shadow-md bg-white top-[103%] rounded-xl animate-apDeArriba bg-primari-100/20  text-sm  flex flex-col items-start gap-y-2">
                    {encontrado ? (
                        encontrado?.map((leg, i) => (
                            <div
                                onClick={() => handleClick(leg)}
                                className="w-full animate-aparecer py-2 rounded hover:bg-primary-100/40  font-semibold  border-b cursor-pointer px-2 text-sm "
                                key={i}
                            >
                                → {leg.nombre} | → {leg.apellido} | → {leg.dni}
                            </div>
                        ))
                    ) : (
                        <span className='text-sm py-2 px-3'>No se encontro registros</span>
                    )}
                </div>
            )}
        </div>
    )
}
