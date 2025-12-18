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
  const [waOpen, setWaOpen] = useState(false);
  const [waUsarFicha, setWaUsarFicha] = useState<'ficha' | 'otro'>('ficha');
  const [waCelular, setWaCelular] = useState('');
  const [waMensaje, setWaMensaje] = useState('');
  const [waSlot, setWaSlot] = useState<any>(null);
  const onlyDigits = (s: string) => (s || '').replace(/\D+/g, '');

  function formateoNumeroWhatsapp(raw: string, country: 'AR' = 'AR') {
    const digits = onlyDigits(raw);
    if (!digits) return '';
    if (country === 'AR') {
      let n = digits.replace(/^0+/, '').replace(/^15/, '');
      if (!n.startsWith('54')) n = '54' + n;
      return n;
    }
    return digits;
  }

  function buildWhatsAppLink(phone: string, message: string) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  useEffect(() => {
    if (preferenciasPerfilUser) {
      preferenciaPerfilUserStore.set({
        ...preferenciasPerfilUser,
        preferencias: preferenciasPerfilUser.preferencias,
      });
    }
    // console.log('preferenciasPerfilUser en el nav', preferenciasPerfilUser);
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
        const nombre = [pacienteData?.nombre, pacienteData?.apellido].filter(Boolean).join(' ') || 'Paciente';
        const urlPDF = `/api/pacientes/${pacienteId}/atenciones/${atencionId}/reporteAten`;
        const msg = `Hola ${nombre} 👋

Te compartimos el enlace de tu atención médica:
${location.origin}${urlPDF}

Cualquier duda, respondé este mensaje.`;
        setWaCelular(pacienteData?.celular || '');
        setWaMensaje(msg);
        setWaUsarFicha(pacienteData?.celular ? 'ficha' : 'otro');
        setWaOpen(true);
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
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-slate-100/50 backdrop-blur-sm rounded-b-lg w-full h-full">
          <div className="text-center">
            <Lock className="inline-block w-24 h-24 text-indigo-600 animate-bounce" />
            <p className="mt-2 font-semibold text-indigo-700 text-lg">Consulta Sellada</p>
          </div>
        </div>
      )}

      <div className="flex md:flex-row flex-col justify-between md:items-center gap-2 w-full">
        <div className="flex items-center gap-4">
          <img
            src={fotoUrl || avatarDefault}
            alt="Foto de perfil"
            className="hidden md:block rounded-full w-16 h-16 object-cover"
          />
          <div>
            <h1 className="font-semibold text-2xl capitalize">
              {nombre} {apellido}
            </h1>
            <p className="text-lg">DNI: {dni}</p>
          </div>
        </div>
        {isFinalized ? (
          <div className="flex flex-grow justify-center items-center">
            <div className="bg-slate-700/50 px-4 py-1 border border-sky-400/30 rounded-full font-semibold text-sky-300 text-sm">
              CONSULTA FINALIZADA
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-wrap flex-1 justify-evenly md:items-center gap-4 px-3 border- w-fit h-full font- text-sm">
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Sexo:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.sexo}
              </span>
            </div>
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Celular:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.celular}
              </span>
            </div>
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Email:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.email}
              </span>
            </div>
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Obra Social:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.obraSocial}
              </span>
            </div>
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Fecha de Nacimiento:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.fNacimiento?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col items-start text-sm capitalize">
              <p>Domicilio:</p>
              <span className="font-normal text-primary-textoTitle text-base">
                {pacienteData.domicilio}
              </span>
            </div>
          </div>
        )}

        {/* BOTONERA */}
        {isFinalized ? (
          <div className="flex flex-shrink-0 items-center">
            <a
              href={`/dashboard/pacientes/${pacienteId}`}
              className="text-primary-textoTitle text-sm"
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
              className="border-x rounded-none text-primary-textoTitle"
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
          <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-fit">
            <a href={`/dashboard/pacientes/${pacienteId}`} className="w-full text-sm">
              <Button variant="primary" className="w-full">
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
          <div className="flex flex-col items-center p-4 text-center">
            <TriangleAlert className="mb-4 w-16 h-16 text-yellow-400" />
            <h2 className="mb-2 font-semibold text-lg">Atención</h2>
            <p className="mb-6 text-gray-600">
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
          icon={<FileEdit className="w-6 h-6 text-primary-100" />}
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
          icon={<FileText className="w-6 h-6 text-primary-100" />}
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

      {
        waOpen &&
        <ModalReact
          title="Enviar WhatsApp"
          onClose={() => setWaOpen(false)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Número de teléfono</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={waUsarFicha === 'ficha'}
                    onChange={() => setWaUsarFicha('ficha')}
                    disabled={!pacienteData?.celular}
                  />
                  <span>
                    Usar ficha {pacienteData?.celular ? `(${pacienteData.celular})` : '(no disponible)'}
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={waUsarFicha === 'otro'}
                    onChange={() => setWaUsarFicha('otro')}
                  />
                  <span>Ingresar otro</span>
                </label>
              </div>
              <input
                type="tel"
                className="p-2 border rounded w-full"
                placeholder="Ej: 3815123456"
                value={waUsarFicha === 'ficha' ? (pacienteData?.celular || '') : waCelular}
                onChange={e => setWaCelular(e.target.value)}
                disabled={waUsarFicha === 'ficha'}
              />
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Mensaje</p>
              <textarea
                className="p-2 border rounded w-full min-h-[140px]"
                value={waMensaje}
                onChange={e => setWaMensaje(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant='cancel' onClick={() => setWaOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={() => {
                  const candidate = waUsarFicha === 'ficha' ? (pacienteData?.celular || '') : waCelular;
                  const phone = formateoNumeroWhatsapp(candidate, 'AR');
                  if (!phone) return;
                  const link = buildWhatsAppLink(phone, waMensaje);
                  window.open(link, '_blank');
                  setWaOpen(false);
                }}
                disabled={(waUsarFicha === 'ficha' && !pacienteData?.celular) || (waUsarFicha === 'otro' && !waCelular)}
              >
                Enviar por WhatsApp
              </Button>
            </div>
          </div>
        </ModalReact>
      }
    </div>
  );
}
