import React, { useState } from 'react'
import ContenedorAgregarDiagnostico from '../moleculas/ContenedorAgregarDiagnostico'
import BotonMas from '../atomos/BotonMas'
import MedicamentosAgregar from '../moleculas/MedicamentosAgregar'


export default function MedicamentosAtencion() {
    const [medicamento, setMedicamento] = useState({
        medicamento: '',
        dosis: '',
        frecuencia: '',
        duracion: ''

    })
    const [arrayMedicamentos, setArrayMedicamentos] = useState([])

    const handleChange = (e) => {
        setMedicamento({
            ...medicamento,
            [e.target.name]: e.target.value
        })
    }
    const handleAddDiagnostico = (e) => {
        e.preventDefault()
        setArrayMedicamentos(() => [...arrayMedicamentos, medicamento])
        setMedicamento((state) => ({
            medicamento: '',
            dosis: '',
            frecuencia: '',
            duracion: ''

        }))
    }


    return (
        <div className='flex flex-col rounded-lg  px-2 '>

            <div className='flex  w-full  relative gap-1 '>
                <div className='flex flex-col relative items-start w-full  gap-2 justify-between '>

                    <ContenedorAgregarDiagnostico value={medicamento.medicamento} name='medicamento' type={'text'} handleChange={handleChange} >
                        Medicamento
                    </ContenedorAgregarDiagnostico>
                    <div className="flex   items-center justify-normal flex- gap-2">
                        <MedicamentosAgregar name="dosis" label={'Dosis'} handleChange={handleChange} />
                        <MedicamentosAgregar name="frecuencia" label={'Frecuancia'} handleChange={handleChange} />
                        <MedicamentosAgregar name="duracion" label={'Duración'} handleChange={handleChange} />
                    </div>
                </div>
                <div className='mt-6'>
                    <BotonMas onclick={handleAddDiagnostico} />
                </div>
            </div>

            <div>
                {arrayMedicamentos?.map((medicamento, i) => (
                    <div className='bg-white p-2 rounded-lg text-primary-texto border-gray-200 border flex flex-col gap-2 my-2 shadow-md'>
                        <div className='text-sm font-semibold tracking-wide flex items-center justify-start gap-2'>
                            <span>{i + 1}</span>
                            <p >{medicamento.medicamento}</p>
                            <div className='flex gap-2'>
                                <button className='bg-primary-200 text-white rounded-full hover:bg-primary-100  duration-150 px-2 py-1 text-xs'><svg className='w-4 ' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></button>
                                <button className='bg-primary-400 text-white rounded-full px-2 py-1 text-xs hover:bg-primary-error duration-150'>
                                    <svg className='w-4 ' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 6.98996C8.81444 4.87965 15.1856 4.87965 21 6.98996" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M8.00977 5.71997C8.00977 4.6591 8.43119 3.64175 9.18134 2.8916C9.93148 2.14146 10.9489 1.71997 12.0098 1.71997C13.0706 1.71997 14.0881 2.14146 14.8382 2.8916C15.5883 3.64175 16.0098 4.6591 16.0098 5.71997" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12 13V18" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M19 9.98999L18.33 17.99C18.2225 19.071 17.7225 20.0751 16.9246 20.8123C16.1266 21.5494 15.0861 21.9684 14 21.99H10C8.91389 21.9684 7.87336 21.5494 7.07541 20.8123C6.27745 20.0751 5.77745 19.071 5.67001 17.99L5 9.98999" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                                </button>
                            </div>
                        </div>
                        <div className='text-sm border-y border-gray-300 py-2 flex items-center justify-between gap-2 px-2'>
                            <div className='flex gap-2 flex-col items-center justify-center border-l border-gray-300 text-center w-full'>
                                <p className='font-semibold'>Dosis:</p>
                                <p>{medicamento.dosis}</p>
                            </div>
                            <div className='flex gap-2 flex-col items-center justify-center border-l border-gray-300 text-center w-full'>
                                <p className='font-semibold'>Frecuencia:</p>
                                <p>{medicamento.frecuencia}</p>
                            </div>
                            <div className='flex gap-2 flex-col items-center justify-center border-l border-gray-300 text-center w-full'>
                                <p className='font-semibold'>Duración:</p>
                                <p>{medicamento.duracion}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
