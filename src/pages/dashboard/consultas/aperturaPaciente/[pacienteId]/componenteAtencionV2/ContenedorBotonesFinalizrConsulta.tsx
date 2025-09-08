import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { consultaStore, setConsultaField } from '@/context/consultaAtencion.store';
import { getDurationInMinutes, getFechaUnix } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { FileDown, FilePlus, Lock, Save, Table2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import FormularioEnmienda from './FormularioEnmienda';

type Props = {
  esFinalizada: boolean;
  pacienteId: string;
  atencionId: string;
};

export default function ContenedorBotonesFinalizrConsulta({
  esFinalizada,
  pacienteId,
  atencionId,
}: Props) {
  const $consulta = useStore(consultaStore);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnmiendaModalOpen, setIsEnmiendaModalOpen] = useState(false);

  const handleGuardarBorrador = async (modoFetch: string) => {
    if (
      $consulta.motivoInicial === '' ||
      $consulta.motivoInicial === null ||
      $consulta.motivoInicial === 'undefined'
    ) {
      showToast('Debe ingresar un motivo inicial', { background: 'bg-red-500' });
      return;
    }

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
      <div className="flex md:flex-col flex-row w-full md:w-fit md:items-center gap-2">
        {esFinalizada ? (
          <>
            <Button id="crearEnmienda" onClick={() => setIsEnmiendaModalOpen(true)}>
              <p className="inline-flex items-center gap-2">
                <FilePlus className="mr- w-4 h-4" /> Crear Enmienda
              </p>
            </Button>
            <a
              href={`/api/pacientes/${pacienteId}/atenciones/${atencionId}/reporteAten`}
              target="_blank"
              className="text-sm"
            >
              <Button variant="secondary" id="descargaPdf">
                <p className="inline-flex items-center gap-2">
                  <FileDown className="mr- w-4 h-4" /> Descargar PDF
                </p>
              </Button>
            </a>
          </>
        ) : (
          <>
            <a href={`/dashboard/pacientes/${$consulta.pacienteId}`} className="text-sm">
              <Button>
                <p className="inline-flex items-center gap-2">
                  <Table2 className=" w-4 h-4" /> Ficha del Paciente
                </p>
              </Button>
            </a>
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
          </>
        )}
      </div>

      {isModalOpen && (
        <ModalReact
          title="Confirmar Finalización de Consulta"
          onClose={() => setIsModalOpen(false)}
          id="confirmarFinalizacionModal"
          className="w-[500px]"
        >
          <div className="p-4 flex flex-col items-center text-center">
            <TriangleAlert className="w-16 h-16 text-yellow-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Atención</h2>
            <p className="text-gray-600 mb-6">
              Al finalizar la consulta, el registro se sellará y no podrá ser modificado
              directamente. Cualquier cambio futuro deberá realizarse mediante una enmienda.
            </p>
            <div className="flex justify-center gap-4 w-full">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleConfirmarFinalizacion}>
                Confirmar Finalización
              </Button>
            </div>
          </div>
        </ModalReact>
      )}

      {isEnmiendaModalOpen && (
        <ModalReact
          title="Crear Nueva Enmienda"
          onClose={() => setIsEnmiendaModalOpen(false)}
          id="enmiendaModal"
        >
          <FormularioEnmienda
            atencionId={atencionId}
            onClose={() => setIsEnmiendaModalOpen(false)}
          />
        </ModalReact>
      )}
    </>
  );
}
