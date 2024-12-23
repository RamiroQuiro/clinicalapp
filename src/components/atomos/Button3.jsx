import { useStore } from '@nanostores/react'
import React from 'react'
import { filtrosBusquedaPrestamos } from '@/context/store'

export default function Button3({ children, isActive,id ,onClick}) {

    const $filtros = useStore(filtrosBusquedaPrestamos)
    const handleClick = (e) => {
        onClick()
        e.preventDefault()
    }

    return (
        <button
        id={id}
            onClick={handleClick}

            className={`${$filtros.filtro==id ? 'bg-primary-100/90 text-white' : ' bg-transparent  text-primary-texto'} px-3 py-1 rounded-lg font-semibold capitalize border-primary-100 duration-300 text-xs border-dashed border bg-transparent hover:bg-primary-100/80 hover:text-white hover:border-primary-resaltado`}>

            {children}
        </button>
    )
}
