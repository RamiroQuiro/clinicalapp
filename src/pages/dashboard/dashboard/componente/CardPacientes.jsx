import React from 'react';
import { UserPlus, UserCog, XCircle } from 'lucide-react';

export default function CardPacientes({ paciente, index,handleDelete,handleAtender }) {
  return (
    <li className='w-full border-y py-2 px-3 items-center shadow-sm justify-between bg-white flex hover:bg-gray-50 transition-colors duration-150' key={index}>
      <div className='flex flex-col items-start justify-normal w-3/5'>
        <h2 className='text-primary-textoTitle font-medium'>{paciente.nombre} {paciente.apellido}</h2>
        <div className='text-xs flex flex-col items-start text-gray-600'>
          <p className='text-sm'>{paciente.motivoConsulta}</p>
          <p className='text-gray-500'>DNI: {paciente.dni}</p>
        </div>
      </div>
      
      <span className="inline-block px-3 py-1 bg-primary-100 text-white rounded-full text-sm">
       #{index + 1}
        {/* <span className='text-[10px] text-primary-100/80 uppercase'>{paciente.estado || 'En espera'}</span> */}
      </span>
      
      {/* botonera de acciones */}
      <div className='flex text-sm items-center justify-end gap-2 w-1/5 relative'>
      {/* boton de atender o de registar  atender */}
        {paciente.isExist ? (
          <div className='relative group'>
            <button 
   onClick={()=>handleAtender(paciente.id)}
              className='text-xs bg-primary-100 p-1.5 rounded-lg text-white hover:bg-primary-100/80 transition-colors duration-150'
            >
              <UserCog className="w-4 h-4" />
            </button>
           
              <div className="absolute  hidden group-hover:flex  -top-8 left-1/2 animate-aparecer -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                Atender paciente
              </div>
         
          </div>
        ) : (
          <div className='relative group'>
            <button 
            onClick={()=>handleAtender(paciente.id)}
              className='text-xs bg-primary-100 p-1.5 rounded-lg text-white hover:bg-primary-100/80 transition-colors duration-150'
            >
              <UserPlus className="w-4 h-4" />
            </button>
              <div className="absolute hidden group-hover:flex -top-8 left-1/2 animate-aparecer  -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                Registrar y atender
              </div>
          </div>
        )}
        {/* boton de eliminar */}
        <div className='relative group'>
          <button 
          onClick={()=>handleDelete(paciente.id)}
            className='text-xs bg-primary-400 p-1.5 rounded-lg text-white hover:bg-primary-400/80 transition-colors duration-150'
          >
            <XCircle className="w-4 h-4" />
          </button>
        
            <div className="absolute hidden group-hover:flex -top-8 left-1/2  animate-aparecer  -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
              Cancelar turno
            </div>
        </div>
      </div>
    </li>
  );
}
