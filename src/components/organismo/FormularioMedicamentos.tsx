import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { useStore } from '@nanostores/react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import BuscadorVademecum from './vademecum/BuscadorVademecum';

interface FormularioMedicamentosProps {
  onClose: () => void;
  med?: any; // Prop para edición
}

// Define the type for the selected medication
type MedicamentoSeleccionado = {
  id: string;
  nombreGenerico: string;
  nombreComercial?: string;
  presentacion?: string;
};

const FormularioMedicamentos = ({ onClose, med }: FormularioMedicamentosProps) => {
  const [error, setError] = useState('');
  const [currentMedicamento, setCurrentMedicamento] = useState({
    nombreGenerico: '',
    nombreComercial: '',
    presentacion: '',
    dosis: '',
    frecuencia: '',
    id: '',
  });

  const $consulta = useStore(consultaStore);

  useEffect(() => {
    if (med) {
      setCurrentMedicamento(med);
    }
  }, [med]);

  const handleMedicamentoSelect = (medicamento: MedicamentoSeleccionado) => {
    console.log('medicamento encontrado', medicamento);
    setCurrentMedicamento(prev => ({
      ...prev,
      nombreGenerico: medicamento.nombreGenerico || '',
      nombreComercial: medicamento.nombreComercial || '',
      presentacion: medicamento.presentacion || '',
      // Reset dosis and frecuencia as they are specific to the prescription
      dosis: '',
      frecuencia: '',
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!currentMedicamento.nombreGenerico && !currentMedicamento.nombreComercial) {
      setError('Debe ingresar al menos un nombre (Genérico o Comercial).');
      setTimeout(() => setError(''), 2500);
      return;
    }

    const newMed = {
      nombreGenerico: currentMedicamento.nombreGenerico,
      nombreComercial: currentMedicamento.nombreComercial,
      dosis: currentMedicamento.dosis,
      frecuencia: currentMedicamento.frecuencia,
      id: med ? med.id : nanoid(),
    };

    if (med) {
      // Actualizar medicamento existente
      const updatedMedicamentos = $consulta.medicamentos.map(m => (m.id === med.id ? newMed : m));
      setConsultaField('medicamentos', updatedMedicamentos);
    } else {
      // Crear nuevo medicamento
      setConsultaField('medicamentos', [...$consulta.medicamentos, newMed]);
    }

    onClose();
  };

  return (
    <div className="md:w-[80vw] w-full max-w-lg mx-auto">
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Medicamento</label>
          <BuscadorVademecum onMedicamentoSelect={handleMedicamentoSelect} />
          <p className="text-xs text-gray-500 mt-1">
            Busca para autocompletar los nombres. Luego, completa la dosis y frecuencia.
          </p>
        </div>

        <div className="w-full border-t border-gray-200 my-4"></div>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex-1 min-w-0">
            <Input
              label="Nombre Genérico"
              name="nombreGenerico"
              value={currentMedicamento.nombreGenerico}
              onChange={e =>
                setCurrentMedicamento(prev => ({ ...prev, nombreGenerico: e.target.value }))
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              label="Nombre Comercial"
              name="nombreComercial"
              value={currentMedicamento.nombreComercial}
              onChange={e =>
                setCurrentMedicamento(prev => ({ ...prev, nombreComercial: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Input
            label="Presentacion"
            name="presentacion"
            value={currentMedicamento.presentacion}
            onChange={e =>
              setCurrentMedicamento(prev => ({ ...prev, presentacion: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="md:w-1/4">
            <Input
              label="Dosis"
              name="dosis"
              value={currentMedicamento.dosis}
              onChange={e => setCurrentMedicamento(prev => ({ ...prev, dosis: e.target.value }))}
            />
          </div>
          <div className="md:w-1/4">
            <Input
              label="Frecuencia"
              name="frecuencia"
              value={currentMedicamento.frecuencia}
              onChange={e =>
                setCurrentMedicamento(prev => ({ ...prev, frecuencia: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="w-full h-7 py-2 flex text-red-500 font-semibold tracking-wider text-xs">
            {error && <p className="animate-aparecer">{error}</p>}
          </div>
          <Button onClick={handleSubmit}>{med ? 'Actualizar' : 'Agregar'}</Button>
        </div>
      </div>
    </div>
  );
};

export default FormularioMedicamentos;
