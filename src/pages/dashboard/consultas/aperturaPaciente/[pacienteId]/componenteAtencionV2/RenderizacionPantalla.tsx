import { AntecedentesPantalla } from './AntecedentesPantalla';
import { ConsultaActualPantalla } from './ConsultaActualPantalla';
import { DiagnosticosPantalla } from './DiagnosticosPantalla';
import { HistorialVisitasPantalla } from './HistorialVisitasPantalla';
import { MedicamentosPantalla } from './MedicamentosPantalla';
import { SignosVitalesPantalla } from './SignosVitalesPantalla';

export const RenderizacionPantalla = ({ activeTab, data }: { activeTab: string; data: any }) => {
  console.log('renderizacion de la pagina', data);
  switch (activeTab) {
    case 'consultaActual':
      return <ConsultaActualPantalla data={data} />;
    case 'antecedentes':
      return <AntecedentesPantalla data={data.antecedentes} pacienteId={data.paciente.id} />;
    case 'signos':
      return <SignosVitalesPantalla signosVitalesHistorial={data.signosVitalesHistorial} />;
    case 'diagnostico':
      return <DiagnosticosPantalla data={data} />;
    case 'medicamentos':
      return <MedicamentosPantalla data={data} pacienteId={data.paciente.id} />;
    case 'historial':
      return (
        <HistorialVisitasPantalla data={data.historialVisitas} pacienteId={data.paciente.id} />
      );
    default:
      return <ConsultaActualPantalla data={data} />;
  }
};
