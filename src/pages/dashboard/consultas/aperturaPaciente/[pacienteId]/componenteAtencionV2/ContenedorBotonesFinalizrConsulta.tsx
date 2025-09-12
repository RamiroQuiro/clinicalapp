import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { consultaStore } from '@/context/consultaAtencion.store';
import { getDurationInMinutes, getFechaEnMilisegundos } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import {
  Edit3,
  FileDown,
  FileEdit,
  Lock,
  Mail,
  MessageSquare,
  MoreVertical,
  Printer,
  Save,
  Table2,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const opcionesBotones = [
    {
      id: 'descargaPdf',
      icon: <FileDown className="mr- w-4 h-4" />,
      label: 'PDF',
      onClick: () => {},
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
    {
      id: 'recetaMedica',
      icon: <FileEdit className="mr- w-4 h-4" />,
      label: 'Receta Medica',
      onClick: () => {
        window.open(`/dashboard/pacientes/${pacienteId}/atenciones/${atencionId}/receta`, '_blank');
      },
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
    {
      id: 'enviarMail',
      icon: <Mail className="mr- w-4 h-4" />,
      label: 'Mail',
      onClick: () => {
        window.open(`/dashboard/pacientes/${pacienteId}/atenciones/${atencionId}/mail`, '_blank');
      },
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
    {
      id: 'enviarWhatsApp',
      icon: <MessageSquare className="mr- w-4 h-4" />,
      label: 'WhatsApp',
      onClick: () => {
        window.open(
          `/dashboard/pacientes/${pacienteId}/atenciones/${atencionId}/whatsapp`,
          '_blank'
        );
      },
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
    {
      id: 'imprimirReceta',
      icon: <Printer className="mr- w-4 h-4" />,
      label: 'Imprimir Receta',
      onClick: () => {},
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
    {
      id: 'facturarConsulta',
      icon: <Wallet className="mr- w-4 h-4" />,
      label: 'Facturar Consulta',
      onClick: () => {},
      variant: 'ghost',
      className: 'text-white hover:bg-slate-700/50',
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleGuardarBorrador = async (modoFetch: 'borrador' | 'finalizada') => {
    setIsLoading(true);
    if (!$consulta.motivoInicial) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizarClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmarFinalizacion = async () => {
    const success = await handleGuardarBorrador('finalizada');
    setIsLoading(false);
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
          <div className="flex  bg- rounded-lg flex-row w-full md:w-fit md:items-center gap">
            <Button
              id="crearEnmienda"
              variant="blanco"
              className="text- rounded-r-none hover:bg-slate-700/50 border-r border-slate-700"
              onClick={() => setIsEnmiendaModalOpen(true)}
              title="Crear Enmienda"
            >
              <p className="inline-flex items-center gap-2">
                <Edit3 className="mr- w-4 h-4" />
                Enmienda
              </p>
            </Button>

            {/* Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="blanco"
                className="text- border-l border-slate-700 rounded-l-none hover:bg-slate-700/50"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="Más acciones"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-800 rounded-md shadow-lg z-20 border border-slate-700">
                  <ul className="py-1 text-slate-200">
                    <li className="px-4 py-2 text-sm font-semibold text-slate-400 border-b border-slate-700">
                      Más Acciones
                    </li>
                    {opcionesBotones.map(opcion => (
                      <li
                        key={opcion.id}
                        title={opcion.label}
                        onClick={opcion.onClick}
                        className="flex items-center gap-2 space-x-2 px-4 py-2 hover:bg-slate-700 cursor-pointer"
                      >
                        {opcion.icon}
                        {opcion.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
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
          <div className="p-4 flex flex-col w-[50vw] items-center text-center">
            <TriangleAlert className="w-16 h-16 text-yellow-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Atención</h2>
            <p className="text-gray-600 mb-6">
              Al finalizar la consulta, el registro se sellará y no podrá ser modificado
              directamente. Cualquier cambio futuro deberá realizarse mediante una enmienda.
            </p>
            <div className="flex justify-center gap-4 w-full">
              <Button onClick={() => setIsModalOpen(false)} variant="cancel">
                Cancelar
              </Button>
              <Button onClick={handleConfirmarFinalizacion} disabled={isLoading}>
                {isLoading ? 'Finalizando...' : 'Confirmar Finalización'}
              </Button>
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
