import Button from '@/components/atomos/Button';
import CardAntecedente from '@/components/moleculas/CardAntecentes';
import ModalReact from '@/components/moleculas/ModalReact';
import Section from '@/components/moleculas/Section';
import FormularioAntecedentes from '@/components/organismo/FormularioAntecedentes';
import React, { useEffect, useState } from 'react';
import type { Antecedente } from '../../types'; // Adjust path as needed

interface AntecedentesPantallaProps {
  data: any;
  pacienteId: string;
  centroMedicoId: string;
}

export const AntecedentesPantalla: React.FC<AntecedentesPantallaProps> = ({
  data,
  pacienteId,
  centroMedicoId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAntecedente, setEditingAntecedente] = useState<Antecedente | null>(null);
  const [antedecentes, setAntedecentes] = useState({
    personales: [],
    familiares: [],
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    const arrayFamiliar = data.filter((item: any) => item.tipo === 'familiar');
    const arrayPersonal = data.filter((item: any) => item.tipo === 'personal');
    setAntedecentes({
      personales: arrayPersonal,
      familiares: arrayFamiliar,
    });
  }, [data]);

  const handleFormSuccess = () => {
    setIsModalOpen(false); // Close the modal on success
    setEditingAntecedente(null); // Clear editing state
    window.location.reload(); // Reload the page to show updated data
  };

  const handleOpenNewAntecedenteModal = () => {
    setEditingAntecedente(null); // Ensure we are adding a new one
    setIsModalOpen(true);
  };

  const handleEditAntecedente = (antecedente: Antecedente) => {
    setEditingAntecedente(antecedente);
    setIsModalOpen(true);
  };

  return (
    <Section
      title="Antecedentes del Paciente"
      className="relative"
      rightContent={<Button onClick={handleOpenNewAntecedenteModal}>agregar</Button>}
    >
      {isModalOpen && (
        <ModalReact
          title={editingAntecedente ? 'Editar Antecedente' : 'Agregar Antecedente'}
          id="modal-antecedente"
          onClose={() => setIsModalOpen(false)}
        >
          <FormularioAntecedentes
            pacienteId={pacienteId}
            centroMedicoId={centroMedicoId}
            onSuccess={handleFormSuccess}
            initialData={editingAntecedente}
          />
        </ModalReact>
      )}
      <div className="space- flex flex-col gap-y-6 w-full">
        <div>
          <h3 className="text-sm   mb-1.5">Antecedentes Personales</h3>
          <div className="space-y-3">
            {antedecentes?.personales?.map((diag: any, index: number) => (
              <CardAntecedente key={index} data={diag} onEdit={handleEditAntecedente} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm  mb-1.5">Antecedentes Familiares</h3>
          <div className="space-y-3">
            {antedecentes?.familiares?.map((diag: any, index: number) => (
              <CardAntecedente
                key={index}
                data={diag}
                onEdit={handleEditAntecedente}
                setIsOpen={setIsModalOpen}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
