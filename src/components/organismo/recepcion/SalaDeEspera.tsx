import { useStore } from '@nanostores/react';
import React from 'react';
import type { AgendaSlot } from '../../../context/agenda.store';
import { recepcionStore } from '../../../context/recepcion.store';

const SalaDeEspera: React.FC = () => {
  const { pacientesEnEspera }: { pacientesEnEspera: AgendaSlot[] } = useStore(recepcionStore);
  console.log(pacientesEnEspera);

  return (
    <div className="p-4">
      <h2 className="text- text-center mt-8">Sala de Espera</h2>
      <ul className="space-y-3">
        {pacientesEnEspera.map((turno, i) => (
          <li key={i} className="bg-white/10 p-4 rounded-lg text- text-lg">
            {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalaDeEspera;
