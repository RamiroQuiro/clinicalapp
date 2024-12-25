import React from 'react'

export default function BotonMas({onclick}) {

const onclicken=()=>{
    // console.log('ha hecho un click en el mas')
    onclick()
}

  return (
    <button onClick={onclick} className='bg-gray-100 rounded-full px-2 border text-xs border-primary-100/50 cursor-pointer py-1 rotate-45 hover:bg-primary-200 hover:text-white duration-150 '>✕</button>
  )
}
