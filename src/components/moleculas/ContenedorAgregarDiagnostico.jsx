import React from 'react'

export default function ContenedorAgregarDiagnostico({ value,children, name, type, id,handleChange }) {
    return (


        <div className=" w-full  group">
            <label htmlFor={id} className=" top-0 left-0 duration-300 ring-0 valid:ring-0 py-1  focus:outline-none outline-none z-20 text-xs text-primary-texto   ">
                {children}
            </label>
            <input type={type} onChange={handleChange} name={name} value={value} id={id} className="bg-gray-100 peer z-10 w-full  left-0 px-2 py-1 text-sm rounded shadow valid:ring-0   outline-none   focus:outline-none"/>
        </div>
    )
}
