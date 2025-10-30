import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.recepcionista.store';
import Calendario from '../agenda/Calendario';
import HorariosDisponibles from '../agenda/HorariosDisponibles';
import PacientesRecepcion from './PacientesRecepcion';
import RecepcionPacientes from './RecepcionPacientes';
import SalaDeEspera from './SalaDeEspera';

type Props = {
  user: User;
};

export default function ContenedorRenderizdoPantallaRecepcionista({ user }: Props) {
  const { pestanaActiva, medicoSeleccionadoId } = useStore(recepcionStore);

  useEffect(() => {
    const toYYYYMMDD = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fechaFormateada = toYYYYMMDD(new Date());
    // La función ahora obtiene el medicoId desde el store
    fetchTurnosDelDia(fechaFormateada, user.centroMedicoId);
  }, [user, medicoSeleccionadoId]); // Se añade medicoSeleccionadoId a las dependencias

  const renderContent = () => {
    switch (pestanaActiva) {
      case 'agendaDelDia':
        return <RecepcionPacientes userId={user.id} />;
      case 'salaDeEspera':
        return <SalaDeEspera />;
      case 'agendaSemanal':
        return (
          <div className="w-full flex gap-2 items-start justify-between h-full">
            <Calendario />
            <HorariosDisponibles />
          </div>
        );
      case 'pacientes':
        return <PacientesRecepcion />;
      default:
        return <SalaDeEspera />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
