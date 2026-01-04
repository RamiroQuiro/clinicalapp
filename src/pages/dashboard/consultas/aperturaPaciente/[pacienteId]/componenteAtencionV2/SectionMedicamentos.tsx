import Button from '@/components/atomos/Button';
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
    <div className=" relative border-y border-gray-200 py-2">
      <div
        className={` text-sm  font-semibold text-primary-textoTitle pb-1  flex items-center justify-between `}
      >
        <h3 className="text-primary-textoTitle my-4">Tratamiento Farmacológico</h3>

        <Button onClick={() => setIsOpenModal(true)}>Agregar Medicamentos</Button>
      </div>

      {isOpenModal && (
        <ModalReact title="Agregar/Editar Medicamento" onClose={() => setIsOpenModal(false)}>
          <FormularioMedicamentos onClose={() => setIsOpenModal(false)} med={currentMedToEdit} />
        </ModalReact>
      )}
      <div className="mt-2 w-full  flex flex-wrap -2 items-stretch gap-2 justify-start h-full">
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
    </div>
  );
}
