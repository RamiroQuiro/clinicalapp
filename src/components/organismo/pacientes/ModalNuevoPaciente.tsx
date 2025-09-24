import Modal from '@/components/moleculas/Modal.astro';
import React from 'react';
import { FormularioNuevoPaciente } from './FormularioNuevoPaciente';

interface ModalNuevoPacienteProps {
  onPacienteCreado: (paciente: { id: string; nombre: string; apellido: string; dni: string }) => void;
}

export const ModalNuevoPaciente: React.FC<ModalNuevoPacienteProps> = ({ onPacienteCreado }) => {
  const handleCancel = () => {
    const modal = document.getElementById('dialog-modal-modalNuevoPaciente') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  const handlePacienteCreadoAndClose = (paciente: { id: string; nombre: string; apellido: string; dni: string }) => {
    onPacienteCreado(paciente);
    handleCancel(); // Cerrar el modal después de crear el paciente
  };

  return (
    <Modal id="modalNuevoPaciente" title="Crear Nuevo Paciente">
      <FormularioNuevoPaciente
        onPacienteCreado={handlePacienteCreadoAndClose}
        onCancel={handleCancel}
      />
    </Modal>
  );
};
