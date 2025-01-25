import { useStore } from '@nanostores/react';
import { RenderActionsEditDeletMedicamentos } from '../../../../../components/tablaComponentes/RenderBotonesActions';
import Table from '../../../../../components/tablaComponentes/Table';
import { atencion } from '../../../../../context/store';

export default function ConfeccionTablaMedicamentos({}) {
  const $medicamentosStore = useStore(atencion).medicamentos;
  const columns = [
    {
      label: 'Medicamento',
      id: 1,
    },
    {
      label: 'Dosis',
      id: 2,
    },
    {
      label: 'Frecuencia',
      id: 3,
    },
    {
      label: 'Duracion',
      id: 4,
    },
    {
      label: 'Accion',
      id: 5,
    },
  ];

  return (
    <Table
      columnas={columns}
      arrayBody={$medicamentosStore}
      renderBotonActions={RenderActionsEditDeletMedicamentos}
    />
  );
}
