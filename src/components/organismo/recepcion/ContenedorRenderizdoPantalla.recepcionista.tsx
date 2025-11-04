import Section from '@/components/moleculas/Section';
import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.recepcionista.store';
import Calendario from '../agenda/Calendario';
import HorariosDisponibles from '../agenda/HorariosDisponibles';
import TurnosDelDia from '../agenda/TurnosDelDia';
import PacientesRecepcion from './PacientesRecepcion';
import RecepcionPacientes from './RecepcionPacientes';

type Props = {
  user: User;
};

export default function ContenedorRenderizdoPantallaRecepcionista({ user }: Props) {
  const { pestanaActiva, medicoSeleccionadoId } = useStore(recepcionStore);
  console.log('pestaña activa ->', user);
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
      case 'recepcion':
        return <RecepcionPacientes userId={user.id} />;
      case 'agenda':
        return (
          <div className="w-full flex gap-2 items-start justify-between h-full">
            <Section title="Seleccionar Fecha" className="px- py-4 w-fit">
              <Calendario />
            </Section>

            <Section title="Turnos del Día" className="px- py-4 md:w-[40vw]">
              <TurnosDelDia user={user} />
            </Section>

            <Section title="Horarios Disponibles" className="px- py-4 md:w-[30vw]">
              <HorariosDisponibles />
            </Section>
          </div>
        );
      case 'pacientes':
        return <PacientesRecepcion />;
      default:
        return <RecepcionPacientes userId={user.id} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
