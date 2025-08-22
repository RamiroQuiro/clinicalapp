import Table from '../../../../components/tablaComponentes/Table';

export default function ConfeccionTablaMedicamentosHistoriaModal({ arrayMedicamentos }) {
  const columns = [
    {
      label: 'Nombre Generico',
      id: 1,
    },
    {
      label: 'Nombre Comercial',
      id: 2,
    },
    {
      label: 'Dosis',
      id: 3,
    },
    {
      label: 'Frecuencia',
      id: 4,
    },
    {
      label: 'Duracion',
      id: 4,
    },
    {
      label: '',
      id: 6,
    },
  ];
  let newArrayMedicamentos = arrayMedicamentos?.map(med => {
    return {
      id: med.id,
      nobmreGenerico: med.nombreGenerico,
      nobmreComercial: med.nombreComercial,
      dosis: med.dosis,
      frecuencia: med.frecuencia,
      duracion: med.duracion,
    };
  });
  return <Table columnas={columns} arrayBody={newArrayMedicamentos} />;
}
