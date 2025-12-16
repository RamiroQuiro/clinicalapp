import { consultaStore } from '@/context/consultaAtencion.store';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import Button from '../atomos/Button';
import { Input } from '../atomos/Input';

interface FormularioCertificadoProps {
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  onClose: () => void;
}

const FormularioCertificadoAtencion = ({ paciente, onClose }: FormularioCertificadoProps) => {
  const $consulta = useStore(consultaStore);
  const atencionId = $consulta.atencion.id; // Necesitamos el ID de la atención para la URL

  const [diagnostico, setDiagnostico] = useState('');
  const [diasReposo, setDiasReposo] = useState('1');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [presentarA, setPresentarA] = useState('quien corresponda');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-rellenar el diagnóstico principal si existe
    if ($consulta.diagnosticos && $consulta.diagnosticos.length > 0) {
      setDiagnostico($consulta.diagnosticos[0].diagnostico || '');
    }
  }, [$consulta.diagnosticos]);

  const handleSubmit = async () => {
    if (!atencionId) {
      showToast('No se encontró el ID de la atención. Por favor, recargue la página.', {
        background: 'bg-red-500',
      });
      return;
    }

    setIsLoading(true);
    showToast('Generando certificado...', { background: 'bg-blue-500' });

    try {
      const response = await fetch(`/api/certificados/${atencionId}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paciente,
          diagnostico,
          diasReposo,
          fechaInicio,
          presentarA,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al generar el PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${paciente.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Certificado generado y descargado con éxito.', { background: 'bg-green-500' });
      onClose();
    } catch (error) {
      console.error('Error al generar el certificado:', error);
      showToast('No se pudo generar el certificado. Intente nuevamente.', {
        background: 'bg-red-500',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 text-primary-texto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Paciente"
            id="paciente"
            value={`${paciente.nombre} ${paciente.apellido}`}
            readOnly
          />
        </div>
        <div>
          <Input label="DNI" id="dni" value={paciente.dni} readOnly />
        </div>
      </div>

      <div>
        <Input
          label="Diagnóstico Principal"
          id="diagnostico"
          value={diagnostico}
          onChange={e => setDiagnostico(e.target.value)}
          placeholder="Ej: Faringoamigdalitis aguda"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Días de Reposo"
            id="diasReposo"
            type="number"
            value={diasReposo}
            onChange={e => setDiasReposo(e.target.value)}
            min="0"
          />
        </div>
        <div>
          <Input
            label="Fecha de Inicio del Reposo"
            id="fechaInicio"
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Input
          label="Presentar a"
          id="presentarA"
          value={presentarA}
          onChange={e => setPresentarA(e.target.value)}
          placeholder="Ej: su trabajo, la escuela, etc."
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="cancel" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar PDF'}
        </Button>
      </div>
    </div>
  );
};

export default FormularioCertificadoAtencion;
