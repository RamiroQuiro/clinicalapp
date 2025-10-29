import { CalendarPlus, Stethoscope, Trash2, User, UserCheck } from 'lucide-react';
import { atencion, dataFormularioContexto } from '../../context/store';
import Button from '../atomos/Button';
import BotonEditar from '../moleculas/BotonEditar';
import BotonEliminar from '../moleculas/BotonEliminar';

//   botonera de acciones
export const RenderActionsPacientes = data => (
  <div className="flex gap-2 pr-5 justify-end items-center text-xs">
    <a
      href={`/dashboard/pacientes/${data.id}`}
      className="flex items-center gap-1 text-xs p-1 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
    >
      <User size={14} />
      <span>Ficha</span>
    </a>
    <a
      href={`/dashboard/agenda`}
      className="flex items-center gap-1 text-xs p-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
    >
      <CalendarPlus size={14} />
      <span>Agendar</span>
    </a>
    <a
      href={`/api/atencion/nueva?pacienteId=${data.id}`}
      className="flex items-center gap-1 text-xs p-1 rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
    >
      <Stethoscope size={14} />
      <span>Atender</span>
    </a>
  </div>
);
export const RenderBotonesUsuarios = data => (
  <div className="flex gap-2 pr-5 justify-end items-center text-xs">
    <a href={`/dashboard/ajustes/usuarios/${data.id}`}>
      <Button variant="blanco" className="px-2 py-1" size={14}>
        <UserCheck size={14} />
        <span>Perfil</span>
      </Button>
    </a>
    <a href={`/api/ajustes/usuarios/eliminar/${data.id}`}>
      <Button variant="blanco" className="px-2 py-1" size={14}>
        <Trash2 size={14} />
        <span>Eliminar</span>
      </Button>
    </a>
  </div>
);

// botoner para acciones de diagnosticos

export const RenderActionsEditDeletDiagnostico = data => {
  const handleEditModal = data => {
    dataFormularioContexto.set(data);
    const modal = document.getElementById('modal-dialogDiagnostico');
    modal.showModal();
    // e.showModal()
  };

  const handleDeletDiag = async ({ id }) => {
    const newDiagnosticos = atencion.get().diagnosticos.filter(diag => diag.id != id);
    atencion.set({
      ...atencion.get(),
      diagnosticos: newDiagnosticos,
    });
  };

  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <BotonEditar handleClick={() => handleEditModal(data)} />
      <BotonEliminar handleClick={() => handleDeletDiag(data)} />
    </div>
  );
};

export const RenderActionsEditDeletMedicamentos = data => {
  const handleEditModal = data => {
    dataFormularioContexto.set(data);
    const modal = document.getElementById(`dialog-modal-medicamentos`);
    modal.showModal();
    // e.showModal()
  };

  const handleDeletMed = async ({ id }) => {
    const newMedicamentos = atencion.get().medicamentos.filter(med => med.id != id);
    atencion.set({
      ...atencion.get(),
      medicamentos: newMedicamentos,
    });
  };

  return (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <BotonEditar handleClick={() => handleEditModal(data)} />
      <BotonEliminar handleClick={() => handleDeletMed(data)} />
    </div>
  );
};
