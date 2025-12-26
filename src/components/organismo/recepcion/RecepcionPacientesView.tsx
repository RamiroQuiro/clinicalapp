import Input from '@/components/atomos/Input';
import CardSalaEsperaDetallada from '@/components/moleculas/CardSalaEsperaDetallada';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import type { AgendaSlot } from '@/context/agenda.store';
import { CheckCheck, Clock } from 'lucide-react';

type Props = {
  turnosAgendados: AgendaSlot[];
  colaDeEspera: AgendaSlot[];
  isLoading: boolean;
  sseConectado: boolean;
  ultimaActualizacion: string | null;
  onRecibirPaciente: (slot: AgendaSlot) => void;
  onAtender: (slot: AgendaSlot) => void;
  onVerDetalles?: (slot: AgendaSlot) => void;
  onReagendar?: (slot: AgendaSlot) => void;
  onCancelar?: (slot: AgendaSlot) => void;
  onLlamar?: (slot: AgendaSlot) => void;
  onSubir?: (slot: AgendaSlot) => void;
  onBajar?: (slot: AgendaSlot) => void;
  onNotificar?: (slot: AgendaSlot) => void;
};

export default function RecepcionPacientesView({
  turnosAgendados,
  colaDeEspera,
  isLoading,
  sseConectado,
  ultimaActualizacion,
  onRecibirPaciente,
  onAtender,
  onVerDetalles = () => {},
  onReagendar = () => {},
  onCancelar = () => {},
  onLlamar = () => {},
  onSubir = () => {},
  onBajar = () => {},
  onNotificar = () => {},
}: Props) {
  console.log('🔌 Estado SSE:', sseConectado ? '🟢 Conectado' : '🔴 Desconectado');
  console.log('Ultima actualizacion ->', ultimaActualizacion);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
      <Section title="🤒 Recepcion de Pacientes" className="flex flex-1 min-w-[70%] flex-col">
        <Input type="search" placeholder="Buscar paciente" />
        <div key={1} className="flex flex-col mt-4 gap-2">
          {turnosAgendados.length === 0 ? (
            <div className="w-full">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No hay turnos agendados</p>
                <p className="text-gray-500 text-sm">
                  Los turnos aparecerán aquí cuando se agenden
                </p>
              </div>
            </div>
          ) : (
            turnosAgendados
              .sort((a, b) => {
                return a.turnoInfo?.estado === 'sala_de_espera' ? 1 : -1;
              })
              .map((turno: AgendaSlot, i) => (
                <CardTurnoRecepcion
                  key={i}
                  slot={turno}
                  onVerDetalles={() => onVerDetalles(turno)}
                  onReagendar={() => onReagendar(turno)}
                  onCancelar={() => onCancelar(turno)}
                  onLlamar={() => onLlamar(turno)}
                  onRecibirPaciente={onRecibirPaciente}
                />
              ))
          )}
        </div>
      </Section>
      <Section
        title={`${colaDeEspera.length} En Sala de Espera`}
        classContent="flex flex-1 min-w-[30%] flex-col"
      >
        <div key={2} className="flex flex-col gap-2 w-full">
          {colaDeEspera.length === 0 ? (
            <div className="w-full">
              <div className="text-center py-5">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <CheckCheck className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No hay turnos Recepcionados</p>
                <p className="text-gray-500 text-sm">Los turnos recepcionados aparecerán aquí</p>
              </div>
            </div>
          ) : (
            colaDeEspera.map((turno: AgendaSlot, i: number) => (
              <CardSalaEsperaDetallada
                key={i}
                turno={turno}
                index={i}
                onAtender={() => onAtender(turno)}
                onSubir={() => onSubir(turno)}
                onBajar={() => onBajar(turno)}
                onNotificar={() => onNotificar(turno)}
                onLlamar={() => onLlamar(turno)}
              />
            ))
          )}
        </div>
      </Section>
    </div>
  );
}
