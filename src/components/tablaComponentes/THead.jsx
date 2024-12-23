import React from 'react'
import Th from './Th';
import { useStore } from '@nanostores/react';
import { columnSelectTable } from '../../context/store';

export default function THead({ columnas, arrayBody }) {

    const $columnSelectTable=useStore(columnSelectTable)

    const onClickend = (e) => {
        
        // columnas.selector()
        // columnSelectTable.set({
        //     asc:!$columnSelectTable.asc,
        //     seleccion: e.selector
        // })
    }
    return (
        <thead className="bg-primary-100/70 rounded-md text-white w-auto">
            <tr id='cabeceraTable' className="rounded-md">
                {
                    columnas?.map((columna) => {
                     
                        return <Th key={columna.id} onClick={''}> {columna.label} </Th>;
                    })
                }
            </tr>
        </thead>

    )
}
