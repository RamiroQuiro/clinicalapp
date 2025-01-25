import React, { useState } from 'react'
import ContenedorAgregarDiagnostico from '../moleculas/ContenedorAgregarDiagnostico'
import BotonMas from '../atomos/BotonMas'
import { useStore } from '@nanostores/react'
import { atencion } from '../../context/store'
import BotonEliminar from '../moleculas/BotonEliminar'
import BotonEditar from '../moleculas/BotonEditar'
import { showToast } from '../../utils/toast/toastShow'

export default function DiagnosticosContenedor({ isExistDiagnosticos }) {
    const [diagnostico, setDiagnostico] = useState({
        id: '',
        diagnostico: '',
        observaciones: ''
    })
    const $atencionStore = useStore(atencion)
    const [arrayDiagnosticos, setArrayDiagnosticos] = useState(isExistDiagnosticos)

    const handleChange = (e) => {
        setDiagnostico({
            ...diagnostico,
            [e.target.name]: e.target.value
        })
    }

    const handleAddDiagnostico = (e) => {
        e.preventDefault()
        if (!diagnostico.diagnostico) {
            showToast('no hay diagnostico para guardar', {
                background: 'bg-primary-400'
            })
            return
        }
        setArrayDiagnosticos(() => [...arrayDiagnosticos, diagnostico])
        setDiagnostico((state) => ({
            diagnostico: '',
            observaciones: ''
        }))
        atencion.set({ ...$atencionStore, diagnosticos: [...$atencionStore.diagnosticos, diagnostico] })
    }

    const handleEdit = async (updateDiag) => {
        try {
            const editDiagFetch = await fetch('/api/pacientes/atencion/diagnostico', {
                method: 'PUT',
                body: JSON.stringify(updateDiag)
            })
            if (editDiagFetch.ok) {
                showToast('diagnostico editado')
                setArrayDiagnosticos((prevState)=>prevState.map((diag)=>diag.id==updateDiag.id?updateDiag:diag))
                setDiagnostico(()=>({  id: '',
                    diagnostico: '',
                    observaciones: ''}))
            } else {
                showToast('error al guardar', { background: 'bg-primary-400' })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleSelectDiagEdit = (e) => {
        setDiagnostico(e)
    }

    const handleDeletDiag = async (e) => {
        try {
            const deletFetch = await fetch('/api/pacientes/atencion/diagnostico', {
                method: 'DELETE',
                body: JSON.stringify({
                    id: e
                })
            })
            if (deletFetch.ok) {
                showToast('Diagnostico eliminado')
                setArrayDiagnosticos((prevState)=>prevState.filter((diag)=>diag.id!==e))
            } else {
                showToast('error al borrar', { background: 'bg-primary-400' })
            }
        } catch (error) {
            console.log(error)
        }
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
                    {!diagnostico.id ? <BotonMas onclick={handleAddDiagnostico} /> : <BotonEditar handleClick={()=>handleEdit(diagnostico)} />}
                </div>
            </div>

            <div>
                {arrayDiagnosticos?.map((diag, i) => (
                    <div className={`${diag.id == '' ? 'bg-primary-500/20 animate-pulse' : 'bg-white'} py-1 px-2 rounded-lg text-primary-texto border-gray-200 border flex flex-col gap-2 my-1 shadow-md`}>
                        <div className='text-sm font-semibold tracking-wide flex items-center justify-start gap-2'>
                            <span className="text-xs bg-gray-100 rounded-full border border-gray-800/50 px-1.5 text-center">{i + 1}</span>
                            <p className='flex-1'>{diag.diagnostico}</p>
                            <div className='flex gap-2'>
                                <BotonEditar handleClick={() => handleSelectDiagEdit(diag)} />
                                <BotonEliminar handleClick={() => handleDeletDiag(diag.id)} />
                            </div>
                        </div>
                        <div className='text-sm border-y border-gray-300 py-1'>
                            <p className='break-words'>{diag.observaciones}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
