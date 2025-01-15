import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Button3 from '../../../../components/atomos/Button3';

const socket = io('http://192.168.1.102:5000'); // Cambia el puerto si usas otro

const SalaEspera = () => {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({nombreApellido:'',motivoInicial:'',obraSocial:''});


  const handleChange=(e)=>{
const {name,value}=e.target
setNuevoPaciente((state)=>({
...state,[name]:value
}))
  }
  useEffect(() => {
    // Escucha los cambios en la lista
    socket.on('lista-actualizada', (paciente) => {
      setPacientes((prevPacientes) => [...prevPacientes, paciente]);
    });

    return () => {
      socket.off('lista-actualizada');
    };
  }, []);

  const agregarPaciente = () => {
    if (nuevoPaciente.trim()) {
      socket.emit('agregar-paciente', nuevoPaciente);
      setNuevoPaciente(''); // Limpia el input
    }
  };

  return (
    <div className='w-full flex flex-col items-start justify-normal gap-3'>
    
    {/* formulario */}
    <details className='w-full flex items-start '>
     <summary className='p-1 mb-2 rounded-lg text-left cursor-pointer items-center  text-sm e duration-200 hover:bg-primary-100/20'>
      agregar Pacientes
     </summary>
     <div className='border rounded-lg bg-primary-bg-componentes w-full flex flex-col items-start justify-normal gap-2 py-2 px-2 text-sm'>
        
        
        <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
        name='nombreApellido'
        type="text"
        value={nuevoPaciente.nombreApellido}
        onChange={handleChange}
        placeholder="Nombre del paciente"
      />
        <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
        name='motivoInicial'
        type="text"
        value={nuevoPaciente.motivoInicial}
        onChange={handleChange}
        placeholder="Motivo de la consulta"
      />
        <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
        name='obraSocial'
        type="text"
        value={nuevoPaciente.obraSocial}
        onChange={handleChange}
        placeholder="Obra Social"
      />
      <div className='w-full items-center flex justify-end py-2'>
        <button className='bg-primary-100 rounded-lg text-white lowercase px-2 py-1 hover:bg-primary-100/70 duration-300' onClick={agregarPaciente}>Agregar Paciente</button>
      </div>
      </div>
    </details>
   
      <ul className='flex w-full items-start justify-normal gap-2 flex-col'>
        {pacientes.map((paciente, index) => (
          <li className='bg-primary-bg-componentes p-2 rounded-lg w-full items-start justify-normal flex' key={index}>
            <div className='flex-1 flex flex-col items-start justify-normal '>
              <h2 className='text-primary-textoTitle '>{paciente}</h2>
              <div className='text-sm flex flex-col items-start mt-'>
                <p>{'motivosIniciales'}</p>
                <p>{'obraSocial'}</p>
              </div>
            </div>
            <div className=' flex flex-col items-center mr-2 justify-normal p-1 border font-semibold lowercase border-primary-100 bg-white rounded-lg'>
              <p>Turno</p>
              <p>2</p>
            </div>
              <div className=' flex text-sm   items-center justify-center '>
                <button className='text-xs  bg-primary-100 px-2 py-1 rounded-lg text-white'>atender</button>
              </div>
          
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalaEspera;
