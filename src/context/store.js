import { atom } from 'nanostores';

const busqueda = atom({
  pacienteSelect: '',
});

const filtroBusqueda = atom({
  filtro: 'todos',
});
const reportPDF = atom({ cabecera: {}, columnas: [], arrayBody: [] });

const columnSelectTable = atom({ asc: true, seleccion: '' });

const atencion = atom({
  dataIds: {
    inicioAtencion: '',
    finAtencion: '',
    isDisable: false, // si es 0 desativado=noEditable , si es 1 activado=editable
    userId: '',
    pacienteId: '',
    atencionId: '',
  },
  tratamiento: '',
  signosVitales: {},
  motivoInicial: 'sin motivo',
  motivoConsulta: '',
  diagnosticos: [],
  medicamentos: [],
});

const dataFormularioContexto = atom({});

const usuarioActivo = atom({});
const statsDashStore = atom({ loading: false, data: null, error: null });

const fetchingDashboard = async userId => {
  console.log('mandando el fetch', userId);
  statsDashStore.set({ loading: true, data: null, error: null }); // Indicar que se está cargando
  try {
    const response = await fetch(`/api/users/dataDash/${userId}`);
    const data = await response.json();
    statsDashStore.set({ loading: false, data: data, error: null }); // Indicar que se está cargando
  } catch (error) {
    console.error(error);
    statsDashStore.set({ loading: false, data: null, error: error }); // Indicar que se está cargando
  }
};

const dashboardStore = atom({
  pacientes: 0,
  atencionesMes: 0,
  atencionesUlt7d: [],
  motivos: [],
  promedioDuracion: null,
  ultimasAtenciones: [],
  atencionesPorDia: [],
});

const pacientePerfilStore = atom({
  loading: true,
  data: null,
  error: null,
});
const fetchPacientePerfil = async pacienteId => {
  try {
    const response = await fetch(`/api/pacientes/historiaClinica/${pacienteId}`);
    const data = await response.json();
    console.log('este es el fetch par el paciente perfil', data);
    pacientePerfilStore.set({
      loading: false,
      data: data,
      error: null,
    });
  } catch (error) {
    console.log(error);
    pacientePerfilStore.set({
      loading: false,
      data: null,
      error: error,
    });
  }
};

export {
  atencion,
  busqueda,
  columnSelectTable,
  dashboardStore,
  dataFormularioContexto,
  fetchingDashboard,
  fetchPacientePerfil,
  filtroBusqueda,
  pacientePerfilStore,
  reportPDF,
  statsDashStore,
  usuarioActivo,
};
