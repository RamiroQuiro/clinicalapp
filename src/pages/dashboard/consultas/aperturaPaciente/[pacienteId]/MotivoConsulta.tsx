import React, { useEffect, useState } from 'react';
import { atencion } from '../../../../../context/store';
import ContenedorMotivoInicial from './ContenedorMotivoInicial';

interface MotivoConsultaProps {
  isExistHC: any; // Assuming this is the initial value for motivoConsulta
  dataIds: any; // Assuming this is needed for Nanostores
}

const MotivoConsulta: React.FC<MotivoConsultaProps> = ({ isExistHC, dataIds }) => {
  const [motivoConsulta, setMotivoConsulta] = useState(isExistHC?.motivoConsulta || '');

  useEffect(() => {
    // Update Nanostores when dataIds or motivoConsulta changes
    atencion.set({
      ...atencion.get(),
      dataIds: dataIds,
      motivoConsulta: motivoConsulta,
    });
  }, [dataIds, motivoConsulta]);

  const handleMotivoConsultaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMotivoConsulta(e.target.value);
  };

  return (
    <div
      id="contenedorAtencionMotivoConsulta"
      className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4"
    >
      <div className="flex justify-between items-center p-2 border-b bg-primary-bg-componentes flex-shrink-0">
        <h3 className="text-xl font-semibold text-gray-800">Motivo de Consulta</h3>
        {/* Assuming a save button would go here, similar to ContenedorAtencion */}
        <button
          id="guardarMotivo"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Guardar
        </button>
      </div>

      {/* Contenedor de motivo inicial */}
      <ContenedorMotivoInicial />

      {/* Contenedor de motivo de consulta */}
      <div className="flex flex-col gap-2 w-full">
        <h2 className="font-semibold text-base text-primary-textoTitle">Motivo de consulta</h2>
        <form
          action=""
          className="flex-1 w-full h-full flex items-start justify-center"
          id="motivoConsultaForm"
        >
          <textarea
            className="w-full text-sm p-2 text-primary-texto outline-none ring-0 border border-gray-300 rounded"
            rows={10}
            name="motivoConsulta"
            id="formularioConsulta"
            placeholder="Motivo de consulta y síntomas..."
            value={motivoConsulta}
            onChange={handleMotivoConsultaChange}
          ></textarea>
        </form>
        <span
          id="notificacion"
          className="text-xs font-extralight tracking-wider px-2 animate-aparecer"
        ></span>
      </div>
    </div>
  );
};

export default MotivoConsulta;
