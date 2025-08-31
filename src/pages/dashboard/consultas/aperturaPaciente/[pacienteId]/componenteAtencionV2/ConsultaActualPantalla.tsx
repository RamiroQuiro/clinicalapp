import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import ContenedorSignosVitales from '@/components/moleculas/ContenedorSignosVitales';
import Section from '@/components/moleculas/Section';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { useStore } from '@nanostores/react';
import {
  Calculator,
  Droplet,
  HeartPulse,
  Lock,
  Percent,
  Ruler,
  Thermometer,
  Trash,
  Weight,
  Wind,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ContenedorMotivoInicialV2 from '../ContenedorMotivoInicialV2';

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
  data: any; // Podés tipar más estrictamente según tu backend
}

export const ConsultaActualPantalla = ({ data }: ConsultaActualPantallaProps) => {
  const $consulta = useStore(consultaStore);

  const [signosVitalesHistorial, setSignosVitalesHistorial] = useState([]);
  const [currentDiagnostico, setCurrentDiagnostico] = useState({
    diagnostico: '',
    observaciones: '',
    codigoCIE: '',
    id: '',
  });
  const [currentMedicamento, setCurrentMedicamento] = useState({
    dosis: '',
    frecuencia: '',
    nombreGenerico: '',
    nombreComercial: '',
    id: '',
  });

  // --- NUEVO: Lógica de bloqueo de la consulta ---
  const [isLocked, setIsLocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');

  useEffect(() => {
    if (!data || !data.atencion) return;
    // Hidratamos la store con datos de la atención si está en curso
    consultaStore.set({ ...data.atencion });

    // NUEVO: Establecer inicioConsulta si no está ya definido
    // Esto asegura que se registre el momento en que se abre la consulta
    if (!data.atencion.inicioConsulta) {
      setConsultaField('inicioConsulta', new Date().toISOString());
    }

    // Guardamos el historial de signos vitales en un estado local
    if (data.signosVitalesHistorial) {
      setSignosVitalesHistorial(data.signosVitalesHistorial);
    }
    // Establecer el estado de bloqueo inicial
    if (data.atencion.estado === 'finalizada') {
      setIsLocked(true);
    } else {
      setIsLocked(false);
    }
  }, [data]);

  const handleUnlock = () => {
    if (unlockInput === 'modificar') {
      setIsLocked(false);
      // Aquí se podría emitir un evento o log para auditoría si fuera necesario
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

  const addDiagnostico = () => {
    if (!currentDiagnostico.diagnostico) return;
    const current = consultaStore.get().diagnosticos;
    setConsultaField('diagnosticos', [
      ...current,
      { ...currentDiagnostico, id: `temp_${Date.now()}` },
    ]);
    setCurrentDiagnostico({ diagnostico: '', observaciones: '', codigoCIE: '', id: '' });
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

  return (
    <div className="w-full flex flex-col gap-2 animate-aparecer">
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

      <fieldset disabled={isLocked} className="flex flex-col gap-2 disabled:opacity-60">
        <Section title="Motivo de Consulta">
          {/* Contenedor de motivo inicial */}
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
              // Buscamos el historial para este signo vital específico
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
        <div className="flex justify-between gap-2">
          {/* <Section title="Diagnostico presuntivo">
            <div className="mt-2 space-y-2">
              <TextArea
                rows={10}
                name="diagnosticoPresuntivo"
                value={$consulta.diagnosticoPresuntivo}
                onChange={handleFormChange}
                placeholder="Escribe el diagnostico presuntivo"
              />
            </div>
          </Section> */}
          <Section title="Diagnóstico">
            <div className="space-y-4">
              <Input
                label="Nombre del Diagnóstico"
                name="diagnostico"
                value={currentDiagnostico.diagnostico}
                onChange={e =>
                  setCurrentDiagnostico({ ...currentDiagnostico, diagnostico: e.target.value })
                }
                placeholder="Ej: Faringitis aguda"
              />
              <TextArea
                label="Observaciones"
                name="observaciones"
                value={currentDiagnostico.observaciones}
                onChange={e =>
                  setCurrentDiagnostico({ ...currentDiagnostico, observaciones: e.target.value })
                }
                placeholder="Detalles adicionales del diagnóstico..."
                rows={2}
              />
              <Input
                label="Código CIE"
                name="codigoCIE"
                value={currentDiagnostico.codigoCIE}
                onChange={e =>
                  setCurrentDiagnostico({ ...currentDiagnostico, codigoCIE: e.target.value })
                }
                placeholder="Código CIE"
              />
              <Button onClick={addDiagnostico} variant="secondary">
                Agregar Diagnóstico
              </Button>
            </div>

            <ul className=" mt-2 space-y-2 flex flex-col">
              {$consulta.diagnosticos.map(diag => (
                <li
                  key={diag.id}
                  className="px-3 py-1 hover:bg-primary-bg-componentes border shadow-sm rounded-md justify-between w-full flex items-center"
                >
                  <div className="flex items-center justify-start gap-4">
                    <p className="flex items-center gap-2 ">
                      🤕 {diag.diagnostico} {diag.observaciones && `- ${diag.observaciones}`}
                    </p>
                    <p className="">{diag.codigoCIE}</p>
                  </div>
                  <button
                    title="Eliminar Diagnóstico"
                    className="text-red-500 border p-1  rounded-lg hover:bg-red-500 hover:text-white duration-150"
                    onClick={() => deletDiagnostico(diag.id)}
                  >
                    <Trash />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        </div>
        <Section title="Tratamiento Farmacologico">
          <div className="flex justify-between gap-2">
            <div className="flex justify-evenly w-full  items-center gap-2">
              <Input
                label="Nombre Generico"
                className="w-full"
                name="nombreGenerico"
                value={currentMedicamento.nombreGenerico}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, nombreGenerico: e.target.value })
                }
              />
              <Input
                label="Nombre Comercial"
                className="w-full"
                name="nombreComercial"
                value={currentMedicamento.nombreComercial}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, nombreComercial: e.target.value })
                }
              />
              <Input
                label="Dosis"
                className="w-full"
                name="dosis"
                value={currentMedicamento.dosis}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, dosis: e.target.value })
                }
              />
              <Input
                label="Frecuencia"
                className="w-full"
                name="frecuencia"
                value={currentMedicamento.frecuencia}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, frecuencia: e.target.value })
                }
              />
              <Button onClick={addMedicamento} variant="secondary">
                Agregar Medicamento
              </Button>
            </div>
          </div>

          <ul className="mt-2 space-y-3">
            {$consulta.medicamentos?.map(med => (
              <li
                key={med.id}
                className="px-3 py-1 hover:bg-primary-bg-componentes border shadow-sm rounded-md justify-between w-full flex items-center"
              >
                <div className="flex items-center justify-start gap-4">
                  <p className="flex items-center gap-2 ">
                    💊 {med.nombreComercial} - {med.nombreGenerico} {med.dosis && `- ${med.dosis}`}
                  </p>
                  <p className="text-">{med.frecuencia}</p>
                </div>

                <button
                  title="Eliminar Medicamento"
                  className="text-red-500 border p-1  rounded-lg hover:bg-red-500 hover:text-white duration-150"
                  onClick={() => deletMedicamento(med.id)}
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ul>
        </Section>

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
      </fieldset>
    </div>
  );
};
