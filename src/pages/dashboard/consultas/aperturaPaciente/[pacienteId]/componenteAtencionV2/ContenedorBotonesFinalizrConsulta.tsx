import Button from '@/components/atomos/Button';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { getDurationInMinutes, getFechaUnix } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { CircleX, Lock, Save, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

type Props = {};

export default function ContenedorBotonesFinalizrConsulta({}: Props) {
  const $consulta = useStore(consultaStore);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGuardarBorrador = async (modoFetch: string) => {
    try {
      if (modoFetch === 'finalizada') {
        const now = new Date(getFechaUnix() * 1000);
        setConsultaField('finConsulta', now.toISOString());

        if ($consulta.inicioConsulta) {
          const duration = getDurationInMinutes($consulta.inicioConsulta, now.toISOString());
          setConsultaField('duracionConsulta', duration);
        } else {
          console.warn('inicioConsulta no está definido. No se pudo calcular la duración.');
          setConsultaField('duracionConsulta', 0);
        }
      }

      const response = await fetch('/api/atencion/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...$consulta,
          status: modoFetch,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      showToast('Consulta guardada con éxito', { background: 'bg-green-500' });
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      showToast(`Error al guardar: ${error.message}`, { background: 'bg-primary-400' });
    }
  };

  const handleFinalizarClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmarFinalizacion = () => {
    handleGuardarBorrador('finalizada');
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div
          style={{ margin: 0, position: 'fixed' }}
          className="fixed top-0 left-0 mt-0 pt-10 w-full h-screen z-[80]  flex items-start  justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={`bg-white  w-[50vw] border boder-2 border-primary-400 relative rounded-lg overflow-hidden border-l-2 text-border-primary-100/80 mt-0 shadow-lg h-fit max-h overflow-y-auto `}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Fijo */}
            <div className="flex justify-between items-center p-4 border-b bg-primary-bg-componentes flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-800">Atención</h3>
              <button
                className="text-gray-500 hover:text-primary-100 transition-colors rounded-full p-1"
                onClick={() => setIsModalOpen(false)}
              >
                <CircleX size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow max-h-[87vh]">
              <div className="p-4 flex flex-col items-center text-center">
                <TriangleAlert className="w-16 h-16 text-yellow-400 mb-4" />
                <h2 className="text-lg font-semibold mb-2">Atención</h2>
                <p className="text-gray-600 mb-6">
                  Al finalizar la consulta, el registro se sellará y no podrá ser modificado
                  directamente. Cualquier cambio futuro deberá realizarse mediante una enmienda.
                </p>
                <div className="flex justify-center gap-4 w-full">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmarFinalizacion}
                    className="bg-primary-100 hover:bg-primary-200 text-white"
                  >
                    Confirmar Finalización
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex md:flex-col flex-row w-full md:w-fit md:items-center gap-2">
        <Button id="guardarBorradorV2" onClick={() => handleGuardarBorrador('borrador')}>
          <p className="inline-flex items-center gap-2">
            <Save className="mr- w-4 h-4" /> Guardar Borrador
          </p>
        </Button>
        <Button id="finalizarConsultaV2" onClick={handleFinalizarClick}>
          <p className="inline-flex items-center gap-2">
            <Lock className="mr- w-4 h-4" /> Finalizar Consulta
          </p>
        </Button>
      </div>
    </>
  );
}
