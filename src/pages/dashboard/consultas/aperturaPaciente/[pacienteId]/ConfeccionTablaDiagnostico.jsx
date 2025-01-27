import { useStore } from '@nanostores/react';
import { RenderActionsEditDeletDiagnostico } from '../../../../../components/tablaComponentes/RenderBotonesActions';
import Table from '../../../../../components/tablaComponentes/Table';
import { atencion } from '../../../../../context/store';

export default function ConfeccionTablaDiagnostico({ isExistDiagnosticos }) {
  const $diagnosticosStore = useStore(atencion).diagnosticos;
  const columns = [
    {
      label: 'diagnostico',
      id: 1,
    },
    {
      label: 'codigo',
      id: 2,
    },
    {
      label: 'observaciones',
      id: 3,
    },
    {
      label: 'accion',
      id: 4,
    },
  ];

  let newArrayDiagnosticos = $diagnosticosStore?.map(diag => {
    return {
      id: diag.id,
      diagnostico: diag.diagnostico,
      codigoCIE: diag.codigoCIE,
      observaciones: diag.observaciones,
    };
  });
  return (
    <Table
      columnas={columns}
      arrayBody={newArrayDiagnosticos}
      renderBotonActions={RenderActionsEditDeletDiagnostico}
    />
  );
}
