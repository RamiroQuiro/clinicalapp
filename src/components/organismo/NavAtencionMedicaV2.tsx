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
  Info,
  Lock,
  Mail,
  MessageSquare,
  PhoneCall,
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
  alergias?: Array<{
    sustancia: string;
    reaccion: string;
    severidad: 'leve' | 'moderada' | 'grave';
    activa: boolean;
  }>;
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

  const { nombre, apellido, dni, fotoUrl, alergias } = pacienteData;
  const avatarDefault = '/avatarDefault.png'; // Ruta pública del avatar

  // Safe check for allergies array
  const hasAlergias = Array.isArray(alergias) && alergias.length > 0;

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
        const nombre =
          [pacienteData?.nombre, pacienteData?.apellido].filter(Boolean).join(' ') || 'Paciente';
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

      // Log para debugging
      console.log('Response status:', response.status);
      console.log('Response data:', result);

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
      console.error('Error completo al guardar:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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

  // Estado para mostrar/ocultar detalles (compact mode)
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Helper para edad
  const calculateAge = (dob?: Date) => {
    if (!dob) return '';
    try {
      const diffMs = Date.now() - new Date(dob).getTime();
      const ageDt = new Date(diffMs);
      return Math.abs(ageDt.getUTCFullYear() - 1970);
    } catch {
      return '';
    }
  };

  const edad = calculateAge(pacienteData.fNacimiento);

  // Construimos los items del menú de info dinámicamente
  const infoItems: any[] = [
    {
      label: 'Información de Contacto',
      isSeparator: false,
      type: 'button',
      onClick: () => {},
      icon: null,
    },
    { isSeparator: true },
    {
      label: pacienteData.celular || 'Sin celular',
      icon: <PhoneCall className="w-4 h-4 text-emerald-500" />,
      onClick: () => {
        if (pacienteData.celular) navigator.clipboard.writeText(pacienteData.celular);
      },
      title: 'Clic para copiar',
    },
    {
      label: pacienteData.email || 'Sin email',
      icon: <Mail className="w-4 h-4 text-blue-500" />,
      onClick: () => {
        if (pacienteData.email) navigator.clipboard.writeText(pacienteData.email);
      },
      title: 'Clic para copiar',
    },
    {
      label: pacienteData.domicilio || 'Sin domicilio',
      icon: <Table2 className="w-4 h-4 text-gray-500" />,
      onClick: () => {},
    },
    { isSeparator: true },
    {
      label: `Nacido el ${pacienteData.fNacimiento?.toLocaleDateString() || '-'}`,
      icon: <FileText className="w-4 h-4 text-gray-400" />,
      onClick: () => {},
    },
  ];

  // Si tiene alergias, las agregamos al menú
  if (hasAlergias) {
    infoItems.push({ isSeparator: true });
    // Agregamos las alergias al principio o en una sección destacada
    // Vamos a ponerlas al final de la lista de contacto o al principio? El usuario dijo "a lo sumo le agregaria ... alergias".
    // Mejor al principio del dropdown para que se vea rápido si abren el detalle.
    // O mejor, agregamos un header rojo.

    const alergiasItems = alergias.map(al => ({
      label: `${al.sustancia} (${al.severidad})`,
      icon: <TriangleAlert className="w-4 h-4 text-red-500" />,
      onClick: () => {},
      title: `Reacción: ${al.reaccion}`,
    }));

    infoItems.push({
      label: '⚠️ ALERGIAS Y ANTECEDENTES',
      isSeparator: false,
      type: 'button',
      onClick: () => {},
      icon: null,
    });
    infoItems.push(...alergiasItems);
  }

  return (
    <div
      id="navAtencionMedica"
      className={`transition-all duration-300 ${
        isFinalized
          ? 'bg-gradient-to-r from-primary-100 to-primary-150 text-white shadow-lg sticky top-0 z-20 border-b border-primary-bg-claro rounded-lg'
          : 'bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-gray-200'
      }`}
    >
      {isAnimating && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-slate-100/50 backdrop-blur-sm rounded-b-lg w-full h-full">
          <div className="text-center">
            <Lock className="inline-block w-24 h-24 text-indigo-600 animate-bounce" />
            <p className="mt-2 font-semibold text-indigo-700 text-lg">Consulta Sellada</p>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL: Flex Row Compacto */}
      <div className="flex justify-between items-center gap-2 px-4 py-3 w-full">
        {/* Center: Info Paciente Compacta */}
        <div className="flex items-center gap-3">
          {/* Avatar más pequeño */}
          <img
            src={fotoUrl || avatarDefault}
            alt="Foto"
            className="rounded-full w-9 h-9 border border-gray-200 object-cover"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1
                className={`font-bold text-lg leading-tight capitalize ${isFinalized ? 'text-white' : 'text-gray-800'}`}
              >
                {nombre} {apellido}
              </h1>
              {/* Badges de Info Básica */}
              <span
                className={`text-xs px-1.5 py-0.5 rounded border ${isFinalized ? 'border-indigo-400 bg-indigo-500/40 text-indigo-50' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
              >
                {edad} años
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded border hidden sm:block ${isFinalized ? 'border-indigo-400 bg-indigo-500/40 text-indigo-50' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
              >
                DNI {dni}
              </span>

              {/* BADGE ALERGIAS */}
              {hasAlergias && (
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 border rounded-full font-bold text-[10px] ${isFinalized ? 'bg-red-500/90 border-red-400 text-white' : 'bg-red-100 border-red-200 text-red-700 animate-pulse'}`}
                >
                  <TriangleAlert className="w-3 h-3" />
                  ALERGIAS
                </span>
              )}
            </div>

            {/* Fila secundaria colapsable (Toggle) */}
            <span className={isFinalized ? 'text-indigo-100' : 'text-gray-500'}>
              {pacienteData.obraSocial || 'Sin Obra Social'}
            </span>

            {/* Botón Info usando MenuDropbox */}
            <MenuDropbox
              className="bg-white border-gray-200 text-gray-700 w-72"
              triggerIcon={
                <div
                  className={`flex items-center gap-1 hover:underline ${isFinalized ? 'text-indigo-100 hover:text-white' : 'text-primary-600'}`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Ver detalles</span>
                </div>
              }
              triggerTitle="Ver información detallada"
              buttonClassName="p-0 h-auto bg-transparent border-none hover:bg-transparent shadow-none !rounded-none focus:ring-0"
              triggerIconClassName=""
              items={infoItems}
            />
          </div>
        </div>

        {/* CENTRO: Estado Finalizada (Solo si finalizada) - MEJORADO */}
        {isFinalized && (
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-lg">
              <Lock className="w-5 h-5 text-white" />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-sm tracking-wide">CONSULTA CERRADA</span>
                <span className="text-indigo-200 text-[10px]">Registro sellado</span>
              </div>
            </div>
          </div>
        )}

        {/* DERECHA: Botonera Compacta */}
        <div className="flex items-center gap-1">
          {isFinalized ? (
            <>
              <a href={`/dashboard/pacientes/${pacienteId}`} title="Ver ficha">
                <Button
                  variant="blanco"
                  className="px-2 py-1 h-8 text-xs bg-white/90  text-indigo-700 border-white/30"
                >
                  <Table2 className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Ficha</span>
                </Button>
              </a>
              <Button
                variant="blanco"
                className="px-2 py-1 h-8 text-xs bg-white/90 text-indigo-700 border-white/30"
                onClick={() => setIsEnmiendaModalOpen(true)}
                title="Crear Enmienda"
              >
                <Edit3 className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Enmienda</span>
              </Button>
              <MenuDropbox items={menuItems} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <a href={`/dashboard/pacientes/${pacienteId}`} title="Ficha Paciente">
                <Button
                  variant="secondary"
                  className="px-2 py-1 h-8 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border-none"
                >
                  <Table2 className="w-4 h-4 sm:mr-1" />
                  <span className="hidden lg:inline">Ficha</span>
                </Button>
              </a>
              <Button
                variant="secondary"
                className="px-2 py-1 h-8 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                onClick={() => handleGuardarBorrador('borrador')}
                title="Guardar Borrador"
              >
                <Save className="w-4 h-4 sm:mr-1" />
                <span className="hidden lg:inline">Guardar</span>
              </Button>
              <Button
                variant="primary"
                className="px-3 py-1 h-8 text-xs shadow-sm hover:shadow"
                onClick={handleFinalizarClick}
                title="Finalizar Consulta"
              >
                <Lock className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Finalizar</span>
              </Button>
            </div>
          )}
        </div>
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

      {waOpen && (
        <ModalReact title="Enviar WhatsApp" onClose={() => setWaOpen(false)}>
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
                    Usar ficha{' '}
                    {pacienteData?.celular ? `(${pacienteData.celular})` : '(no disponible)'}
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
                value={waUsarFicha === 'ficha' ? pacienteData?.celular || '' : waCelular}
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
              <Button variant="cancel" onClick={() => setWaOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const candidate =
                    waUsarFicha === 'ficha' ? pacienteData?.celular || '' : waCelular;
                  const phone = formateoNumeroWhatsapp(candidate, 'AR');
                  if (!phone) return;
                  const link = buildWhatsAppLink(phone, waMensaje);
                  window.open(link, '_blank');
                  setWaOpen(false);
                }}
                disabled={
                  (waUsarFicha === 'ficha' && !pacienteData?.celular) ||
                  (waUsarFicha === 'otro' && !waCelular)
                }
              >
                Enviar por WhatsApp
              </Button>
            </div>
          </div>
        </ModalReact>
      )}
    </div>
  );
}
