import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { consultaStore } from '@/context/consultaAtencion.store';
import { getDurationInMinutes, getFechaEnMilisegundos } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import {
  Edit3, FileDown, FileEdit, Lock, Mail, MoreVertical, Printer, Save, Table2, TriangleAlert, Wallet, MessageSquare
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import FormularioEnmienda from '@/pages/dashboard/consultas/aperturaPaciente/[pacienteId]/componenteAtencionV2/FormularioEnmienda';

// Tipos de las props que el componente recibirá desde Astro
type PacienteData = {
  nombre: string;
  apellido: string;
  dni: string;
  fotoUrl?: string | null;
  sexo?: string;
  celular?: string;
  email?: string;
  obraSocial?: string;
  fNacimiento?: Date;
  domicilio?: string;
};

type Props = {
  pacienteData: PacienteData;
  esFinalizada: boolean;
  pacienteId: string;
  atencionId: string;
};

// El nuevo componente de React que contiene toda la lógica del header
export default function NavAtencionMedicaV2({ pacienteData, esFinalizada, pacienteId, atencionId }: Props) {
  const $consulta = useStore(consultaStore);

  // Estados para manejar la UI dinámica
  const [isFinalized, setIsFinalized] = useState(esFinalizada);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnmiendaModalOpen, setIsEnmiendaModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { nombre, apellido, dni, fotoUrl } = pacienteData;
  const avatarDefault = '/avatarDefault.png'; // Ruta pública del avatar

  // Efecto para cerrar el dropdown al hacer clic fuera
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

  // Lógica para guardar y finalizar la consulta (movida aquí)
  const handleGuardarBorrador = async (modoFetch: 'borrador' | 'finalizada') => {
    if (!$consulta.motivoInicial) {
      showToast('Debe ingresar un motivo inicial', { background: 'bg-red-500' });
      return false;
    }
    try {
      let dataToSave = { ...consultaStore.get() };
      if (modoFetch === 'finalizada') {
        const finAtencion = new Date(getFechaEnMilisegundos());
        const now = finAtencion.toISOString();
        dataToSave = {
          ...dataToSave,
          finAtencion: now,
          duracionAtencion: getDurationInMinutes(dataToSave.inicioAtencion, now) || 0,
          estado: 'finalizada',
        };
      }
      const response = await fetch('/api/atencion/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dataToSave, status: modoFetch }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error en el servidor');
      consultaStore.set(dataToSave);
      const successMessage = modoFetch === 'finalizada' ? 'Consulta finalizada y guardada' : 'Borrador guardado con éxito';
      showToast(successMessage, { background: 'bg-green-500' });
      return true;
    } catch (error: any) {
      console.error('Error al guardar la consulta:', error);
      showToast(`Error al guardar: ${error.message}`, { background: 'bg-primary-400' });
      return false;
    }
  };

  const handleFinalizarClick = () => setIsModalOpen(true);

  const handleConfirmarFinalizacion = async () => {
    const success = await handleGuardarBorrador('finalizada');
    setIsModalOpen(false);
    if (success) {
      setIsFinalized(true); // ¡Este cambio de estado ahora re-renderizará todo el header!
    }
  };

  // Renderizado condicional del header completo
  return isFinalized ? (
    // ====== HEADER FINALIZADO ====== 
    <div className="bg-gradient-to-r from-indigo-950 to-slate-900 shadow-md rounded-b-lg sticky top-0 z-10 border-b border-x p-2 border-slate-700">
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-4 flex-shrink-0">
          <img src={fotoUrl || avatarDefault} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover hidden md:block border-2 border-slate-600" />
          <div>
            <h1 className="text-2xl capitalize font-semibold text-white">{nombre} {apellido}</h1>
            <p className="text-lg text-gray-300">DNI: {dni}</p>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="px-4 py-1 bg-slate-700/50 text-sky-300 rounded-full text-sm font-semibold border border-sky-400/30">
            CONSULTA FINALIZADA
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            <a href={`/dashboard/pacientes/${pacienteId}`} className="text-sm" title="Ver ficha completa del paciente">
              <Button variant="ghost" className="text-white hover:bg-slate-700/50">
                <p className="inline-flex items-center gap-2"><Table2 className="w-4 h-4" /> Ficha</p>
              </Button>
            </a>
            <Button id="crearEnmienda" variant="ghost" className="text-white hover:bg-slate-700/50" onClick={() => setIsEnmiendaModalOpen(true)} title="Crear Enmienda">
              <p className="inline-flex items-center gap-2"><Edit3 className="w-4 h-4" /> Enmienda</p>
            </Button>
            <div className="relative" ref={dropdownRef}>
              <Button variant="ghost" className="text-white hover:bg-slate-700/50" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Más acciones">
                <MoreVertical className="w-5 h-5" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-800 rounded-md shadow-lg z-20 border border-slate-700">
                  <ul className="py-1 text-slate-200">
                    <li className="px-4 py-2 text-sm font-semibold text-slate-400 border-b border-slate-700">Más Acciones</li>
                    <li title="Descargar PDF de la atención completa" className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                        <a href={`/api/pacientes/${pacienteId}/atenciones/${atencionId}/reporteAten`} target="_blank" className="inline-flex items-center w-full">
                            <FileDown className="w-4 h-4 mr-3" /> Descargar PDF
                        </a>
                    </li>
                    <li title="Enviar resumen por Email" className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                      <Mail className="w-4 h-4 mr-3" /> Enviar por Mail
                    </li>
                    <li title="Abrir chat de WhatsApp" className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-3" /> Enviar por WhatsApp
                    </li>
                    <li title="Generar PDF para imprimir" className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                      <Printer className="w-4 h-4 mr-3" /> Imprimir Receta
                    </li>
                    <li title="Crear registro de facturación" className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                      <Wallet className="w-4 h-4 mr-3" /> Facturar Consulta
                    </li>
                  </ul>
                </div>
              )}
            </div>
        </div>
      </div>
       {isEnmiendaModalOpen && (
        <ModalReact icon={<FileEdit className="h-6 w-6 text-primary-100" />} title={'Formulario de Enmienda Médica'} onClose={() => setIsEnmiendaModalOpen(false)} id="enmiendaModal">
          <FormularioEnmienda atencion={$consulta.atencion} paciente={$consulta.paciente} onClose={() => setIsEnmiendaModalOpen(false)} />
        </ModalReact>
      )}
    </div>
  ) : (
    // ====== HEADER EN CURSO ====== 
    <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-b-lg sticky top-0 z-10 border-b border-x p-2 border-gray-200">
        <div className="flex md:items-center flex-col md:flex-row justify-between gap-2 w-full">
            <div className="flex items-center gap-4">
                <img src={fotoUrl || avatarDefault} alt="Foto de perfil" className="h-16 w-16 rounded-full object-cover hidden md:block" />
                <div>
                    <h1 className="text-2xl capitalize font-semibold text-gray-800">{nombre} {apellido}</h1>
                    <p className="text-lg text-gray-500">DNI: {dni}</p>
                </div>
            </div>
            <div className="hidden md:flex border- px-3 w-fit flex-1 md:items-center text-sm h-full font- justify-evenly flex-wrap gap-4">
                <div className="flex items-start capitalize text-sm flex-col"><p>Sexo:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.sexo}</span></div>
                <div className="flex items-start capitalize text-sm flex-col"><p>Celular:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.celular}</span></div>
                <div className="flex items-start capitalize text-sm flex-col"><p>Email:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.email}</span></div>
                <div className="flex items-start capitalize text-sm flex-col"><p>Obra Social:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.obraSocial}</span></div>
                <div className="flex items-start capitalize text-sm flex-col"><p>Fecha de Nacimiento:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.fNacimiento?.toLocaleDateString()}</span></div>
                <div className="flex items-start capitalize text-sm flex-col"><p>Domicilio:</p><span className="font-normal text-primary-textoTitle text-base">{pacienteData.domicilio}</span></div>
            </div>
            <div className="flex md:flex-col flex-row w-full md:w-fit items-center gap-2">
                <a href={`/dashboard/pacientes/${pacienteId}`} className="text-sm"><Button><p className="inline-flex items-center gap-2"><Table2 className="w-4 h-4" /> Ficha Paciente</p></Button></a>
                <Button id="guardarBorradorV2" onClick={() => handleGuardarBorrador('borrador')}><p className="inline-flex items-center gap-2"><Save className="w-4 h-4" /> Guardar Borrador</p></Button>
                <Button id="finalizarConsultaV2" onClick={handleFinalizarClick}><p className="inline-flex items-center gap-2"><Lock className="w-4 h-4" /> Finalizar Consulta</p></Button>
            </div>
        </div>
        {isModalOpen && (
            <ModalReact title="Confirmar Finalización de Consulta" onClose={() => setIsModalOpen(false)} id="confirmarFinalizacionModal" className="w-[60vw]">
                <div className="p-4 flex flex-col items-center text-center">
                    <TriangleAlert className="w-16 h-16 text-yellow-400 mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Atención</h2>
                    <p className="text-gray-600 mb-6">Al finalizar la consulta, el registro se sellará y no podrá ser modificado directamente. Cualquier cambio futuro deberá realizarse mediante una enmienda.</p>
                    <div className="flex justify-center gap-4 w-full">
                        <Button onClick={() => setIsModalOpen(false)} variant="secondary">Cancelar</Button>
                        <Button onClick={handleConfirmarFinalizacion}>Confirmar Finalización</Button>
                    </div>
                </div>
            </ModalReact>
        )}
    </div>
  );
}
