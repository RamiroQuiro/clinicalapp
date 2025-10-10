import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.store';
import PacientesRecepcion from './PacientesRecepcion';
import RecepcionPacientes from './RecepcionPacientes';
import SalaDeEspera from './SalaDeEspera';

type Props = {
  user: User;
};

export default function ContenedorRenderizdoPantalla({ user }: Props) {
  const { pestanaActiva } = useStore(recepcionStore);

  // 1. La lógica de fetch ahora vive en el contenedor principal
  useEffect(() => {
    const toYYYYMMDD = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0'); // Corregido: no restar 1
      return `${year}-${month}-${day}`;
    };

    const fechaFormateada = toYYYYMMDD(new Date());
    console.log('user de locals', user);
    fetchTurnosDelDia(fechaFormateada, user.id, user.centroMedicoId);
  }, [user]);

  const renderContent = () => {
    switch (pestanaActiva) {
      case 'recepcion':
        return <RecepcionPacientes userId={user.id} />;
      case 'salaDeEspera':
        return <SalaDeEspera />;
      case 'pacientes':
        return <PacientesRecepcion />;
      default:
        return <RecepcionPacientes userId={user.id} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
