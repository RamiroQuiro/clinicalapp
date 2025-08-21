import React from 'react';
import { arrayMotivosIniciales } from '../../../../../utils/arrayMotivosIniciales';
import ContenedorFormularioBusqueda from './ContenedorFormularioBusqueda';

interface ContenedorMotivoInicialProps {
  // You might want to pass objUser or specialty as a prop if it's dynamic
}

const ContenedorMotivoInicial: React.FC<ContenedorMotivoInicialProps> = () => {
  // Hardcoding objUser as it was in the Astro component
  const objUser = { especialidad: "cardiologo" };

  const arrayABuscar = arrayMotivosIniciales.find(
    (item) =>
      item.especialidad?.toLowerCase() === objUser.especialidad?.toLowerCase()
  )?.motivos || [];

  return (
    <div
      className="flex gap-2 bg-primary-bg-componentes justify-between items-center text-primary-texto w-full pb-1"
    >
      <h2 className="font-semibold text-base text-primary-textoTitle">
        Motivo Inicial
      </h2>
      <ContenedorFormularioBusqueda arrayABuscar={arrayABuscar} />
    </div>
  );
};

export default ContenedorMotivoInicial;
