import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.store';
import ContenedorRecepcionProfesional from './ContenedorRecepcionProfesional';

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
    console.log('fechaFormateada', fechaFormateada);
    fetchTurnosDelDia(fechaFormateada, user.id, user.centroMedicoId);
  }, [user]);

  // a diferencia del perfil recepcionista, aqui tendremos solo la recepcion, siendo la agenda y los pacientes en su respectiva seccion
  const renderContent = () => {
    switch (pestanaActiva) {
      case 'recepcion':
        return <ContenedorRecepcionProfesional userId={user.id} />;

      default:
        return <ContenedorRecepcionProfesional userId={user.id} />;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
}
