import { useStore } from '@nanostores/react';
import React from 'react';
import { recepcionStore } from '../../../context/recepcion.store';

const SalaDeEspera: React.FC = () => {
  const { pacientesEnEspera } = useStore(recepcionStore);

  if (pacientesEnEspera.length === 0) {
    return <p className="text-white text-center mt-8">La sala de espera está vacía.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-white text-center mt-8">Sala de Espera</h2>
      <ul className="space-y-3">
        {pacientesEnEspera.map(paciente => (
          <li key={paciente.id} className="bg-white/10 p-4 rounded-lg text-white text-lg">
            {paciente.paciente.nombre} {paciente.paciente.apellido}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalaDeEspera;
