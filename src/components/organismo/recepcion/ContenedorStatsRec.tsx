import { StatsCardV2 } from '@/pages/dashboard/dashboard/componente/StatsCard';
import { Check, Clock, Users, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
  userId: string;
};

export default function ConstendorStats({ userId }: Props) {
  const [agenda, setAgenda] = useState([]);
  const diaSeleccionado = new Date();

  const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const turnoDisponibles = agenda.filter(slot => slot.disponible).length;
  const turnosConfirmados = agenda.filter(slot => slot.turnoInfo?.estado == 'confirmado').length;
  const turnosPendientes = agenda.filter(slot => slot.turnoInfo?.estado == 'pendiente').length;
  const turnosCancelados = agenda.filter(slot => slot.turnoInfo?.estado == 'cancelado').length;
  console.log('agenda ->', agenda);
  return (
    <div className="flex gap-2 w-full items-center justify-between mb">
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
