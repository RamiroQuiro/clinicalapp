import Button from '@/components/atomos/Button';
import { TextArea } from '@/components/atomos/TextArea';
import ModalReact from '@/components/moleculas/ModalReact'; // Added for Evolution Modal
import Section from '@/components/moleculas/Section';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { useStore } from '@nanostores/react';
import { ChevronLeft, ChevronRight, FileText, History } from 'lucide-react'; // Added icons
import React, { useEffect, useState } from 'react';

import FormNotaEvolucionClinica from '@/components/organismo/FormNotaEvolucionClinica';
import ContenedorMotivoInicialV2 from '../ContenedorMotivoInicialV2';
import ContenedorDocumentacionAnexos from './ContenedorDocumentacionAnexos';
import ContenedorSintomasDiagnostico from './ContenedorSintomasDiagnostico';
import ContenedorTratamientoPlan from './ContenedorTratamientoPlan';
import { HistorialSidebar } from './HistorialSidebar';
import PercentilesPantallaConsulta from './PercentilesPantallaConsulta';
import SignosVitalesPantallaConsulta from './SignosVitalesPantallaConsulta';

interface ConsultaActualPantallaProps {
  data: any;
}

export const ConsultaActualPantalla = ({ data }: ConsultaActualPantallaProps) => {
  const $consulta = useStore(consultaStore);
  const [signosVitalesHistorial, setSignosVitalesHistorial] = useState([]);
  const [currentMedicamento, setCurrentMedicamento] = useState({
    dosis: '',
    frecuencia: '',
    nombreGenerico: '',
    nombreComercial: '',
    id: '',
  });

  const [isDictadoModalOpen, setIsDictadoModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState($consulta.estado === 'finalizada');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // UI Refinement States
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Collapsed by default as per request

  useEffect(() => {
    if (!data || !data.atencion) return;
    const inicioAtencion = new Date(getFechaEnMilisegundos());

    // Ensure nested objects and arrays exist to prevent runtime errors
    const atencionData = {
      ...data.atencion,
      archivos: data.atencion.archivos || [],
      inicioAtencion: inicioAtencion.toISOString(),
      notas: data.atencion.notas || [],
      diagnosticos: data.atencion.diagnosticos || [],
      medicamentos: data.atencion.medicamentos || [],
      signosVitales: data.atencion.signosVitales || {},

      motivoConsulta: data.atencion.motivoConsulta || '',
    };

    consultaStore.set(atencionData);

    if (!atencionData.inicioAtencion) {
      setConsultaField('inicioAtencion', new Date(getFechaEnMilisegundos()).toISOString());
    }

    if (data.signosVitalesHistorial) {
      setSignosVitalesHistorial(data.signosVitalesHistorial);
    }
  }, [data]);

  useEffect(() => {
    setIsLocked($consulta.estado === 'finalizada');
  }, [$consulta.estado]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultaField(name, value);
  };

  // textoenriquecido con reactquill
  const handleQuillChange = (value: string) => {
    setConsultaField('evolucion', value);
  };

  const handleSignosVitalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const currentSignos = consultaStore.get().signosVitales;
    setConsultaField('signosVitales', {
      ...currentSignos,
      [name]: parseFloat(value) || 0,
    });
  };

  const deletDiagnostico = (diagId: string) => {
    const current = consultaStore.get().diagnosticos;
    setConsultaField(
      'diagnosticos',
      current.filter(diag => diag.id !== diagId)
    );
  };

  const deletMedicamento = (medId: string) => {
    const current = consultaStore.get().medicamentos;
    setConsultaField(
      'medicamentos',
      current.filter(med => med.id !== medId)
    );
  };

  const handleProcesadoIA = (result: any) => {
    console.log('AI Processed Result received in parent:', result);

    if (result.sintomas) setConsultaField('sintomas', result.sintomas);
    if (result.tratamiento) setConsultaField('tratamiento', result.tratamiento);
    if (result.planSeguir) setConsultaField('planSeguir', result.planSeguir);
    if (result.motivoConsulta) setConsultaField('motivoConsulta', result.motivoConsulta);
    if (result.evolucion) setConsultaField('evolucion', result.evolucion);
    if (result.examenFisico) setConsultaField('examenFisico', result.examenFisico);

    if (result.diagnosticos && Array.isArray(result.diagnosticos)) {
      const currentDiags = consultaStore.get().diagnosticos || [];
      const newDiags = result.diagnosticos.map((diag: any, index: number) => ({
        diagnostico: diag.nombre || '',
        observaciones: diag.observaciones || '',
        codigoCIE: diag.codigoCIE || '',
        id: `ai_diag_${Date.now()}_${index}`,
        estado: 'activo',
      }));
      setConsultaField('diagnosticos', [...currentDiags, ...newDiags]);
    }

    if (result.medicamentos && Array.isArray(result.medicamentos)) {
      const currentMeds = consultaStore.get().medicamentos || [];
      const newMeds = result.medicamentos.map((med: any, index: number) => ({
        nombreGenerico: med.nombreGenerico || '',
        nombreComercial: med.nombreComercial || '',
        dosis: med.dosis || '',
        frecuencia: med.frecuencia || '',
        id: `ai_med_${Date.now()}_${index}`,
      }));
      setConsultaField('medicamentos', [...currentMeds, ...newMeds]);
    }

    if (result.signosVitales) {
      const currentSignos = consultaStore.get().signosVitales || {};
      const updatedSignos = { ...currentSignos };
      const mapping = {
        tensionArterial: 'tensionArterial',
        frecuenciaCardiaca: 'frecuenciaCardiaca',
        frecuenciaRespiratoria: 'frecuenciaRespiratoria',
        temperatura: 'temperatura',
        saturacionOxigeno: 'saturacionOxigeno',
      };
      for (const [key, value] of Object.entries(result.signosVitales)) {
        if (value !== null && mapping[key]) updatedSignos[mapping[key]] = value;
      }
      setConsultaField('signosVitales', updatedSignos);
    }
  };

  return (
    <div className="w-full flex lg:flex-row gap-2 animate-aparecer h-[calc(100vh-140px)]">
      {/* Columna izquierda */}
      <div className="flex-1 flex flex-col gap-0 overflow-y-auto pr-2 pb-20">
        {/* <ModalDictadoIA
          isOpen={isDictadoModalOpen}
          onClose={() => setIsDictadoModalOpen(false)}
          onProcesado={handleProcesadoIA}
        /> */}

        <fieldset
          disabled={isLocked}
          className="flex flex-col w-full min-w-0 gap-1 disabled:opacity-60"
        >
          {/* Main Action Bar - Reemplaza el editor visible por default */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700">Texto de la consulta</h3>
              <p className="text-sm text-gray-500">Aquí se registra el texto de la consulta.</p>
            </div>
            <Button onClick={() => setIsEvolutionModalOpen(true)}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Escribir Evolución / Nota (IA)</span>
              </div>
            </Button>
          </div>

          {/* Texto enriquecido Modal */}
          {isEvolutionModalOpen && (
            <ModalReact
              title="Evolución Clínica & Notas"
              id="modal-evolucion"
              onClose={() => setIsEvolutionModalOpen(false)}
              className="w-[90vw] h-[85vh]"
            >
              <div className="p-1">
                <FormNotaEvolucionClinica
                  value={$consulta.evolucion}
                  onChange={handleQuillChange}
                  onProcesadoIA={result => {
                    handleProcesadoIA(result);
                  }}
                  motivoInicial={$consulta.motivoInicial}
                  onMotivoChange={value => setConsultaField('motivoInicial', value)}
                  initialMotivos={data.atencion.listadoMotivos}
                  pacienteId={data.atencion.pacienteId}
                  userId={data.atencion.userIdMedico}
                  atencionId={data.atencion.id}
                />
              </div>
            </ModalReact>
          )}

          <Section title="Motivo de Consulta">
            <ContenedorMotivoInicialV2 initialMotivos={data.atencion.listadoMotivos || []} />
            {$consulta.motivoInicial && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Motivo Inicial Seleccionado:</span>{' '}
                {$consulta.motivoInicial}
              </div>
            )}
            <TextArea
              name="motivoConsulta"
              value={$consulta.motivoConsulta}
              onChange={handleFormChange}
              placeholder="Describe el motivo principal de la visita..."
            />
          </Section>
          {/* Signos Vitales */}
          <SignosVitalesPantallaConsulta
            userId={data.atencion.userIdMedico}
            signosVitalesHistorial={signosVitalesHistorial}
            handleSignosVitalesChange={handleSignosVitalesChange}
          />

          <PercentilesPantallaConsulta $consulta={consultaStore.get()} data={data} />

          {/* seccion diagnosio y sintomas */}

          <ContenedorSintomasDiagnostico
            $consulta={consultaStore.get()}
            consultaStore={consultaStore}
            deletDiagnostico={deletDiagnostico}
            handleFormChange={handleFormChange}
          />

          {/* Sección Tratamiento y Plan */}
          <ContenedorTratamientoPlan
            $consulta={consultaStore.get()}
            consultaStore={consultaStore}
            deletMedicamento={deletMedicamento}
            handleFormChange={handleFormChange}
          />

          <ContenedorDocumentacionAnexos
            $consulta={$consulta}
            handleFormChange={handleFormChange}
            pacienteId={data.pacienteId}
          />
        </fieldset>
      </div>

      {/* Columna derecha: Barra lateral desplegable */}
      <div
        className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out bg-white border-l shadow-sm relative ${isSidebarOpen ? 'w-[350px]' : 'w-[50px]'}`}
      >
        {/* Botón de alternar barra lateral */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-3 top-4 bg-white border border-gray-200 shadow-md rounded-full p-1 text-gray-500 hover:text-indigo-600 z-10"
          title={isSidebarOpen ? 'Ocultar Historial' : 'Ver Historial'}
        >
          {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="h-full overflow-hidden">
          {isSidebarOpen ? (
            <HistorialSidebar data={data} />
          ) : (
            /* Collapsed State Icon Bar */
            <div
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center pt-6 gap-6 cursor-pointer hover:bg-gray-50 h-full"
              title="Expandir Historial"
            >
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <History className="w-6 h-6" />
              </div>
              <div
                className="text-gray-500 font-medium tracking-wide transform rotate-180"
                style={{ writingMode: 'vertical-rl' }}
              >
                HISTORIAL
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
