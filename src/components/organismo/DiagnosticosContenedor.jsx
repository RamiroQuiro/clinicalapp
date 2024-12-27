import React, { useState } from 'react'
import ContenedorAgregarDiagnostico from '../moleculas/ContenedorAgregarDiagnostico'
import BotonMas from '../atomos/BotonMas'
import { useStore } from '@nanostores/react'
import {atencion} from '../../context/store'
import BotonEliminar from '../moleculas/BotonEliminar'
import BotonEditar from '../moleculas/BotonEditar'
import { showToast } from '../../utils/toast/toastShow'

export default function DiagnosticosContenedor() {
    const [diagnostico, setDiagnostico] = useState({
        diagnostico: '',
        observaciones: ''
    })
    const $atencionStore=useStore(atencion)

    const [arrayDiagnosticos, setArrayDiagnosticos] = useState([])



    const handleChange = (e) => {
        setDiagnostico({
            ...diagnostico,
            [e.target.name]: e.target.value
        })
    }
    const handleAddDiagnostico = (e) => {
        e.preventDefault()
        if(!diagnostico.diagnostico){
            showToast('no hay diagnostico para guardar',{
                background:'bg-primary-400'
            })
            return
        }
        setArrayDiagnosticos(() => [...arrayDiagnosticos, diagnostico])
        setDiagnostico((state) => ({
            diagnostico: '',
            observaciones: ''
        }))
        atencion.set({...$atencionStore,diagnostico:[...$atencionStore.diagnostico,diagnostico]})
    }


    return (
        <div className='w-full  rounded-lg  px-2'>
           
                <div className='flex items-start justify-between w-full gap-1 '>
                    <div className='flex flex-col relative items-start w-full  gap-2 justify-between '>

                        <ContenedorAgregarDiagnostico value={diagnostico.diagnostico} name='diagnostico' type={'text'} handleChange={handleChange} >
                            Diagnostico
                        </ContenedorAgregarDiagnostico>
                        <h2 className='text-xs capitalize '>observaciones:</h2>
                        <textarea
                            className="flex-1 w-full text-sm p-2 text-primary-texto outline-none ring-0 shadow-md border-gray-300 border rounded-lg"
                            rows="5"
                            value={diagnostico.observaciones}
                            name="observaciones"
                            onChange={handleChange}
                            id=""></textarea>
                    </div>
                    <div className='mt-6'>
                        <BotonMas onclick={handleAddDiagnostico} />
                    </div>
                </div>
           
            <div>
                {arrayDiagnosticos?.map((diagnostico, i) => (
                  <div className={`${diagnostico.id==''?'bg-primary-500/20 animate-pulse':'bg-white'} p-2 rounded-lg text-primary-texto border-gray-200 border flex flex-col gap-2 my-2 shadow-md`}>
                        <div className='text-sm font-semibold tracking-wide flex items-center justify-start gap-2'>
                            <span>{i + 1}</span>
                            <p className='flex-1'>{diagnostico.diagnostico}</p>
                            <div className='flex gap-2'>
                                <BotonEditar/>
                               <BotonEliminar/>
                            </div>
                        </div>
                        <div className='text-sm border-y border-gray-300 py-2'>
                            <p className='break-words'>{diagnostico.observaciones}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
