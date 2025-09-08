import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import InputDate from '@/components/atomos/InputDate';
import { TextArea } from '@/components/atomos/TextArea';
import { CardContent, CardTitle } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import { AlertTriangle, FileEdit, User } from 'lucide-react';
import { useState } from 'react';

type Props = {
  atencionId: string;
  onClose: () => void;
};

export default function FormularioEnmienda({ atencionId, onClose }: Props) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim() || !details.trim()) {
      showToast('Ambos campos son obligatorios.', { background: 'bg-red-500' });
      return;
    }

    setIsLoading(true);

    try {
      // Aquí irá la llamada a la API en el futuro
      console.log('Enviando enmienda:', { atencionId, reason, details });
      // const response = await fetch('/api/enmiendas/create', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ atencionId, reason, details }),
      // });

      // const result = await response.json();
      // if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      showToast('Enmienda guardada con éxito', { background: 'bg-green-500' });
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al guardar la enmienda:', error);
      showToast(`Error: ${error.message}`, { background: 'bg-red-500' });
    } finally {
      setIsLoading(false);
    }
  };

  const motivosEnmienda = [
    { value: 'correccion', label: 'Corrección de información incorrecta' },
    { value: 'adicion', label: 'Adición de información omitida' },
    { value: 'aclaracion', label: 'Aclaración de información ambigua' },
    { value: 'actualizacion', label: 'Actualización de información' },
  ];

  const seccionesDisponibles = [
    { value: 'diagnosticos', label: 'Diagnósticos' },
    { value: 'medicamentos', label: 'Medicamentos' },
    { value: 'sintomas', label: 'Síntomas y Anamnesis' },
    { value: 'signosVitales', label: 'Signos Vitales' },
    { value: 'observaciones', label: 'Observaciones' },
    { value: 'motivoConsulta', label: 'Motivo de Consulta' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Formulario de Enmienda Médica</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>Las enmiendas quedan registradas permanentemente en el historial médico</span>
        </div>
      </div>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputDate name="fechaEnmienda" />

            <select name="motivoEnmienda" id="">
              {motivosEnmienda.map(motivo => (
                <option key={motivo.value} value={motivo.value}>
                  {motivo.label}
                </option>
              ))}
            </select>
          </div>

          <select name="seccionEnmendar" id="">
            {seccionesDisponibles.map(seccion => (
              <option key={seccion.value} value={seccion.value}>
                {seccion.label}
              </option>
            ))}
          </select>

          <br />

          {/* Contenido Original y Corregido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              name="contenidoOriginal"
              placeholder="Contenido original de la sección seleccionada"
              className="min-h-24 bg-muted"
              readOnly
            />

            <Input
              name="contenidoCorregido"
              placeholder="Ingrese el contenido corregido o actualizado"
              className="min-h-24"
            />

            <TextArea
              name="contenidoCorregido"
              placeholder="Ingrese el contenido corregido o actualizado"
              className="min-h-24"
            />
          </div>

          <TextArea
            name="justificacion"
            placeholder="Explique detalladamente el motivo y la necesidad de esta enmienda"
            className="min-h-20"
          />

          <br />

          {/* Información del Médico */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Médico que Realiza la Enmienda
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="medicoEnmienda" placeholder="Nombre Completo del Médico" />

              <Input name="matriculaMedico" placeholder="Matrícula Profesional" />

              <Input name="matriculaMedico" placeholder="Matrícula Profesional" />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="min-w-32">
              Registrar Enmienda
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
