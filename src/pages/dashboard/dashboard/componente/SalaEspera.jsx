import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { showToast } from '../../../../utils/toast/toastShow';

const socket = io('localhost:5000'); // Cambia el puerto si usas otro

const SalaEspera = ({ user }) => {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPaciente, setNuevoPaciente] = useState({ nombre: '', apellido: '', motivoInicial: '', dni: '', userId: user?.id });


  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevoPaciente((state) => ({
      ...state, [name]: value
    }))
  }
  useEffect(() => {
    // Escucha los cambios en la lista
    socket.on('lista-actualizada', (aregarALista) => {
      setPacientes((prevPacientes) => [...prevPacientes, aregarALista[0]]);
      console.log('esto son los datos recibidos', aregarALista)
    });

    return () => {
      socket.off('lista-actualizada');
    };
  }, []);

  const agregarPaciente = () => {
    if (!nuevoPaciente.motivoConsulta || !nuevoPaciente.dni || !nuevoPaciente.nombre || !nuevoPaciente.apellido) {
      showToast('no hay data para guardar', {
        background: 'bg-primary-400',
      });
      return
    }
    socket.emit('agregar-paciente', nuevoPaciente);
    setNuevoPaciente({ nombre: '', apellido: '', motivoConsulta: '', dni: '',userId: user?.id  }); // Limpia el input
  };
console.log('esta es la lista de poacientes en espera',pacientes)
  return (
    <div className='w-full flex flex-col items-start justify-normal gap-3'>

      {/* formulario */}
      <details className='w-full flex items-start '>
        <summary className='p-1 mb-2 rounded-lg text-left cursor-pointer items-center  text-sm e duration-200 hover:bg-primary-100/20'>
          agregar Pacientes
        </summary>
        <div className='border rounded-lg bg-primary-bg-componentes w-full flex flex-col items-start justify-normal gap-2 py-2 px-2 text-sm'>

          <div className='flex items-center gap-1 justify-between w-full'>


            <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
              name='nombre'
              type="text"
              value={nuevoPaciente.nombre}
              onChange={handleChange}
              placeholder="Nombre"
            />
            <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
              name='apellido'
              type="text"
              value={nuevoPaciente.apellido}
              onChange={handleChange}
              placeholder="Apellido"
            />
          </div>
          <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
            name='motivoConsulta'
            type="text"
            value={nuevoPaciente.motivoConsulta}
            onChange={handleChange}
            placeholder="Motivo de la consulta"
          />
          <input className='w-full py-1.5 px-1 text-primary-textoTitle rounded-lg bg-white border-primary-150 border shadow-sm focus:outline-none'
            name='dni'
            type="number"
            value={nuevoPaciente.dni}
            onChange={handleChange}
            placeholder="Dni"
          />
          <div className='w-full items-center flex justify-end py-2'>
            <button className='bg-primary-100 rounded-lg text-white lowercase px-2 py-1 hover:bg-primary-100/70 duration-300' onClick={agregarPaciente}>Agregar Paciente</button>
          </div>
        </div>
      </details>
      <div className='flex flex-col w-full  items-start 500 justify-between gap-2 bg-primary-bg-componentes p-2 '>
        <div className='flex w-full pri items-start justify-between gap-2 text-sm text-primary-textoTitle'>
          <p className='w-2/4 text-left'>Datos Paciente</p>
          <p className='w-1/5'>N° Turno</p>
          <p className='w-1/5'>accion</p>
        </div>
        <ul className='flex w-full items-start justify-normal gap-2 flex-col'>
          {pacientes.map((paciente, index) => (
            <li className='  w-full border-y items-center shadow-sm justify-normal flex' key={index}>
              <div className='flex-1 flex flex-col items-start justify-normal w-1/2'>
                <h2 className='text-primary-textoTitle '>{paciente.nombre}{' '}{paciente.apellido}</h2>
                <div className='text-sm flex flex-col items-start mt-'>
                  <p>{paciente.motivoConsulta}</p>
                  <p>{paciente.dni}</p>
                </div>
              </div>
              <div className=' flex flex-col items-center mr-2 justify-normal p-1 border font-semibold lowercase border-primary-100 bg-white rounded-lg w-1/5'>
                <p>{index + 1}</p>
              </div>
              <div className=' flex text-sm   items-center justify-center w-1/5 '>
                <button className='text-xs  bg-primary-100 px-2 py-1 rounded-lg text-white'>atender</button>
              </div>

            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SalaEspera;