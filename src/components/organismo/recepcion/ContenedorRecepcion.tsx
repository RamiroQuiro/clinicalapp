import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { useStore } from '@nanostores/react';
import React, { useEffect } from 'react';
import { fetchTurnosDelDia, recepcionStore } from '../../../context/recepcion.store';
import MenuPestaña from './MenuPestaña';
import SalaDeEspera from './SalaDeEspera';

const ContenedorRecepcion: React.FC = () => {
  const { pestanaActiva } = useStore(recepcionStore);

  useEffect(() => {
    const hoy = new Date(getFechaEnMilisegundos()).toISOString().split('T')[0];
    fetchTurnosDelDia(hoy);
  }, []);

  const renderContent = () => {
    switch (pestanaActiva) {
      case 'salaDeEspera':
        return <SalaDeEspera />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <MenuPestaña />
      <div className="flex-grow overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default ContenedorRecepcion;
