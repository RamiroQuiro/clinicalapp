import Button from '@/components/atomos/Button';
// --- CAMBIADO: Importar consultaStore ---
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store'; // MODIFICADO
import { getDurationInMinutes, getFechaUnix } from '@/utils/timesUtils'; // AÑADIDO
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Lock, Save } from 'lucide-react';

type Props = {};

export default function ContenedorBotonesFinalizrConsulta({}: Props) {
  const $consulta = useStore(consultaStore);
  console.log('esta es la consulta en el contendor de botones pantalla ->', $consulta);
  const handleGuardarBorrador = async (modoFetch: string) => {
    try {
      if (modoFetch === 'finalizada') {
        const now = new Date(getFechaUnix() * 1000);
        setConsultaField('finConsulta', now.toISOString());

        if ($consulta.inicioConsulta) {
          const duration = getDurationInMinutes($consulta.inicioConsulta, now.toISOString());
          setConsultaField('duracionConsulta', duration);
        } else {
          // Manejar el caso en que inicioConsulta pueda faltar (ej. datos antiguos, error)
          console.warn('inicioConsulta no está definido. No se pudo calcular la duración.');
          setConsultaField('duracionConsulta', 0); // O null, dependiendo del comportamiento deseado
        }
      }

      const response = await fetch('/api/atencion/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // --- CAMBIADO: Enviar los datos de $consulta ---
          ...$consulta,
          status: modoFetch, // 'borrador' o 'finalizada'
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      showToast('Consulta guardada con éxito', { background: 'bg-green-500' });
      // --- AÑADIDO: Resetear la store después de guardar ---
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      showToast(`Error al guardar: ${error.message}`, { background: 'bg-primary-400' });
    }
  };

  return (
    <div className="flex md:flex-col flex-row w-full md:w-fit md:items-center gap-2">
      <Button id="guardarBorradorV2" onClick={() => handleGuardarBorrador('borrador')}>
        <p className=" inline-flex items-center gap-2">
          <Save className="mr- w-4 h-4" /> Guardar Borrador
        </p>
      </Button>
      <Button id="finalizarConsultaV2" onClick={() => handleGuardarBorrador('finalizada')}>
        <p className=" inline-flex items-center gap-2">
          <Lock className="mr- w-4 h-4" /> Finalizar Consulta
        </p>
      </Button>
    </div>
  );
}
