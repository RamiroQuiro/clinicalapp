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
  const atencionId = $consulta.atencion.id; // Necesitamos el ID de la atencion para la URL

  // Estados para el tipo de certificado
  const [tipoCertificado, setTipoCertificado] = useState<'reposo' | 'alta' | 'aptitud'>('reposo');

  // Estados para datos
  const [diagnostico, setDiagnostico] = useState('');
  const [diasReposo, setDiasReposo] = useState('1');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaAlta, setFechaAlta] = useState(new Date().toISOString().split('T')[0]);
  const [actividadAptitud, setActividadAptitud] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [presentarA, setPresentarA] = useState('quien corresponda');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-rellenar el diagnostico principal si existe
    if ($consulta.diagnosticos && $consulta.diagnosticos.length > 0) {
      setDiagnostico($consulta.diagnosticos[0].diagnostico || '');
    }
  }, [$consulta.diagnosticos]);

  const handleSubmit = async () => {
    if (!atencionId) {
      showToast('No se encontro el ID de la atencion. Por favor, recargue la pagina.', {
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
          tipo: tipoCertificado,
          diagnostico:
            tipoCertificado === 'reposo' || tipoCertificado === 'alta' ? diagnostico : undefined,
          diasReposo: tipoCertificado === 'reposo' ? diasReposo : undefined,
          fechaInicio: tipoCertificado === 'reposo' ? fechaInicio : undefined,
          fechaAlta: tipoCertificado === 'alta' ? fechaAlta : undefined,
          actividadAptitud: tipoCertificado === 'aptitud' ? actividadAptitud : undefined,
          observaciones: tipoCertificado === 'aptitud' ? observaciones : undefined,
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
      a.download = `certificado-${tipoCertificado}-${paciente.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Certificado generado y descargado con exito.', { background: 'bg-green-500' });
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

      {/* Selector de Tipo de Certificado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Certificado</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          value={tipoCertificado}
          onChange={(e: any) => setTipoCertificado(e.target.value)}
        >
          <option value="reposo">Certificado de Reposo</option>
          <option value="alta">Certificado de Alta Medica</option>
          <option value="aptitud">Certificado de Aptitud Fisica / Buena Salud</option>
        </select>
      </div>

      {/* Campos para Certificado de Reposo */}
      {tipoCertificado === 'reposo' && (
        <>
          <div>
            <Input
              label="Diagnostico Principal"
              id="diagnostico"
              value={diagnostico}
              onChange={(e: any) => setDiagnostico(e.target.value)}
              placeholder="Ej: Faringoamigdalitis aguda"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Dias de Reposo"
                id="diasReposo"
                type="number"
                value={diasReposo}
                onChange={(e: any) => setDiasReposo(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                label="Fecha de Inicio del Reposo"
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e: any) => setFechaInicio(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Campos para Certificado de Alta */}
      {tipoCertificado === 'alta' && (
        <>
          <div>
            <Input
              label="Motivo de la baja (Diagnostico - Opcional)"
              id="diagnostico"
              value={diagnostico}
              onChange={(e: any) => setDiagnostico(e.target.value)}
              placeholder="Ej: Gripe A"
            />
          </div>
          <div>
            <Input
              label="Fecha de Alta"
              id="fechaAlta"
              type="date"
              value={fechaAlta}
              onChange={(e: any) => setFechaAlta(e.target.value)}
            />
          </div>
        </>
      )}

      {/* Campos para Certificado de Aptitud */}
      {tipoCertificado === 'aptitud' && (
        <>
          <div>
            <Input
              label="Apto para realizar"
              id="actividadAptitud"
              value={actividadAptitud}
              onChange={(e: any) => setActividadAptitud(e.target.value)}
              placeholder="Ej: Natacion, Educacion Fisica"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 min-h-[80px]"
              value={observaciones}
              onChange={(e: any) => setObservaciones(e.target.value)}
              placeholder="Ej: Usar lentes para leer..."
            />
          </div>
        </>
      )}

      <div>
        <Input
          label="Presentar a"
          id="presentarA"
          value={presentarA}
          onChange={(e: any) => setPresentarA(e.target.value)}
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
