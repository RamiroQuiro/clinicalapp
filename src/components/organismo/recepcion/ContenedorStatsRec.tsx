import { StatsCardV2 } from '@/pages/dashboard/dashboard/componente/StatsCard';
import { useStore } from '@nanostores/react';
import { Check, Clock, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { recepcionStore } from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function ContendorStats({ userId }: Props) {
  const { turnosDelDia } = useStore(recepcionStore);
  const [animatedValues, setAnimatedValues] = useState({
    turnoDisponibles: 0,
    turnosConfirmados: 0,
    turnosPendientes: 0,
    turnosCancelados: 0,
  });

  console.log('turnosDelDia en el contenedor de stats->', turnosDelDia);

  // Calculamos las estadísticas a partir de los datos del store
  useEffect(() => {
    const turnoDisponibles = turnosDelDia.filter(slot => slot.disponible === true).length;
    const turnosConfirmados = turnosDelDia.filter(
      slot => slot.turnoInfo?.estado === 'confirmado'
    ).length;
    const turnosPendientes = turnosDelDia.filter(
      slot => slot.turnoInfo?.estado === 'pendiente'
    ).length;
    const turnosCancelados = turnosDelDia.filter(
      slot => slot.turnoInfo?.estado === 'cancelado'
    ).length;

    // Usamos requestAnimationFrame para animaciones suaves
    const animateValue = (start: number, end: number, updateFn: (value: number) => void) => {
      const duration = 1000; // 1 segundo de duración
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentValue = Math.floor(start + (end - start) * progress);

        updateFn(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // Animar cada valor
    const updateValues = (values: {
      turnoDisponibles: number;
      turnosConfirmados: number;
      turnosPendientes: number;
      turnosCancelados: number;
    }) => {
      setAnimatedValues(prev => ({
        ...prev,
        ...values,
      }));
    };

    // Iniciar animaciones
    animateValue(0, turnoDisponibles, val => {
      updateValues({ turnoDisponibles: val });
    });
    animateValue(0, turnosConfirmados, val => {
      updateValues({ turnosConfirmados: val });
    });
    animateValue(0, turnosPendientes, val => {
      updateValues({ turnosPendientes: val });
    });
    animateValue(0, turnosCancelados, val => {
      updateValues({ turnosCancelados: val });
    });
  }, [turnosDelDia]);

  return (
    <div className="flex gap-2 w-full items-center justify-between mb">
      <StatsCardV2
        title="Turnos Disponibles"
        value={animatedValues.turnoDisponibles}
        icon={Users}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="green"
        title="Turnos Confirmados"
        value={animatedValues.turnosConfirmados}
        icon={Check}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="orange"
        title="Turnos Pendientes"
        value={animatedValues.turnosPendientes}
        icon={Clock}
        subtitle="turnos"
        trend="neutral"
      />
      <StatsCardV2
        color="red"
        title="Turnos Cancelados"
        value={animatedValues.turnosCancelados}
        icon={X}
        subtitle="turnos"
        trend="neutral"
      />
    </div>
  );
}
