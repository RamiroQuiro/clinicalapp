import Button from '@/components/atomos/Button';
import CardAntecedente from '@/components/moleculas/CardAntecentes';
import ModalReact from '@/components/moleculas/ModalReact';
import Section from '@/components/moleculas/Section';
import FormularioAntecedentes from '@/components/organismo/FormularioAntecedentes';
import React, { useEffect, useState } from 'react';
import type { Antecedente } from '../../types'; // Adjust path as needed

interface AntecedentesPantallaProps {
  data: any; // You might want to define a more specific type for 'data'
  pacienteId: string;
}

export const AntecedentesPantalla: React.FC<AntecedentesPantallaProps> = ({ data, pacienteId }) => {
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
    <Section title="Antecedentes del Paciente" className="animate-pulse">
      <div className="absolute right-4 top-2">
        <Button
          onClick={handleOpenNewAntecedenteModal}
          className=" bg-blue-500 text-white rounded-md hover:bg-blue-600 mx-auto flex items-center justify-center"
        >
          <p>agregar</p>
        </Button>
      </div>
      {isModalOpen && (
        <ModalReact
          title={editingAntecedente ? 'Editar Antecedente' : 'Agregar Antecedente'}
          id="modal-antecedente"
          onClose={() => setIsModalOpen(false)}
        >
          <FormularioAntecedentes
            pacienteId={pacienteId}
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
              <CardAntecedente key={index} data={diag} onEdit={handleEditAntecedente} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};
