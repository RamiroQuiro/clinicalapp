import { agendaDelDia } from '@/context/agenda.store';
import { StatsCardV2 } from '@/pages/dashboard/dashboard/componente/StatsCard';
import { useStore } from '@nanostores/react';
import { Check, Clock, Users, X } from 'lucide-react';

type Props = {};

export default function ConstendorStats({}: Props) {
  const agenda = useStore(agendaDelDia);

  const turnoDisponibles = agenda.filter(slot => slot.disponible).length;
  const turnosConfirmados = agenda.filter(slot => slot.turnoInfo?.estado == 'confirmado').length;
  const turnosPendientes = agenda.filter(slot => slot.turnoInfo?.estado == 'pendiente').length;
  const turnosCancelados = agenda.filter(slot => slot.turnoInfo?.estado == 'cancelado').length;
  console.log('agenda ->', agenda);
  return (
    <div className="flex gap-2 w-full items-center justify-between mb-4">
      <StatsCardV2
        title="Turnos Disponibles"
        value={turnoDisponibles}
        icon={Users}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="green"
        title="Turnos Confirmados"
        value={turnosConfirmados}
        icon={Check}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="orange"
        title="Turnos Pendientes"
        value={turnosPendientes}
        icon={Clock}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="red"
        title="Turnos Cancelados"
        value={turnosCancelados}
        icon={X}
        subtitle="turnos"
        trend="neutral"
      />
    </div>
  );
}
