import Button from '@/components/atomos/Button';
import { InfoCard } from '@/components/moleculas/InfoCard'; // New import
import ModalReact from '@/components/moleculas/ModalReact';
import FormularioDiagnosticos from '@/components/organismo/FormularioDiagnosticos';
import { consultaStore } from '@/context/consultaAtencion.store';
import { useState } from 'react';

type Props = {
  $consulta: any;
  deletDiagnostico: any;
};

export default function SectionDiagnostico({ $consulta, deletDiagnostico }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [dataFormulario, setDataFormulario] = useState(null);

  const handleEdit = (diag: any) => {
    setDataFormulario(diag); // Load data into context for editing
    setIsOpenModal(true); // Open the modal
  };

  const handleDelete = (diagId: string) => {
    consultaStore.set({
      ...consultaStore.get(),
      diagnosticos: consultaStore.get().diagnosticos.filter(diag => diag.id !== diagId),
    });
  };

  return (
    <div className="relative my-4 pt-2 border-t border-gray-200">
      <div
        className={` text-sm  font-semibold text-primary-textoTitle pb-1 mb-2 flex items-center justify-between `}
      >
        <h3>Diagnóstico</h3>

        <Button onClick={() => setIsOpenModal(true)}>Agregar Diagnóstico</Button>
      </div>

      {isOpenModal && (
        <ModalReact title="Agregar Diagnóstico" onClose={() => setIsOpenModal(false)}>
          <FormularioDiagnosticos onClose={() => setIsOpenModal(false)} diag={dataFormulario} />
        </ModalReact>
      )}

      <div className="mt-2 w-full   space-y-2">
        {' '}
        {/* Replaces <ul> */}
        {$consulta.diagnosticos?.length > 0 ? (
          $consulta.diagnosticos.map((diag: any) => (
            <InfoCard
              title={diag.diagnostico}
              estado={diag.estado}
              subtitle={diag.codigoCIE ? `CIE: ${diag.codigoCIE}` : undefined}
              bodyText={diag.observaciones}
              onEdit={() => handleEdit(diag)}
              onDelete={() => handleDelete(diag.id)}
              date={new Date().toLocaleDateString()}
            />
          ))
        ) : (
          <p className="font-thin">No hay diagnósticos registrados para esta consulta.</p>
        )}
      </div>
    </div>
  );
}
