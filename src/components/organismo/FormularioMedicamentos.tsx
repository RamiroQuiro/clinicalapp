import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { useStore } from '@nanostores/react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';

interface FormularioMedicamentosProps {
  onClose: () => void;
  med?: any; // Prop para edición
}

const FormularioMedicamentos = ({ onClose, med }: FormularioMedicamentosProps) => {
  const [error, setError] = useState('');
  const [currentMedicamento, setCurrentMedicamento] = useState({
    nombreGenerico: '',
    nombreComercial: '',
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
        <Input
          label="Nombre Genérico"
          name="nombreGenerico"
          value={currentMedicamento.nombreGenerico}
          onChange={e =>
            setCurrentMedicamento(prev => ({ ...prev, nombreGenerico: e.target.value }))
          }
        />
        <Input
          label="Nombre Comercial"
          name="nombreComercial"
          value={currentMedicamento.nombreComercial}
          onChange={e =>
            setCurrentMedicamento(prev => ({ ...prev, nombreComercial: e.target.value }))
          }
        />
        <Input
          label="Dosis"
          name="dosis"
          value={currentMedicamento.dosis}
          onChange={e => setCurrentMedicamento(prev => ({ ...prev, dosis: e.target.value }))}
        />
        <Input
          label="Frecuencia"
          name="frecuencia"
          value={currentMedicamento.frecuencia}
          onChange={e => setCurrentMedicamento(prev => ({ ...prev, frecuencia: e.target.value }))}
        />

        <div className="w-full flex items-center justify-between">
          <div className="w-full h-7 py-2 flex text-red-500 font-semibold tracking-wider text-xs">
            {error && <p className="animate-aparecer">{error}</p>}
          </div>
          <Button onClick={handleSubmit}>Agregar</Button>
        </div>
      </div>
    </div>
  );
};

export default FormularioMedicamentos;
