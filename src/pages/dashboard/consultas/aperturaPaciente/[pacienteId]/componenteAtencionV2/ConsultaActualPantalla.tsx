import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import { useState } from 'react';

// --- Componentes de UI para el Formulario ---
const Section = ({ title, children }) => (
  <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
      {title}
    </h3>
    {children}
  </div>
);

// --- Componente Principal de la Pantalla de Consulta ---
export const ConsultaActualPantalla = ({ data }) => {
  const [formData, setFormData] = useState({
    motivoConsulta: data.motivoConsultaData?.motivo || '',
    sintomas: '',
    signosVitales: {
      presionArterial: data.signosVitalesData?.presionArterial || '',
      frecuenciaCardiaca: data.signosVitalesData?.frecuenciaCardiaca || '',
      frecuenciaRespiratoria: data.signosVitalesData?.frecuenciaRespiratoria || '',
      temperatura: data.signosVitalesData?.temperatura || '',
    },
    diagnosticos: [],
    tratamientos: [],
  });

  const [currentDiagnostico, setCurrentDiagnostico] = useState({ nombre: '', observacion: '' });
  const [currentTratamiento, setCurrentTratamiento] = useState({
    nombre: '',
    dosis: '',
    frecuencia: '',
  });

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignosVitalesChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      signosVitales: { ...prev.signosVitales, [name]: value },
    }));
  };

  const addDiagnostico = () => {
    if (currentDiagnostico.nombre) {
      setFormData(prev => ({ ...prev, diagnosticos: [...prev.diagnosticos, currentDiagnostico] }));
      setCurrentDiagnostico({ nombre: '', observacion: '' });
    }
  };

  const addTratamiento = () => {
    if (currentTratamiento.nombre) {
      setFormData(prev => ({ ...prev, tratamientos: [...prev.tratamientos, currentTratamiento] }));
      setCurrentTratamiento({ nombre: '', dosis: '', frecuencia: '' });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Enviando datos de la consulta:', formData);
    // Aquí iría el fetch para guardar los datos
    try {
      /*
        const response = await fetch('/api/atencion/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, dataIds: data.dataIds }) // Incluir IDs de paciente, atencion, etc.
        });
        const result = await response.json();
        if(response.ok) {
            showToast('Consulta guardada con éxito', { type: 'success' });
        } else {
            throw new Error(result.message || 'Error al guardar');
        }
        */
      alert('Consulta guardada (simulación). Revisa la consola para ver los datos.');
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      // showToast(error.message, { type: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Motivo de Consulta">
        <TextArea
          name="motivoConsulta"
          value={formData.motivoConsulta}
          onChange={handleFormChange}
          placeholder="Describe el motivo principal de la visita..."
        />
      </Section>

      <Section title="Signos Vitales">
        <div className="flex flex-wrap gap-4 items-center w-full justify-around">
          <Input
            label="Presión Arterial"
            name="presionArterial"
            value={formData.signosVitales.presionArterial}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 120/80"
          />
          <Input
            label="Frecuencia Cardíaca"
            name="frecuenciaCardiaca"
            value={formData.signosVitales.frecuenciaCardiaca}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 75 lpm"
          />
          <Input
            label="Frecuencia Respiratoria"
            name="frecuenciaRespiratoria"
            value={formData.signosVitales.frecuenciaRespiratoria}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 16 rpm"
          />
          <Input
            label="Temperatura"
            name="temperatura"
            value={formData.signosVitales.temperatura}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 36.5 °C"
          />
          <Input
            label="Saturación de Oxígeno"
            name="saturacionOxigeno"
            value={formData.signosVitales.saturacionOxigeno}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 98 %"
          />
          <Input
            label="Peso"
            name="peso"
            value={formData.signosVitales.peso}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 70 kg"
          />
          <Input
            label="Altura"
            name="altura"
            value={formData.signosVitales.altura}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 175 cm"
          />
          <Input
            label="IMC"
            name="imc"
            value={formData.signosVitales.imc}
            onChange={handleSignosVitalesChange}
            placeholder="Ej: 25.5"
          />
        </div>
      </Section>

      <Section title="Síntomas (Anamnesis)">
        <TextArea
          name="sintomas"
          value={formData.sintomas}
          onChange={handleFormChange}
          placeholder="Describe los síntomas que reporta el paciente..."
        />
      </Section>

      <Section title="Diagnóstico">
        <div className="space-y-4">
          <Input
            label="Nombre del Diagnóstico"
            name="nombre"
            value={currentDiagnostico.nombre}
            onChange={e => setCurrentDiagnostico({ ...currentDiagnostico, nombre: e.target.value })}
            placeholder="Ej: Faringitis aguda"
          />
          <TextArea
            label="Observaciones"
            name="observacion"
            value={currentDiagnostico.observacion}
            onChange={e =>
              setCurrentDiagnostico({ ...currentDiagnostico, observacion: e.target.value })
            }
            placeholder="Detalles adicionales del diagnóstico..."
            rows={2}
          />
          <Button onClick={addDiagnostico} variant="secondary">
            Agregar Diagnóstico
          </Button>
        </div>
        <ul className="mt-6 space-y-3">
          {formData.diagnosticos.map((diag, index) => (
            <li key={index} className="p-3 bg-gray-100 rounded-md">
              {diag.nombre}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tratamiento">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Medicamento"
              name="nombre"
              value={currentTratamiento.nombre}
              onChange={e =>
                setCurrentTratamiento({ ...currentTratamiento, nombre: e.target.value })
              }
            />
            <Input
              label="Dosis"
              name="dosis"
              value={currentTratamiento.dosis}
              onChange={e =>
                setCurrentTratamiento({ ...currentTratamiento, dosis: e.target.value })
              }
            />
            <Input
              label="Frecuencia"
              name="frecuencia"
              value={currentTratamiento.frecuencia}
              onChange={e =>
                setCurrentTratamiento({ ...currentTratamiento, frecuencia: e.target.value })
              }
            />
          </div>
          <Button onClick={addTratamiento} variant="secondary">
            Agregar Tratamiento
          </Button>
        </div>
        <ul className="mt-6 space-y-3">
          {formData.tratamientos.map((tr, index) => (
            <li
              key={index}
              className="p-3 bg-gray-100 rounded-md"
            >{`${tr.nombre} (${tr.dosis}) - ${tr.frecuencia}`}</li>
          ))}
        </ul>
      </Section>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit">Guardar Consulta</Button>
      </div>
    </form>
  );
};
