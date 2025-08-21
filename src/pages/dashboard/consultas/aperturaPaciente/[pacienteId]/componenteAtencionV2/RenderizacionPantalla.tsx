import { AntecedentesPantalla } from './AntecedentesPantalla';
import { ConsultaActualPantalla } from './ConsultaActualPantalla';
import { DiagnosticosPantalla } from './DiagnosticosPantalla';
import { HistorialVisitasPantalla } from './HistorialVisitasPantalla';
import { MedicamentosPantalla } from './MedicamentosPantalla';
import { SignosVitalesPantalla } from './SignosVitalesPantalla';

export const RenderizacionPantalla = ({ activeTab, data }: { activeTab: string; data: any }) => {
  console.log('renderizacion de la pagina', data);
  switch (activeTab) {
    case 'motivo':
      return <ConsultaActualPantalla data={data} />;
    case 'antecedentes':
      return <AntecedentesPantalla data={data.antecedentes} pacienteId={data.paciente.id} />;
    case 'signos':
      return <SignosVitalesPantalla signosVitalesHistorial={data.signosVitalesHistorial} />;
    case 'diagnostico':
      return <DiagnosticosPantalla data={data} />;
    case 'medicamentos':
      return <MedicamentosPantalla data={data} />;
    case 'historial':
      return <HistorialVisitasPantalla data={data.historialVisitas} />;
    default:
      return <ConsultaActualPantalla data={data} />;
  }
};
