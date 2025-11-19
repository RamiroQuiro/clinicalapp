import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { CalendarDays, CheckCircle, Clock, MessageCircle, MoreVertical, Phone, User, X } from 'lucide-react';
import type { MenuItem } from '../MenuDropbox';
import MenuDropbox from '../MenuDropbox';

interface TurnoCardProps {
  slot: any;
  onVerDetalles: (slot: any) => void;
  onReagendar: (slot: any) => void;
  onCancelar: (slot: any) => void;
  onLlamar: (slot: any) => void;
  onWhatsApp: (slot: any) => void;
}
const getStatusInfo = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'confirmado':
      return { text: 'Confirmado', colorClass: 'bg-green-100 text-green-800' };
    case 'pendiente':
      return { text: 'Pendiente', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'cancelado':
      return { text: 'Cancelado', colorClass: 'bg-red-100 text-red-800' };
    default:
      return { text: estado, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

function TurnoCard({
  slot,
  onVerDetalles,
  onReagendar,
  onCancelar,
  onLlamar,
  onWhatsApp,
}: TurnoCardProps) {
  const itemsMenuTurno: MenuItem[] = [
    {
      label: 'Reagendar turno',
      icon: <CalendarDays className="w-4 h-4" />,
      onClick: () => onReagendar(slot),
      type: 'button',
    },
    {
      label: 'Llamar al paciente',
      icon: <Phone className="w-4 h-4" />,
      onClick: () => onLlamar(slot),
      type: 'button',
    },
    {
      label: 'Enviar WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      onClick: () => onWhatsApp(slot),
      type: 'button',
    },
    {
      isSeparator: true,
    },
    {
      label: 'Cancelar turno',
      icon: <X className="w-4 h-4" />,
      onClick: () => onCancelar(slot),
      type: 'button',
    },
  ];
  const statusInfo = getStatusInfo(slot.turnoInfo?.estado);


  return (
    <div className="group relative">
      <div className="flex items-start justify-center  gap-3 p-3 rounded-lg border border-gray-200/50 bg-primary-bg-componentes hover:bg-white/10 transition-all duration-300 hover:border-primary-100/30 hover:shadow-lg">
        {/* Indicador de tiempo */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-white border-primary-100/30 font-bold shadow-sm  border br flex flex-col items-center justify-center text-wite">
            <Clock className="w-5 h-5 mb-1 " />
            <span className="text-xs font-bold leading-none">
              {formatUtcToAppTime(slot.hora, 'HH:mm')}
            </span>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="flex-grow min-w-0 gap-2 flex flex-col items-start ">
          <div className="flex items-start justify-between  w-full">
            <div className='flex gap-2 items-center justify-start'>

              <p className="font-semibold text-primary-textoTitle  capitalize truncate text-lg">
                {slot.turnoInfo?.pacienteNombre + ' ' + slot.turnoInfo?.pacienteApellido ||
                  'Paciente no asignado'}
              </p>
              <p className="text-xs text-primary-texto">
                {slot.turnoInfo?.pacienteDocumento}
              </p>
            </div>
            <div className="flex items-center gap-2">

              <MenuDropbox
                items={itemsMenuTurno}
                triggerIcon={<MoreVertical className="w-4 h-4" />}
                triggerTitle="Acciones del turno"
                buttonClassName="!p-1 border-0 rounded-full !min-h-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                closeOnSelect={true}
              />
            </div>
          </div>

          <div className="flex items-end flex-wrap justify-between w-full gap-3 text-sm text-primary-texto">
            <div className="flex items-end  justify-start flex-1 gap-3 text-sm text-primary-texto">
              <span className="flex items-center gap-1 text- uppercase">
                <User className="w-5 h-5 font-semibold text-primary-100 " />
                {slot.turnoInfo?.profesionalNombre} {slot.turnoInfo?.profesionalApellido}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary-100" />
                {slot.turnoInfo?.duracion || 30} min
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-primary-100" />
                {slot.turnoInfo?.tipoDeTurno}
              </span>
            </div>
            <div className={`text-xs font-medium border rounded-full px-3 py-1 ${statusInfo.colorClass}`}>
              {statusInfo.text}
            </div>
          </div>


          {/* Información adicional del turno */}
          {slot.turnoInfo?.motivoConsulta && (
            <p className="text-xs text-primary-texto mt-1 truncate">
              {slot.turnoInfo.motivoConsulta}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TurnoCard;
