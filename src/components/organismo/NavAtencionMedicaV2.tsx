import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { consultaStore } from '@/context/consultaAtencion.store';

import { preferenciaPerfilUserStore } from '@/context/preferenciasPerfilUser.store';
import FormularioEnmienda from '@/pages/dashboard/consultas/aperturaPaciente/[pacienteId]/componenteAtencionV2/FormularioEnmienda';
import { getDurationInMinutes, getFechaEnMilisegundos } from '@/utils/timesUtils';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import {
  Edit3,
  FileDown,
  FileEdit,
  FileText,
  Lock,
  Mail,
  MessageSquare,
  Printer,
  Save,
  Table2,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FormularioCertificadoAtencion from './FormularioCertificadoAtencion';
import MenuDropbox from './MenuDropbox';

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
  preferenciasPerfilUser: any;
  pacienteData: PacienteData;
  esFinalizada: boolean;
  pacienteId: string;
  atencionId: string;
  turnoId: string;
};

// El nuevo componente de React que contiene toda la lógica del header
export default function NavAtencionMedicaV2({
  pacienteData,
  esFinalizada,
  preferenciasPerfilUser,
  pacienteId,
  atencionId,
  turnoId,
}: Props) {
  const $consulta = useStore(consultaStore);

  useEffect(() => {
    if (preferenciasPerfilUser) {
      preferenciaPerfilUserStore.set({
        ...preferenciasPerfilUser,
        preferencias: preferenciasPerfilUser.preferencias,
      });
    }
    console.log('preferenciasPerfilUser en el nav', preferenciasPerfilUser);
  }, [preferenciasPerfilUser]);

  // Estados para manejar la UI dinámica
  const [isFinalized, setIsFinalized] = useState(esFinalizada);
  const [isAnimating, setIsAnimating] = useState(false); // <-- Nuevo estado para la animación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnmiendaModalOpen, setIsEnmiendaModalOpen] = useState(false);
  const [isCertificadoModalOpen, setIsCertificadoModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { nombre, apellido, dni, fotoUrl } = pacienteData;
  const avatarDefault = '/avatarDefault.png'; // Ruta pública del avatar

  const menuItems = [
    {
      label: 'Descargar Atencion',
      icon: <FileDown className="w-4 h-4" />,
      href: `/api/pacientes/${pacienteId}/atenciones/${atencionId}/reporteAten`,
      target: '_blank',
      title: 'Descargar PDF de la atención completa',
    },
    {
      label: 'Enviar por Mail',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => {
        console.log('enviando por mail...');
      },
      title: 'Enviar PDF de la atención completa por mail',
    },
    {
      label: 'Enviar por WhatsApp',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => {
        console.log('enviando por whatsapp...');
      },
      title: 'Enviar PDF de la atención completa por whatsapp',
    },
    {
      label: 'Imprimir Receta',
      icon: <Printer className="w-4 h-4" />,
      href: `/api/recetas/${atencionId}/pdf`,

      target: '_blank',
      title: 'Imprimir receta de la atención',
    },
    {
      label: 'Generar Certificado',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => setIsCertificadoModalOpen(true),
      title: 'Generar un certificado médico para el paciente',
    },
    {
      label: 'Facturar Consulta',
      icon: <FileDown className="w-4 h-4" />,
      onClick: () => {
        console.log('facturando...');
      },
      title: 'Facturar la atención',
    },
  ];

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

  // Lógica para guardar y finalizar la consulta
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

      // LA SOLUCIÓN: Actualizamos el store con los datos que guardamos, pero añadiendo el ID que nos devolvió el servidor.
      const finalData = {
        ...dataToSave,
        id: result.atencionId, // Usamos el ID de la respuesta de la API
        turnoId: result.turnoId,
      };
      consultaStore.set(finalData);
      const successMessage =
        modoFetch === 'finalizada'
          ? 'Consulta finalizada y guardada'
          : 'Borrador guardado con éxito';
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
      // Inicia la animación y el cambio de estado
      consultaStore.set({
        ...consultaStore.get(),
        estado: 'finalizada',
      });
      setIsFinalized(true);
      setIsAnimating(true);
      setIsFinalized(true); // Renderiza el header final debajo de la animación

      // Después de 1.5 segundos, quita la animación
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
    }
  };

  return (
    <div
      id="navAtencionMedica"
      className={` p-4 duration-300 ${isFinalized ? 'bg-gradient-to-r text-white from-primary-100 to-primary-150 shadow-md rounded-b-lg sticky top-0 z-10 border-b border-x p-2 border-slate-700' : 'bg-white/90 shadow-sm rounded-b-lg sticky top-0 z-10 border-b border-x p-2 border-gray-200'}`}
    >
      {isAnimating && (
        <div className="fixed w-full h-full inset-0 bg-slate-100/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-b-lg">
          <div className="text-center">
            <Lock className="w-24 h-24 text-indigo-600 inline-block animate-bounce" />
            <p className="text-lg font-semibold text-indigo-700 mt-2">Consulta Sellada</p>
          </div>
        </div>
      )}

      <div className="flex md:items-center flex-col md:flex-row justify-between gap-2 w-full">
        <div className="flex items-center gap-4">
          <img
            src={fotoUrl || avatarDefault}
            alt="Foto de perfil"
            className="h-16 w-16 rounded-full object-cover hidden md:block"
          />
          <div>
            <h1 className="text-2xl capitalize font-semibold ">
              {nombre} {apellido}
            </h1>
            <p className="text-lg ">DNI: {dni}</p>
          </div>
        </div>
        {isFinalized ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="px-4 py-1 bg-slate-700/50 text-sky-300 rounded-full text-sm font-semibold border border-sky-400/30">
              CONSULTA FINALIZADA
            </div>
          </div>
        ) : (
          <div className="hidden md:flex border- px-3 w-fit flex-1 md:items-center text-sm h-full font- justify-evenly flex-wrap gap-4">
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Sexo:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.sexo}
              </span>
            </div>
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Celular:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.celular}
              </span>
            </div>
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Email:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.email}
              </span>
            </div>
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Obra Social:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.obraSocial}
              </span>
            </div>
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Fecha de Nacimiento:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.fNacimiento?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-start capitalize text-sm flex-col">
              <p>Domicilio:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.domicilio}
              </span>
            </div>
          </div>
        )}

        {/* BOTONERA */}
        {isFinalized ? (
          <div className="flex items-center  flex-shrink-0">
            <a
              href={`/dashboard/pacientes/${pacienteId}`}
              className="text-sm text-primary-textoTitle "
              title="Ver ficha completa del paciente"
            >
              <Button variant="blanco" className="rounded-r-none">
                <p className="inline-flex items-center gap-2">
                  <Table2 className="w-4 h-4" /> Ficha
                </p>
              </Button>
            </a>
            <Button
              id="crearEnmienda"
              variant="blanco"
              className="rounded-none border-x text-primary-textoTitle"
              onClick={() => setIsEnmiendaModalOpen(true)}
              title="Crear Enmienda"
            >
              <p className="inline-flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Enmienda
              </p>
            </Button>
            <MenuDropbox items={menuItems} />
          </div>
        ) : (
          <div className="flex md:flex-col flex-row w-full md:w-fit items-center gap-2">
            <a href={`/dashboard/pacientes/${pacienteId}`} className="text-sm w-full">
              <Button variant="primary" className="w-full ">
                <p className="inline-flex items-center gap-2">
                  <Table2 className="w-4 h-4" /> Ficha Paciente
                </p>
              </Button>
            </a>
            <Button
              variant="primary"
              id="guardarBorradorV2"
              onClick={() => handleGuardarBorrador('borrador')}
            >
              <p className="inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar Borrador
              </p>
            </Button>
            <Button variant="primary" id="finalizarConsultaV2" onClick={handleFinalizarClick}>
              <p className="inline-flex items-center gap-2">
                <Lock className="w-4 h-4" /> Finalizar Consulta
              </p>
            </Button>
          </div>
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
      {isCertificadoModalOpen && (
        <ModalReact
          icon={<FileText className="h-6 w-6 text-primary-100" />}
          title={'Generar Certificado Médico'}
          onClose={() => setIsCertificadoModalOpen(false)}
          id="certificadoModal"
        >
          <FormularioCertificadoAtencion
            paciente={$consulta.paciente}
            onClose={() => setIsCertificadoModalOpen(false)}
          />
        </ModalReact>
      )}
    </div>
  );
}
