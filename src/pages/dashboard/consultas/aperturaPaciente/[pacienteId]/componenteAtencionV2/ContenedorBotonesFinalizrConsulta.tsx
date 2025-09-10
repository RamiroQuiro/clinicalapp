import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { consultaStore } from '@/context/consultaAtencion.store';
import { getDurationInMinutes, getFechaEnMilisegundos } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Edit3, FileDown, FileEdit, Lock, Save, Table2, TriangleAlert } from 'lucide-react';
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

  const [isFinalized, setIsFinalized] = useState(esFinalizada);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnmiendaModalOpen, setIsEnmiendaModalOpen] = useState(false);

  const handleGuardarBorrador = async (modoFetch: 'borrador' | 'finalizada') => {
    if (
      !$consulta.motivoInicial
    ) {
      showToast('Debe ingresar un motivo inicial', { background: 'bg-red-500' });
      return false;
    }

    try {
      let dataToSave = { ...consultaStore.get() };

      if (modoFetch === 'finalizada') {
        const finAtencion = new Date(getFechaEnMilisegundos());
        const now = finAtencion.toISOString();
        let duracion = 0;

        if (dataToSave.inicioAtencion) {
          duracion = getDurationInMinutes(dataToSave.inicioAtencion, now) || 0;
        } else {
          console.warn('inicioConsulta no está definido. No se pudo calcular la duración.');
        }

        dataToSave = {
          ...dataToSave,
          finAtencion: now,
          duracionAtencion: duracion,
          estado: 'finalizada',
        };
      }

      const response = await fetch('/api/atencion/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dataToSave,
          status: modoFetch,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor');

      consultaStore.set(dataToSave);

      const successMessage =
        modoFetch === 'finalizada'
          ? 'Consulta finalizada y guardada'
          : 'Borrador guardado con éxito';
      showToast(successMessage, { background: 'bg-green-500' });

      return true;
    } catch (error) {
      console.error('Error al guardar la consulta:', error);
      showToast(`Error al guardar: ${error.message}`, { background: 'bg-primary-400' });
      return false;
    }
  };

  const handleFinalizarClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmarFinalizacion = async () => {
    const success = await handleGuardarBorrador('finalizada');
    setIsModalOpen(false);
    if (success) {
      setIsFinalized(true);
      window.dispatchEvent(new CustomEvent('consulta-finalizada'));
    }
  };

  return (
    <>
      <div className="flex md:flex-col flex-row w-full md:w-fit md:items-center gap-2">
        <a href={`/dashboard/pacientes/${pacienteId}`} className="text-sm">
          <Button>
            <p className="inline-flex items-center gap-2">
              <Table2 className=" w-4 h-4" /> Ficha Paciente
            </p>
          </Button>
        </a>
        {isFinalized ? (
          <>
            <Button
              id="crearEnmienda"
              variant="bgTransparent"
              onClick={() => setIsEnmiendaModalOpen(true)}
            >
              <p className="inline-flex items-center gap-2">
                <Edit3 className="mr- w-4 h-4" />
                Enmienda
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
          className="w-[60vw]"
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
              <Button onClick={handleConfirmarFinalizacion}>Confirmar Finalización</Button>
            </div>
          </div>
        </ModalReact>
      )}

      {isEnmiendaModalOpen && (
        <ModalReact
          icon={<FileEdit className="h-6 w-6 text-primary-100" />}
          title={'Formulario de Enmienda Médica'}
          onClose={() => setIsEnmiendaModalOpen(false)}
          id="enmiendaModal"
        >
          <FormularioEnmienda
            atencion={$consulta.atencion}
            paciente={$consulta.paciente}
            onClose={() => setIsEnmiendaModalOpen(false)}
          />
        </ModalReact>
      )}
    </>
  );
}