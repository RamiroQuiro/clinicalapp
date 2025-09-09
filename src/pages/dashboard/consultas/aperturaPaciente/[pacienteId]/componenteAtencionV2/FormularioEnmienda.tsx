import Button from '@/components/atomos/Button';
import { TextArea } from '@/components/atomos/TextArea';
import { CardContent } from '@/components/organismo/Card';
import type { Atencion, Diagnostico, Medicamento, User } from '@/types';
import { showToast } from '@/utils/toast/toastShow';
import { AlertTriangle, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

// Tipos para las props del componente
type Props = {
  atencion: Atencion & {
    diagnosticos: Diagnostico[];
    medicamentos: Medicamento[];
  };
  paciente: Paciente;
  user: User; // Datos del médico que realiza la enmienda
  onClose: () => void;
};

// Opciones para los selects, definidas fuera del componente
const motivosEnmienda = [
  { value: 'correccion', label: 'Corrección de información incorrecta' },
  { value: 'adicion', label: 'Adición de información omitida' },
  { value: 'aclaracion', label: 'Aclaración de información ambigua' },
  { value: 'actualizacion', label: 'Actualización de información' },
];

const seccionesDisponibles = [
  { value: '', label: 'Seleccione una sección...' },
  { value: 'motivoInicial', label: 'Motivo Inicial' },
  { value: 'motivoConsulta', label: 'Motivo de Consulta' },
  { value: 'sintomas', label: 'Síntomas y Anamnesis' },
  { value: 'diagnosticos', label: 'Diagnósticos' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'observaciones', label: 'Observaciones' },
  { value: 'signosVitales', label: 'Signos Vitales' },
];

export default function FormularioEnmienda({ atencion, paciente, user, onClose }: Props) {
  // Estados para los campos del formulario (componentes controlados)
  const [motivo, setMotivo] = useState(motivosEnmienda[0].value);
  const [seccion, setSeccion] = useState('');
  const [contenidoOriginal, setContenidoOriginal] = useState('');
  const [contenidoCorregido, setContenidoCorregido] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Efecto para actualizar el contenido original cuando se selecciona una sección
  useEffect(() => {
    let original = '';
    console.log('atencion', atencion, 'y la seleccion de la seccion', seccion);
    switch (seccion) {
      case 'motivoInicial':
        original = atencion.motivoInicial || 'No especificado';
        break;
      case 'motivoConsulta':
        original = atencion.motivoConsulta || 'No especificado';
        break;
      case 'sintomas':
        original = atencion.anamnesis || 'No especificado';
        break;
      case 'diagnosticos':
        original =
          atencion.diagnosticos?.map(d => `${d.codigo} - ${d.descripcion}`).join('\n') ||
          'No hay diagnósticos';
        break;
      case 'medicamentos':
        original =
          atencion.medicamentos
            ?.map(m => `${m.nombreGenerico} (${m.dosis}, ${m.frecuencia})`)
            .join('\n') || 'No hay medicamentos';
        break;
      case 'observaciones':
        original = atencion.observaciones || 'No especificado';
        break;
      case 'signosVitales':
        original = `Peso: ${atencion.peso} kg, Altura: ${atencion.altura} m, IMC: ${atencion.imc}, T/A: ${atencion.ta}, FC: ${atencion.fc}, FR: ${atencion.fr}, Temp: ${atencion.temp}°C, Saturación: ${atencion.saturacionO2}%`;
        break;
      default:
        original = 'Seleccione una sección para ver el contenido original.';
    }
    setContenidoOriginal(original);
  }, [seccion, atencion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!seccion || !contenidoCorregido.trim() || !justificacion.trim()) {
      showToast(
        'Debe seleccionar una sección y rellenar el contenido corregido y la justificación.',
        {
          background: 'bg-red-500',
        }
      );
      return;
    }

    setIsLoading(true);
    const dataToSend = {
      atencionId: atencion.id,
      userIdMedico: atencion.userIdMedico,
      motivo,
      seccion,
      contenidoOriginal,
      contenidoCorregido,
      justificacion,
    };

    try {
      console.log('Enviando enmienda:', dataToSend);
      const response = await fetch('/api/atencion/amendment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      showToast('Enmienda guardada con éxito', { background: 'bg-green-500' });
      onClose();
    } catch (error: any) {
      console.error('Error al guardar la enmienda:', error);
      showToast(`Error: ${error.message}`, { background: 'bg-red-500' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full md:w-[65vw] mx-auto p-2">
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle className="h-4 w-4" />
          <span>Las enmiendas quedan registradas permanentemente en el historial médico.</span>
        </div>
      </div>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sección de Selección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="motivoEnmienda"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Motivo de la Enmienda
              </label>
              <select
                id="motivoEnmienda"
                name="motivoEnmienda"
                value={motivo}
                onChange={e => setMotivo(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm bg-white"
              >
                {motivosEnmienda.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="seccionEnmendar"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sección a Enmendar
              </label>
              <select
                id="seccionEnmendar"
                name="seccionEnmendar"
                value={seccion}
                onChange={e => setSeccion(e.target.value)}
                className="w-full p-2 border rounded-md shadow-sm bg-white"
              >
                {seccionesDisponibles.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contenido Original y Corregido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TextArea
              label="Contenido Original"
              name="contenidoOriginal"
              value={contenidoOriginal}
              className="min-h-32 bg-gray-100 text-gray-600"
              readOnly
            />
            <TextArea
              label="Contenido Corregido/Adicional"
              name="contenidoCorregido"
              placeholder="Ingrese el contenido corregido o la información adicional..."
              value={contenidoCorregido}
              onChange={e => setContenidoCorregido(e.target.value)}
              className="min-h-32"
            />
          </div>

          {/* Justificación */}
          <TextArea
            label="Justificación de la Enmienda"
            name="justificacion"
            placeholder="Explique detalladamente el motivo y la necesidad de este cambio..."
            value={justificacion}
            onChange={e => setJustificacion(e.target.value)}
            className="min-h-24"
          />

          {/* Tarjeta del Médico */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold flex items-center gap-2 text-gray-800">
              <UserIcon className="h-4 w-4" />
              Médico que Realiza la Enmienda
            </h4>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-sky-50 border border-sky-200">
              <img
                src={user?.fotoUrl || '/avatarDefault.png'}
                alt="Avatar"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-gray-900">
                  {user?.name} {user?.apellido}
                </p>
                <p className="text-sm text-gray-600">Matrícula: {user?.matricula}</p>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="min-w-40" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Enmienda'}
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}
