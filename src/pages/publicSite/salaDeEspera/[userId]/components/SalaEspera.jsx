import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('localhost:5000'); // Cambia el puerto si usas otro

export default function SalaEspera() {
 
   const [pacientes, setPacientes] = useState([]);
   const [nuevoPaciente, setNuevoPaciente] = useState('');
 
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
     <div className='text-primary-texto flex items-center justify-normal w-full'>
       <h2>Lista de Espera</h2>
       <ul>
         {pacientes.map((paciente, index) => (
           <li key={index}>{paciente}</li>
         ))}
       </ul>
       <input
         type="text"
         value={nuevoPaciente}
         onChange={(e) => setNuevoPaciente(e.target.value)}
         placeholder="Nombre del paciente"
       />
       <button onClick={agregarPaciente}>Agregar Paciente</button>
     </div>
   );
}
