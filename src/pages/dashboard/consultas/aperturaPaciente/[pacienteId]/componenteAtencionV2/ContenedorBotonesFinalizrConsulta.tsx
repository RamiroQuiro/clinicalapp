import Button from '@/components/atomos/Button';
// --- CAMBIADO: Importar consultaStore ---
import { consultaStore } from '@/context/consultaAtencion.store';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Lock, Save } from 'lucide-react';

type Props = {};

export default function ContenedorBotonesFinalizrConsulta({}: Props) {
  // --- CAMBIADO: Usar consultaStore ---
  const $consulta = useStore(consultaStore);
  console.log('esta es la consulta en el contendor de botones pantalla ->', $consulta);
  const handleGuardarBorrador = async (modoFetch: string) => {
    try {
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

      showToast('Consulta guardada con éxito', { backgorund: 'bg-green-500' });
      // --- AÑADIDO: Resetear la store después de guardar ---
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      showToast(`Error al guardar: ${error.message}`, { backgorund: 'bg-primary-400' });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
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
