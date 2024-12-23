import React from 'react'
import THead from './THead'
import TBody from './TBody'
import { reportPDF } from '../../context/store'

export default function Table({ columnas,arrayBody, styleTable }) {

    const onClick=(e)=>{
      
    }
    reportPDF.set({
        columnas,arrayBody
    })

    return (
        <table
            className={`${styleTable} items-center bg-transparent w-full border-collapse rounded-md  overflow-hidden`}
        >
           <THead columnas={columnas} arrayBody={arrayBody}/>
           <TBody onClickFila={onClick} arrayBody={arrayBody}/>
        </table>
    )
}
