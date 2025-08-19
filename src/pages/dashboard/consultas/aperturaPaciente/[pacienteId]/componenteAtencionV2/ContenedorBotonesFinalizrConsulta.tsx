import Button from '@/components/atomos/Button';
// --- CAMBIADO: Importar consultaStore ---
import { consultaStore, resetConsulta } from '@/context/consultaAtencion.store';
import { useStore } from '@nanostores/react';

type Props = {};

export default function ContenedorBotonesFinalizrConsulta({}: Props) {
  // --- CAMBIADO: Usar consultaStore ---
  const $consulta = useStore(consultaStore);

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

      alert(`Consulta guardada como ${modoFetch} con éxito`);
      // --- AÑADIDO: Resetear la store después de guardar ---
      resetConsulta();
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button id="guardarBorradorV2" onClick={() => handleGuardarBorrador('borrador')}>
        Guardar Borrador
      </Button>
      <Button id="finalizarConsultaV2" onClick={() => handleGuardarBorrador('finalizada')}>
        Finalizar Consulta
      </Button>
    </div>
  );
}
