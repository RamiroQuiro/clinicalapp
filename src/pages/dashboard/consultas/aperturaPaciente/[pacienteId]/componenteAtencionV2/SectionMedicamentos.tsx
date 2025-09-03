import Button from '@/components/atomos/Button';
import DivReact from '@/components/atomos/DivReact';
import { InfoCard } from '@/components/moleculas/InfoCard';
import ModalReact from '@/components/moleculas/ModalReact';
import FormularioMedicamentos from '@/components/organismo/FormularioMedicamentos';
import { useState } from 'react';

type Props = {
  $consulta: any;
  deletMedicamento: any;
};

export default function SectionMedicamentos({ $consulta, deletMedicamento }: Props) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [currentMedToEdit, setCurrentMedToEdit] = useState<any | null>(null);

  const handleAddMedicamento = () => {
    setCurrentMedToEdit(null); // Clear for new entry
    setIsOpenModal(true);
  };

  const handleEditMedicamento = (med: any) => {
    setCurrentMedToEdit(med); // Set medication for editing
    setIsOpenModal(true);
  };

  return (
    <DivReact className=" relative">
      <div
        className={` text-base font-semibold text-primary-textoTitle border-b  border-gray-200 pb-1 mb-2 flex items-center justify-between `}
      >
        <h3>Tratamiento Farmacológico</h3>
      </div>

      <Button onClick={() => setIsOpenModal(true)}>Agregar Medicamentos</Button>

      {isOpenModal && (
        <ModalReact title="Agregar/Editar Medicamento" onClose={() => setIsOpenModal(false)}>
          <FormularioMedicamentos onClose={() => setIsOpenModal(false)} med={currentMedToEdit} />
        </ModalReact>
      )}
      <div className="mt-2 w-full  flex flex-col space-y-2">
        {$consulta.medicamentos?.length > 0 ? (
          $consulta.medicamentos.map((med: any) => (
            <InfoCard
              key={med.id}
              title={med.nombreComercial || med.nombreGenerico}
              subtitle={
                med.nombreComercial && med.nombreGenerico ? `(${med.nombreGenerico})` : undefined
              }
              bodyText={`Dosis: ${med.dosis || 'N/A'}, Frecuencia: ${med.frecuencia || 'N/A'}`}
              onEdit={() => handleEditMedicamento(med)}
              onDelete={() => deletMedicamento(med.id)}
              date={new Date().toLocaleDateString()}
              estado="activo"
            />
          ))
        ) : (
          <p className="font-thin">No hay medicamentos registrados para esta consulta.</p>
        )}
      </div>
    </DivReact>
  );
}
