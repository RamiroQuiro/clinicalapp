import Button from '@/components/atomos/Button';
import DivReact from '@/components/atomos/DivReact';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import ContenedorSignosVitales from '@/components/moleculas/ContenedorSignosVitales';
import Section from '@/components/moleculas/Section';
import ModalDictadoIA from '@/components/organismo/ModalDictadoIA';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { dataFormularioContexto } from '@/context/store'; // New import for AI integration
import { getFechaUnix } from '@/utils/timesUtils';
import { useStore } from '@nanostores/react';
import {
  Calculator,
  Droplet,
  HeartPulse,
  Lock,
  Mic,
  Percent,
  Ruler,
  Thermometer,
  Weight,
  Wind,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ContenedorMotivoInicialV2 from '../ContenedorMotivoInicialV2';
import SectionArchivosAtencion from './SectionArchivosAtencion';
import SectionDiagnostico from './SectionDiagnostico';
import SectionMedicamentos from './SectionMedicamentos';
import SectionNotasMedicas from './SectionNotasMedicas';

// --- Configuración de Signos Vitales ---
const vitalSignsConfig = [
  {
    name: 'tensionArterial',
    label: 'Tensión Arterial',
    unit: 'mmHg',
    icon: <HeartPulse size={18} />,
  },
  {
    name: 'frecuenciaCardiaca',
    label: 'Frec. Cardíaca',
    unit: 'lpm',
    icon: <HeartPulse size={18} />,
  },
  {
    name: 'frecuenciaRespiratoria',
    label: 'Frec. Resp.',
    unit: 'rpm',
    icon: <Wind size={18} />,
  },
  {
    name: 'temperatura',
    label: 'Temperatura',
    unit: '°C',
    icon: <Thermometer size={18} />,
  },
  {
    name: 'saturacionOxigeno',
    label: 'Sat. O₂',
    unit: '%',
    icon: <Percent size={18} />,
  },
  {
    name: 'peso',
    label: 'Peso',
    unit: 'kg',
    icon: <Weight size={18} />,
  },
  {
    name: 'talla',
    label: 'Talla',
    unit: 'cm',
    icon: <Ruler size={18} />,
  },
  {
    name: 'imc',
    label: 'IMC',
    unit: 'kg/m²',
    icon: <Calculator size={18} />,
  },
  {
    name: 'glucosa',
    label: 'Glucosa',
    unit: 'mg/dL',
    icon: <Droplet size={18} />,
  },
];

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

  const [isLocked, setIsLocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');

  useEffect(() => {
    if (!data || !data.atencion) return;
    const inicioAtencion = new Date(getFechaUnix() * 1000);

    // Ensure nested objects and arrays exist to prevent runtime errors
    const atencionData = {
      ...data.atencion,
      archivos: data.atencion.archivos || [],
      inicioAtencion: inicioAtencion.toISOString(),
      notas: data.atencion.notas || [],
      diagnosticos: data.atencion.diagnosticos || [],
      medicamentos: data.atencion.medicamentos || [],
      signosVitales: data.atencion.signosVitales || {},
    };

    consultaStore.set(atencionData);

    if (!atencionData.inicioAtencion) {
      setConsultaField('inicioAtencion', new Date().toISOString());
    }

    if (data.signosVitalesHistorial) {
      setSignosVitalesHistorial(data.signosVitalesHistorial);
    }
    if (atencionData.estado === 'finalizada') {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [data]);

  const handleUnlock = () => {
    if (unlockInput === 'modificar') {
      setIsLocked(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultaField(name, value);
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

  const addMedicamento = () => {
    if (!currentMedicamento.nombreGenerico && !currentMedicamento.nombreComercial) return;
    const current = consultaStore.get().medicamentos;
    setConsultaField('medicamentos', [
      ...current,
      { ...currentMedicamento, id: `temp_${Date.now()}` },
    ]);
    setCurrentMedicamento({
      dosis: '',
      frecuencia: '',
      nombreComercial: '',
      nombreGenerico: '',
      id: '',
    });
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

    // --- AI Integration for Diagnostico ---
    if (result.diagnostico && result.diagnostico.nombre) {
      const newDiag = {
        diagnostico: result.diagnostico.nombre,
        observaciones: result.diagnostico.observaciones || '',
        codigoCIE: result.diagnostico.codigoCIE || '',
        id: `ai_diag_${Date.now()}`,
      };
      dataFormularioContexto.set(newDiag); // Set context for FormularioDiagnosticos
      // No need to open modal here, as SectionDiagnostico will handle it
    }

    if (result.medicamentos && Array.isArray(result.medicamentos)) {
      const currentMeds = consultaStore.get().medicamentos;
      const newMeds = result.medicamentos.map((med: any, index: number) => ({
        nombreGenerico: med.nombreGenerico || '',
        nombreComercial: med.nombreComercial || '',
        dosis: med.dosis || '',
        frecuencia: med.frecuencia || '',
        id: `ai_med_${Date.now()}_${index}`,
      }));
      setConsultaField('medicamentos', [...currentMeds, ...newMeds]);
    }

    if (result.tratamiento) {
      setConsultaField('tratamiento', $consulta.tratamiento + '\n' + result.tratamiento);
    }

    if (result.plan_a_seguir) {
      setConsultaField('planSeguir', $consulta.planSeguir + '\n' + result.plan_a_seguir);
    }

    if (result.sintomas) {
      setConsultaField('sintomas', $consulta.sintomas + '\n' + result.sintomas);
    }

    if (result.motivoConsulta) {
      setConsultaField('motivoConsulta', $consulta.motivoConsulta + '\n' + result.motivoConsulta);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 animate-aparecer">
      <ModalDictadoIA
        isOpen={isDictadoModalOpen}
        onClose={() => setIsDictadoModalOpen(false)}
        onProcesado={handleProcesadoIA}
      />

      {isLocked && (
        <div
          className="p-4 mb-4 text-sm text-orange-800 rounded-lg bg-orange-50 border border-orange-300 flex flex-col gap-3"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Consulta Finalizada</h3>
          </div>
          <p>
            Esta consulta ya ha sido marcada como finalizada. Para realizar cambios, debe
            desbloquearla explícitamente.
            <br />
            <strong>Importante:</strong> Cualquier modificación quedará registrada con su usuario y
            la fecha actual para fines de auditoría.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Input
              value={unlockInput}
              onChange={e => setUnlockInput(e.target.value)}
              placeholder="Escriba 'modificar' para habilitar"
              className="max-w-xs"
            />
            <Button onClick={handleUnlock} disabled={unlockInput !== 'modificar'}>
              Desbloquear Formulario
            </Button>
          </div>
        </div>
      )}

      <fieldset
        disabled={isLocked}
        className="flex flex-col w-full min-w-0 gap-2 disabled:opacity-60"
      >
        <DivReact>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              Utiliza el asistente para dictar notas y que la IA rellene los campos automáticamente.
            </p>
            <Button onClick={() => setIsDictadoModalOpen(true)} className="self-start">
              <Mic className="w-5 h-5 " />
              Abrir Asistente de Dictado
            </Button>
          </div>
        </DivReact>
        <Section title="Motivo de Consulta">
          <ContenedorMotivoInicialV2 />
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

        <Section title="Signos Vitales">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {vitalSignsConfig.map(vital => {
              const historyData =
                signosVitalesHistorial.find(h => h.tipo === vital.name)?.historial || [];
              return (
                <ContenedorSignosVitales
                  key={vital.name}
                  name={vital.name}
                  label={vital.label}
                  unit={vital.unit}
                  icon={vital.icon}
                  value={$consulta?.signosVitales[vital?.name]}
                  onChange={handleSignosVitalesChange}
                  history={historyData}
                />
              );
            })}
          </div>
        </Section>

        <Section title="Síntomas (Anamnesis)">
          <TextArea
            name="sintomas"
            value={$consulta.sintomas}
            onChange={handleFormChange}
            placeholder="Describe los síntomas que reporta el paciente..."
          />
        </Section>
        {/* seccion de diagnostico */}
        <SectionDiagnostico $consulta={consultaStore.get()} deletDiagnostico={deletDiagnostico} />

        <SectionMedicamentos $consulta={consultaStore.get()} deletMedicamento={deletMedicamento} />

        <Section title="Tratamiento no farmacologico">
          <TextArea
            name="tratamiento"
            value={$consulta.tratamiento}
            onChange={handleFormChange}
            placeholder="Describe el plan o tratemiento, próximas citas, estudios, etc."
          />
        </Section>

        <Section title="Plan a Seguir">
          <TextArea
            name="planSeguir"
            value={$consulta.planSeguir}
            onChange={handleFormChange}
            placeholder="Describe el plan de tratamiento, próximas citas, estudios, etc."
          />
        </Section>

        <SectionArchivosAtencion $consulta={$consulta} />

        {/* Notas Médicas */}

        <SectionNotasMedicas
          $consulta={$consulta}
          handleFormChange={handleFormChange}
          pacienteId={$consulta.pacienteId}
        />
      </fieldset>
    </div>
  );
};
