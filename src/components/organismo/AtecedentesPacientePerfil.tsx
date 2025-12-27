// src/components/organismo/Antecedentes.tsx
import CardAntecedentes from '@/components/moleculas/CardAntecentes';
import type { Antecedente } from '@/types';
import { useState } from 'react';
import Button from '../atomos/Button';
import ModalReact from '../moleculas/ModalReact';
import FormularioAntecedentes from './FormularioAntecedentes';

interface AtecedentesPacientePerfilProps {
  antecedentes: Antecedente[];
  pacienteId: string;
  centroMedicoId: string; // New required prop
}

export default function AtecedentesPacientePerfil({
  antecedentes = [],
  pacienteId,
  centroMedicoId,
}: AtecedentesPacientePerfilProps) {
  const [antecedenteEditando, setAntecedenteEditando] = useState<Antecedente | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditAntecedente = (antecedente: Antecedente) => {
    setAntecedenteEditando(antecedente);
    setIsModalOpen(true);
  };

  const handleAgregar = () => {
    setAntecedenteEditando(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 w-full">
      <div>
        <div className="flex border-b pb-2 justify-between items-center text-primary-texto w-full mb-2">
          <h3 className="text-lg font-semibold text-primary-textoTitle mb-1.5">
            Antecedentes Personales
          </h3>
          <Button onClick={() => handleAgregar()}>agregar</Button>
        </div>
        <div className="space-y-3">
          {antecedentes
            .filter(antecedente => antecedente.tipo === 'personal')
            .map((antecedente, index) => (
              <CardAntecedentes
                key={index}
                data={antecedente}
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onEdit={handleEditAntecedente}
              />
            ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-primary-textoTitle mb-1.5">
          Antecedentes Familiares
        </h3>
        <div className="space-y-3">
          {antecedentes
            .filter(antecedente => antecedente.tipo === 'familiar')
            .map((antecedente, index) => (
              <CardAntecedentes
                key={index}
                data={antecedente}
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                onEdit={handleEditAntecedente}
              />
            ))}
        </div>
      </div>
      {/* Modal de edición */}
      {isModalOpen && (
        <ModalReact
          title={antecedenteEditando ? 'Editar Antecedente' : 'Agregar Antecedente'}
          id="modal-antecedente"
          onClose={() => setIsModalOpen(false)}
        >
          <FormularioAntecedentes
            pacienteId={pacienteId}
            centroMedicoId={centroMedicoId}
            initialData={antecedenteEditando}
            onSuccess={() => setIsModalOpen(false)}
          />
        </ModalReact>
      )}
    </div>
  );
}
