import React from 'react'

export default function ButtonCancelar({onclick}) {
  return (
    <span onClick={onclick} className='bg-gray-100 rounded-full absolute -top-5 -right-3 px-2 border text-[8px] border-primary-100/50 cursor-pointer py-1 hover:bg-primary-200 hover:text-white duration-150 '>✕</span>
  )
}
