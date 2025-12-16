import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { Calendar, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import TurnoCard from './TurnoCard';

function TurnosSkeletonLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 border border-primary-border rounded-lg animate-pulse">
          <div className="flex justify-between items-center">
            <div className="bg-primary-texto/30 rounded w-1/4 h-5"></div>
            <div className="bg-primary-texto/30 rounded w-1/6 h-4"></div>
          </div>
          <div className="bg-primary-texto/30 mt-3 rounded w-1/2 h-4"></div>
        </div>
      ))}
    </div>
  );
}

export default function TurnosDelDia({
  agenda,
  diaSeleccionado,
  onChangeReagendar,
  handleCancelarTurno,
  isLoading,
}: {
  agenda: any;
  diaSeleccionado: Date;
  onChangeReagendar: (slot: any) => void;
  handleCancelarTurno: (slot: any) => void;
  isLoading: boolean;
}) {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<any>(null);
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

  // construir para agendar en google calendar
  function toGoogleDateTime(d: Date) {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const HH = String(d.getUTCHours()).padStart(2, '0');
    const MM = String(d.getUTCMinutes()).padStart(2, '0');
    const SS = String(d.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`;
  }

  function buildGoogleCalendarLink(start: Date, durationMin: number, title: string, details?: string, location?: string) {
    const end = new Date(start.getTime() + durationMin * 60000);
    const dates = `${toGoogleDateTime(start)}/${toGoogleDateTime(end)}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      dates,
      text: title,
      details: details || '',
      location: location || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const turnosOcupados = useMemo(() => {
    return agenda
      .map((agendaProf: any) => {
        return agendaProf.agenda
          .filter(
            (slot: any) => !slot.disponible && slot.turnoInfo !== null // Solo turnos, no licencias
          )
          .sort((a: any, b: any) => a.hora.localeCompare(b.hora));
      })
      .flat();
  }, [agenda]);



  // Handlers para las acciones del menú
  const handleVerDetalles = (slot: any) => {
    setTurnoSeleccionado(slot);

    // Aquí podrías abrir un modal de detalles
  };

  const handleReagendar = (slot: any) => {
    onChangeReagendar(slot);
  };

  const handleCancelar = async (slot: any) => {
    handleCancelarTurno(slot);
  };

  const handleLlamar = (slot: any) => {
    console.log('Llamar al paciente:', slot);
    // Integración con teléfono
  };

  const handleWhatsApp = (slot: any) => {
    const fechaTurno = new Date(slot.hora);
    const pacienteNombre =
      [slot.turnoInfo?.pacienteNombre, slot.turnoInfo?.pacienteApellido].filter(Boolean).join(' ') || 'Paciente';

    const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const horaFormateada = fechaTurno.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const duracion = slot.turnoInfo?.duracion || 30;
    const tituloEvento = `Consulta Médica - ${slot.turnoInfo?.profesionalNombre} ${slot.turnoInfo?.profesionalApellido}`;
    const detallesEvento = `Consulta de ${pacienteNombre}. Motivo: ${slot.turnoInfo?.motivoConsulta || ''}`.trim();
    const googleCalLink = buildGoogleCalendarLink(fechaTurno, duracion, tituloEvento, detallesEvento);


    const mensaje = `¡Hola ${pacienteNombre}! 👋

*Recordatorio de Turno Médico* 🏥

*Fecha:* ${fechaFormateada}
*Hora:* ${horaFormateada}
*Duración:* ${duracion} minutos
*Profesional:* Dr. ${slot.turnoInfo?.profesionalNombre} ${slot.turnoInfo?.profesionalApellido}

*Agregar a calendario:*
${googleCalLink}

Llegar 15 minutos antes. Confirmar asistencia respondiendo este mensaje.`;

    setWaSlot(slot);
    setWaCelular(slot.turnoInfo?.pacienteCelular || '');
    setWaMensaje(mensaje);
    setWaUsarFicha(slot.turnoInfo?.pacienteCelular ? 'ficha' : 'otro');
    setWaOpen(true);
  };
  const formattedDate = diaSeleccionado
    ? new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(diaSeleccionado)
    : 'Seleccione una fecha';

  if (turnosOcupados.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-300" />
          <h4 className="font-semibold text-primary-100 text-lg capitalize">{formattedDate}</h4>
        </div>

        {isLoading ? (
          <TurnosSkeletonLoader />
        ) : (
          <div className="py-12 text-center">
            <div className="flex justify-center items-center bg-gray-700/50 mx-auto mb-3 rounded-full w-16 h-16">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <p className="mb-1 font-medium text-gray-400">No hay turnos agendados</p>
            <p className="text-gray-500 text-sm">Los turnos aparecerán aquí cuando se agenden</p>
          </div>
        )}
      </div>
    );
  }
  if (turnosOcupados.length > 0) {
    return (
      <div className="w-full">
        {/* Header con contador */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-300" />
            <h4 className="font-semibold text-primary-100 text-lg capitalize">{formattedDate}</h4>
          </div>
          <span className="bg-primary-500/20 px-2 py-1 rounded-full font-medium text-primary-300 text-xs">
            {turnosOcupados.length} turno{turnosOcupados.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Lista de turnos */}
        <div className="space-y-2">

          {isLoading ? (
            <TurnosSkeletonLoader />
          ) : (
            turnosOcupados.map((slot: any, index: string) => (
              <TurnoCard
                key={`${slot.hora}-${index}`}
                slot={slot}
                onVerDetalles={handleVerDetalles}
                onReagendar={handleReagendar}
                onCancelar={handleCancelar}
                onLlamar={handleLlamar}
                onWhatsApp={handleWhatsApp}
              />
            ))
          )}
        </div>

        {
          waOpen &&
          <ModalReact
            title="Enviar WhatsApp"
            size="md"
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
                      disabled={!waSlot?.turnoInfo?.pacienteCelular}
                    />
                    <span>
                      Usar ficha {waSlot?.turnoInfo?.pacienteCelular ? `(${waSlot.turnoInfo.pacienteCelular})` : '(no disponible)'}
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
                  value={waUsarFicha === 'ficha' ? (waSlot?.turnoInfo?.pacienteCelular || '') : waCelular}
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
                <Button variant='primary' onClick={() => {
                  const candidate = waUsarFicha === 'ficha' ? (waSlot?.turnoInfo?.pacienteCelular || '') : waCelular;
                  const phone = formateoNumeroWhatsapp(candidate, 'AR');
                  if (!phone) return;
                  const link = buildWhatsAppLink(phone, waMensaje);
                  window.open(link, '_blank');
                  setWaOpen(false);
                }}
                  disabled={(waUsarFicha === 'ficha' && !waSlot?.turnoInfo?.pacienteCelular) || (waUsarFicha === 'otro' && !waCelular)}
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
}
