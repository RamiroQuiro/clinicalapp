import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { useStore } from '@nanostores/react';
import { BarChart3, ChevronLeft, ChevronRight, History, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import Section from '@/components/moleculas/Section';
import ContenedorDocumentacionAnexos from './ContenedorDocumentacionAnexos';
import ContenedorFormEvolucino from './ContenedorFormEvolucino';
import ContenedorSintomasDiagnostico from './ContenedorSintomasDiagnostico';
import ContenedorTratamientoPlan from './ContenedorTratamientoPlan';
import { HistorialSidebar } from './HistorialSidebar';
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
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'percentiles' | 'historial'>('historial');

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

    if (data.atencion.signosVitales) {
      setConsultaField('signosVitales', data.atencion.signosVitales);
    }
  }, [data]);

  useEffect(() => {
    setIsLocked($consulta.estado === 'finalizada');
  }, [$consulta.estado]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultaField(name as any, value);
  };

  // textoenriquecido con reactquill
  const handleQuillChange = (value: string) => {
    setConsultaField('evolucion', value);
  };

  const handleSignosVitalesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const currentSignos = consultaStore.get().signosVitales || {};
    const newValue = parseFloat(value) || 0;

    const updatedSignos = {
      ...currentSignos,
      [name]: newValue,
    };

    // --- Cálculo Automático de IMC ---
    if (name === 'peso' || name === 'talla') {
      const p = name === 'peso' ? newValue : updatedSignos.peso;
      const t = name === 'talla' ? newValue : updatedSignos.talla;

      if (p > 0 && t > 0) {
        const alturaMetros = t / 100;
        const imcCalculado = parseFloat((p / (alturaMetros * alturaMetros)).toFixed(2));
        updatedSignos.imc = imcCalculado;
      }
    }

    setConsultaField('signosVitales', updatedSignos);
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
    if (result.motivoInicial) setConsultaField('motivoInicial', result.motivoInicial);
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
        dolor: 'dolor',
        glucosa: 'glucosa',
        respiracion: 'respiracion',
        perimetroAbdominal: 'perimetroAbdominal',
        perimetroCefalico: 'perimetroCefalico',
        presionDiastolica: 'presionDiastolica',
        presionSistolica: 'presionSistolica',
        peso: 'peso',
        talla: 'talla',
        imc: 'imc',
      };
      for (const [key, value] of Object.entries(result.signosVitales)) {
        if (value !== null && mapping[key as keyof typeof mapping]) {
          const mappedKey = mapping[key as keyof typeof mapping];
          (updatedSignos as any)[mappedKey] = value;
        }
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


          {/* Formulario de motivo, evolucion y tratamiento */}
          <ContenedorFormEvolucino
            $consulta={$consulta}
            handleFormChange={handleFormChange}
            handleQuillChange={handleQuillChange}
            handleProcesadoIA={handleProcesadoIA}
            initialMotivos={data.atencion?.listadoMotivos || []}
            pacienteId={data.atencion?.pacienteId}
            userId={data.atencion?.userIdMedico}
            atencionId={data.atencion?.id}
          />
          {/* Signos Vitales */}
          <SignosVitalesPantallaConsulta
            userId={data.atencion.userIdMedico}
            signosVitalesHistorial={signosVitalesHistorial}
            handleSignosVitalesChange={handleSignosVitalesChange}
            isLocked={isLocked}
          />

          {/* opciones de atencion avanzado, ocultos */}
          <Section title="Opciones de Atención Avanzado" isCollapsible defaultOpen={false} icon={Settings}>


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
            /></Section>
        </fieldset>
      </div>

      {/* Columna derecha: Barra lateral desplegable */}
      <div
        className={`flex-shrink-0 h-full transition-all duration-300 ease-in-out bg-white rounded-lg border shadow-sm relative ${isSidebarOpen ? 'w-[420px]' : 'w-[50px]'}`}
      >
        {/* Botón de alternar barra lateral */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-3 top-4 bg-white border border-gray-200 shadow-md rounded-full p-1 text-gray-500 hover:text-indigo-600 z-10"
          title={isSidebarOpen ? `Ocultar ${sidebarActiveTab === 'percentiles' ? 'Percentiles' : 'Historial'}` : 'Abrir Sidebar'}
        >
          {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="h-full overflow-hidden">
          {isSidebarOpen ? (
            <HistorialSidebar
              data={data}
              $consulta={$consulta}
              activeTab={sidebarActiveTab}
              onTabChange={setSidebarActiveTab}
            />
          ) : (
            /* Collapsed State Icon Bar */
            <div className="flex flex-col items-center pt-6 gap-4 h-full">
              <div
                onClick={() => {
                  setSidebarActiveTab('percentiles');
                  setIsSidebarOpen(true);
                }}
                className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors w-full"
                title="Ver Percentiles"
              >
                <div className={`p-2 rounded-lg ${sidebarActiveTab === 'percentiles' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div
                  className="text-gray-500 font-medium tracking-wide transform rotate-180 text-xs"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  PERC.
                </div>
              </div>
              <div
                onClick={() => {
                  setSidebarActiveTab('historial');
                  setIsSidebarOpen(true);
                }}
                className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors w-full"
                title="Ver Historial"
              >
                <div className={`p-2 rounded-lg ${sidebarActiveTab === 'historial' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>
                  <History className="w-6 h-6" />
                </div>
                <div
                  className="text-gray-500 font-medium tracking-wide transform rotate-180 text-xs"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  HIST.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
