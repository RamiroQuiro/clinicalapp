import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { TextArea } from '@/components/atomos/TextArea';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import FormularioBusquedaCie from '@/pages/dashboard/consultas/aperturaPaciente/[pacienteId]/FormularioBusquedaCie';
import { useStore } from '@nanostores/react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

interface FormularioDiagnosticosProps {
  onClose: () => void;
  diag?: any;
}

const FormularioDiagnosticos = ({ onClose, diag }: FormularioDiagnosticosProps) => {
  const [error, setError] = useState('');
  const [currentDiagnostico, setCurrentDiagnostico] = useState({
    diagnostico: '',
    observaciones: '',
    codigoCIE: '',
    id: '',
    estado: 'Activo', // Default to Activo
  });

  const $consulta = useStore(consultaStore);

  useEffect(() => {
    if (diag) {
      setCurrentDiagnostico({
        diagnostico: diag.diagnostico || '',
        observaciones: diag.observaciones || '',
        codigoCIE: diag.codigoCIE || '',
        id: diag.id || '',
        estado: diag.estado || 'Activo', // Load existing state or default
      });
    }
  }, [diag]);

  const handleSelectCIE = (cieData: { title: string; cie11: string }) => {
    setCurrentDiagnostico(prev => ({
      ...prev,
      diagnostico: cieData.title,
      codigoCIE: cieData.cie11,
    }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDiagnostico(prev => ({ ...prev, estado: e.target.value }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentDiagnostico.diagnostico) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    const newDiag = {
      diagnostico: currentDiagnostico.diagnostico,
      observaciones: currentDiagnostico.observaciones,
      codigoCIE: currentDiagnostico.codigoCIE,
      id: diag ? diag.id : nanoid(),
      estado: currentDiagnostico.estado, // Include estado
    };
    if (diag) {
      const current = consultaStore.get().diagnosticos;
      setConsultaField(
        'diagnosticos',
        current.map(d => (d.id === diag.id ? newDiag : d))
      );
    } else {
      const current = consultaStore.get().diagnosticos;
      setConsultaField('diagnosticos', [...current, newDiag]);
    }
    onClose();
  };

  return (
    <div className="p- w-[75vw] max-w-xl flex-col gap-2 mx-auto">
      <FormularioBusquedaCie onSelectCIE={handleSelectCIE} />

      <Input
        id="diagnostico"
        label="Diagnóstico"
        name="diagnostico"
        type="text"
        value={currentDiagnostico.diagnostico}
        onChange={e => setCurrentDiagnostico(prev => ({ ...prev, diagnostico: e.target.value }))}
      />
      <Input
        id="codigoCIE"
        label="Código CIE"
        name="codigoCIE"
        type="text"
        value={currentDiagnostico.codigoCIE}
        onChange={e => setCurrentDiagnostico(prev => ({ ...prev, codigoCIE: e.target.value }))}
      />

      <TextArea
        label="Observaciones:"
        name="observaciones"
        id="observaciones"
        value={currentDiagnostico.observaciones}
        onChange={e => setCurrentDiagnostico(prev => ({ ...prev, observaciones: e.target.value }))}
        rows={5}
      />

      <div className="mt-4">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Estado del Diagnóstico:
        </label>
        <div className="flex flex-wrap gap-2">
          {['activo', 'curado', 'controlado'].map(statusOption => (
            <label
              key={statusOption}
              className={`cursor-pointer px-4 py-2 rounded-full text-xs font-medium transition-colors duration-200
                  ${
                    currentDiagnostico.estado === statusOption
                      ? 'bg-indigo-600 text-white shadow-md border ring-indigo-600/50 ring-1'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border ring-indigo-600/50 ring-1'
                  }`}
            >
              <input
                type="radio"
                name="estado"
                value={statusOption}
                checked={currentDiagnostico.estado === statusOption}
                onChange={handleEstadoChange}
                className="hidden" // Hide default radio button
              />
              {statusOption}
            </label>
          ))}
        </div>
      </div>

      <div className="w-full mt-4 flex items-center justify-between">
        <div className="w-full h-7 py-2 flex text-red-500 font-semibold tracking-wider text-xs">
          {error && <p className="animate-aparecer">{error}</p>}
        </div>
        <Button onClick={handleSubmit}>Agregar</Button>
      </div>
    </div>
  );
};

export default FormularioDiagnosticos;
