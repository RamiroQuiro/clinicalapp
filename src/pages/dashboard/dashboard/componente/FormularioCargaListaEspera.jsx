import React from 'react';
import InputComponenteJsx from './InputComponenteJsx';
import { MoreVerticalIcon, Newspaper } from 'lucide-react';

const FormularioCargaListaEspera = ({ nuevoPaciente, handleChange, agregarPaciente }) => {
    return (
        <div className=' rounded-lg  w-full flex flex-col items-start justify-normal gap-2 p-2 text-sm'>
            <div className='flex items-center gap-1 justify-between w-full'>
                <InputComponenteJsx
                    value={nuevoPaciente.nombre}
                    handleChange={handleChange}
                    name='nombre'
                    type="text"
                    id='nombre'
                    placeholder="Nombre"
                />
                <InputComponenteJsx
                    value={nuevoPaciente.apellido}
                    handleChange={handleChange}
                    name='apellido'
                    type="text"
                    id='apellido'
                    placeholder="Apellido"
                />
            </div>

            <InputComponenteJsx
                value={nuevoPaciente.dni}
                handleChange={handleChange}
                name='dni'
                type="number"
                id='dni'
                placeholder="DNI"
            />

            <textarea
                className='w-full py-2 px-3 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100/50'
                name='motivoConsulta'
                value={nuevoPaciente.motivoConsulta}
                onChange={handleChange}
                placeholder="Motivo de la consulta"
                rows="3"
            />

            <div className='w-full items-center flex justify-end py-1'>
                <button
                    className='bg-primary-100 rounded-lg text-white px-2 py-1 hover:bg-primary-100/80 transition-colors duration-150 flex items-center gap-2'
                    onClick={agregarPaciente}
                >
                    <Newspaper className='w-4 h-4' />
                    Agregar Paciente
                </button>
            </div>
        </div>
    );
};

export default FormularioCargaListaEspera;
