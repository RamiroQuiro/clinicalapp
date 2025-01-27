import Table from '../../../../components/tablaComponentes/Table';

export default function ConfeccionTablaDiagnosticoHistoriaModal({ arrayDiagnosticos }) {
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
  ];
  let newArrayDiagnosticos = arrayDiagnosticos?.map(diag => {
    return {
      id: diag.id,
      diagnostico: diag.diagnostico,
      codigoCIE: diag.codigoCIE,
      observaciones: diag.observaciones,
    };
  });
  return <Table columnas={columns} arrayBody={newArrayDiagnosticos} />;
}
