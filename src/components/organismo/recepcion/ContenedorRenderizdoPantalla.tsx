import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { recepcionStore } from '../../../context/recepcion.store';
import PacientesRecepcion from './PacientesRecepcion';
import RecepcionPacientes from './RecepcionPacientes';
import SalaDeEspera from './SalaDeEspera';

type Props = {
  userId: string;
};

export default function ContenedorRenderizdoPantalla({ userId }: Props) {
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
    const fetchAgenda = async () => {
      try {
        const response = await fetch(
          `/api/agenda?fecha=${fechaFormateada}&profesionalId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 2. Guardamos los datos en el store global
        recepcionStore.setKey('turnosDelDia', data.data);
        recepcionStore.setKey('isLoading', false);
      } catch (error) {
        console.error('Error al obtener la agenda:', error);
        recepcionStore.setKey('error', error.message);
        recepcionStore.setKey('isLoading', false);
      }
    };

    fetchAgenda();
  }, [userId]);

  const renderContent = () => {
    switch (pestanaActiva) {
      case 'recepcion':
        return <RecepcionPacientes userId={userId} />;
      case 'salaDeEspera':
        return <SalaDeEspera />;
      case 'pacientes':
        return <PacientesRecepcion />;
      default:
        return <RecepcionPacientes userId={userId} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
