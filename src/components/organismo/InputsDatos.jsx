import React from 'react'

export default function InputsDatos({label,type,valueInput,name,id,onChange}) {
    return (
        <div className='flex md:w-[45%] my-1 flex-grow  items-start justify-start px-2'>
            <label htmlFor={name} className='mr-3   text-primary-100  font-thin'>
               {label}
            </label>
            <input onChange={onChange} name={name} type={type} value={valueInput} className='border-b font border-primary-100/20 active:ring-0  selection:bg-primary-100/30  rounded flex-grow ring-0 border-0  px-2 valid:ring-0 py-0.5  outline-none   focus:outline-none' />
        </div>
    )
}
