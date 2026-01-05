import { AtencionExistenteV2 } from '@/components/organismo/AtencionExistenteV2';
import { ConsultaActualPantalla } from './ConsultaActualPantalla';
import { HistorialVisitasPantalla } from './HistorialVisitasPantalla';
import { SignosVitalesPantalla } from './SignosVitalesPantalla';
import { SolicitudesPantalla } from './SolicitudesPantalla';

export const RenderizacionPantalla = ({
  activeTab,
  data,
  esFinalizada,
}: {
  activeTab: string;
  data: any;
  esFinalizada: boolean;
}) => {
  // Si la consulta está finalizada y la pestaña es la de la consulta actual,
  // mostramos la vista de solo lectura.
  if (esFinalizada && activeTab === 'consultaActual') {
    return <AtencionExistenteV2 data={data} onClose={() => {}} />;
  }
  // Lógica original para las demás pestañas o si la consulta no está finalizada
  switch (activeTab) {
    case 'consultaActual':
      return <ConsultaActualPantalla data={data} />;
    case 'signos':
      return (
        <SignosVitalesPantalla
          signosVitalesHistorial={data.signosVitalesHistorial}
          paciente={data.paciente}
        />
      );
    case 'solicitudes':
      return <SolicitudesPantalla data={data} />;
    case 'historial':
      return (
        <HistorialVisitasPantalla data={data.historialVisitas} pacienteId={data.paciente.id} />
      );
    default:
      return <ConsultaActualPantalla data={data} />;
  }
};
