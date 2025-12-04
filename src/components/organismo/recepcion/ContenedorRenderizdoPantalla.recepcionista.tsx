import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.recepcionista.store';
import AgendaDeRecpcion from './AgendaDeRecpcion';
import ContenedorRecepcionRecepcionista from './ContenedorRecepcionRecepcionista';
import PacientesRecepcion from './PacientesRecepcionista';

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
  }, [user, medicoSeleccionadoId]);

  const renderContent = () => {
    switch (pestanaActiva) {
      case 'recepcion':
        return <ContenedorRecepcionRecepcionista userId={user.id} />;
      case 'agenda':
        return <AgendaDeRecpcion user={user} />;
      case 'pacientes':
        return <PacientesRecepcion />;
      default:
        return <ContenedorRecepcionRecepcionista userId={user.id} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
