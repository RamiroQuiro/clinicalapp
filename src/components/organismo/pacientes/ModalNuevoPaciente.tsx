import ModalReact from '@/components/moleculas/ModalReact';
import React from 'react';
import { FormularioRapicoCargaPaciente } from './FormularioRapicoCargaPaciente';
interface ModalNuevoPacienteProps {
  onPacienteCreado: (paciente: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
  }) => void;
}

export const ModalNuevoPaciente: React.FC<ModalNuevoPacienteProps> = ({ onPacienteCreado }) => {
  const handleCancel = () => {
    const modal = document.getElementById('dialog-modal-modalNuevoPaciente') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  const handlePacienteCreadoAndClose = (paciente: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
  }) => {
    onPacienteCreado(paciente);
    handleCancel(); // Cerrar el modal después de crear el paciente
  };

  return (
    <ModalReact id="modalNuevoPaciente" title="Crear Nuevo Paciente" onClose={handleCancel}>
      <FormularioRapicoCargaPaciente
        onPacienteCreado={handlePacienteCreadoAndClose}
        onCancel={handleCancel}
      />
    </ModalReact>
  );
};
