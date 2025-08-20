import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import { useEffect, useState } from 'react';
// --- Importaciones de Nanostores ---
import DivReact from '@/components/atomos/DivReact';
import { addTratamiento, consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { useStore } from '@nanostores/react';
import { Trash } from 'lucide-react';

// --- Componentes de UI para el Formulario ---
const Section = ({ title, children }) => (
  <DivReact className=" p">
    <h3 className="text-base font-semibold text-primary-textoTitle border-b border-gray-200 pb-3 mb-2 ">
      {title}
    </h3>
    {children}
  </DivReact>
);

// --- Componente Principal de la Pantalla de Consulta ---

interface ConsultaActualPantallaProps {
  data: any; // Podés tipar más estrictamente según tu backend
}

const initialData = {
  atencionId: '',
  historiaClinicaId: '',
  pacienteId: '',
  motivoConsulta: '',
  sintomas: '',
  tratamiento: {
    fechaInicio: '',
    fechaFin: '',
    tratamiento: '',
  },
  signosVitales: {
    tensionArterial: 0,
    frecuenciaCardiaca: 0,
    frecuenciaRespiratoria: 0,
    temperatura: 0,
    glucosa: 0,
    pulso: 0,
    oxigeno: 0,
    saturacionOxigeno: 0,
    peso: 0,
    talla: 0,
    imc: 0,
  },
  observaciones: '',
  diagnosticos: [],
  medicamentos: [],

  notas: '',
};
export const ConsultaActualPantalla = ({ data }: ConsultaActualPantallaProps) => {
  const $consulta = useStore(consultaStore);

  const [formDataActual, setFormDataActual] = useState(initialData);
  // Inputs temporales para agregar diagnosticos y tratamientos
  const [currentDiagnostico, setCurrentDiagnostico] = useState({
    diagnostico: '',
    observaciones: '',
    codigoCIE: '',
    id: '',
  });
  const [currentMedicamento, setCurrentMedicamento] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
  });

  // Hidratamos la store con datos de la atención si está en curso
  useEffect(() => {
    if (!data || !data.atencion) return;
    setFormDataActual({ ...data.atencion });
    consultaStore.set({ ...data.atencion });
  }, [data]);
  // console.log('estado del store en  consulta actual pantalla', $consulta);
  // Manejo de cambios generales
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConsultaField(name, value);
  };

  const handleFormChangeTratamiento = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const currentTratamiento = consultaStore.get().tratamiento;
    addTratamiento(value, currentTratamiento.fechaInicio, currentTratamiento.fechaFin);
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
    setConsultaField('diagnosticos', [...current, { ...currentDiagnostico }]);
    setCurrentDiagnostico({ diagnostico: '', observaciones: '', codigoCIE: '' });
  };
  const deletDiagnostico = (diagId: string) => {
    const current = consultaStore.get().diagnosticos;
    setConsultaField(
      'diagnosticos',
      current.filter(diag => diag.id !== diagId)
    );
    setCurrentDiagnostico({ diagnostico: '', observaciones: '', codigoCIE: '', id: '' });
  };

  const addMedicamento = () => {
    if (!currentMedicamento.nombre) return;
    const current = consultaStore.get().medicamentos;
    setConsultaField('medicamentos', [...current, currentMedicamento]);
    setCurrentMedicamento({ nombre: '', dosis: '', frecuencia: '' });
  };
  console.log('este es el tratamiento de la tencion', $consulta.tratamiento);
  // Bloqueo de edición si la atención está cerrada
  const isReadOnly = data?.atencion?.estado == 'cerrada';

  return (
    <div className="space-y-2">
      <Section title="Motivo de Consulta">
        <TextArea
          name="motivoConsulta"
          value={$consulta.motivoConsulta}
          onChange={handleFormChange}
          placeholder="Describe el motivo principal de la visita..."
          readOnly={isReadOnly}
        />
      </Section>

      <Section title="Signos Vitales">
        <div className="flex flex-wrap gap-4 items-center w-full justify-around">
          {Object.entries($consulta.signosVitales).map(([key, val]) => (
            <Input
              key={key}
              label={key}
              name={key}
              value={val}
              onChange={handleSignosVitalesChange}
              placeholder={`Ingrese ${key}`}
              readOnly={isReadOnly}
            />
          ))}
        </div>
      </Section>

      <Section title="Síntomas (Anamnesis)">
        <TextArea
          name="sintomas"
          value={$consulta.sintomas}
          onChange={handleFormChange}
          placeholder="Describe los síntomas que reporta el paciente..."
          readOnly={isReadOnly}
        />
      </Section>

      <Section title="Diagnóstico">
        {!isReadOnly && (
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
        )}

        <ul className=" mt-2 space-y-2 flex flex-col">
          {$consulta.diagnosticos.map((diag, idx) => (
            <li
              key={idx}
              className="px-3 py-1 bg-primary-bg-componentes border shadow-sm rounded-md justify-between w-full flex items-center"
            >
              <p className="flex items-center gap-2 ">
                ✅ {diag.diagnostico} {diag.observaciones && `- ${diag.observaciones}`}
              </p>
              <p className="text-xs text-gray-500">{diag.codigoCIE}</p>
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
      <Section title="Plan de Tratamiento">
        <TextArea
          name="tratamiento"
          className="flex-1 w-full"
          value={$consulta.tratamiento.tratamiento}
          onChange={handleFormChangeTratamiento}
          placeholder="Describe el tratamiento propuesto para el paciente..."
          readOnly={isReadOnly}
        />
        <div className="flex items-center mt-2    justify-evenly w-full space-y-2">
          <Input
            label="Inicio de tratamiento"
            type={'date'}
            value={$consulta.tratamiento.fechaInicio}
            name={'fechaInicio'}
            onChange={handleFormChangeTratamiento}
            readOnly={isReadOnly}
          />
          <Input
            label={'Fin de tratamiento'}
            type={'date'}
            value={$consulta.tratamiento.fechaFin}
            name={'fechaFin'}
            onChange={handleFormChangeTratamiento}
            readOnly={isReadOnly}
          />
        </div>
      </Section>
      <Section title="Medicamento">
        {!isReadOnly && (
          <div className="mt-2 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Medicamento"
                name="nombre"
                value={currentMedicamento.nombre}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, nombre: e.target.value })
                }
              />
              <Input
                label="Dosis"
                name="dosis"
                value={currentMedicamento.dosis}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, dosis: e.target.value })
                }
              />
              <Input
                label="Frecuencia"
                name="frecuencia"
                value={currentMedicamento.frecuencia}
                onChange={e =>
                  setCurrentMedicamento({ ...currentMedicamento, frecuencia: e.target.value })
                }
              />
            </div>
            <Button onClick={addMedicamento} variant="secondary">
              Agregar Tratamiento
            </Button>
          </div>
        )}

        <ul className="mt-2 space-y-3">
          {$consulta.medicamentos.map((tr, idx) => (
            <li key={idx} className="p-3 bg-gray-100 rounded-md">
              {`${tr.nombre} (${tr.dosis}) - ${tr.frecuencia}`}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};
