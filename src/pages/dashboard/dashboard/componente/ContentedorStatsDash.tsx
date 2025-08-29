import { Activity, ChartBar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

type Props = {
  data: dataDash | null; // Now receives data as a prop
};
type dataDash = {
  pacientes: number;
  atencionesMes: number; // Changed from any[] to number based on service
  atencionesSemana: { fecha: string; turno: string; cantidad: number }[]; // Updated type
  motivos: { motivoInicial: string; cantidad: number }[]; // Updated type
  promedioDuracion: number;
  ultimasAtenciones: any[];
  atencionesHoy: {
    id: string;
    pacienteId: string;
    fecha: string;
    motivoInicial: string;
    turno: string;
  }[]; // Updated type
};

export default function ContentedorStatsDash({ data }: Props) {
  const [statsDash, setstatsDash] = useState([
    {
      title: 'Pacientes Totales',
      value: 0,
      icon: Users,
    },
    {
      title: 'Atenciones del Mes',
      value: 0,
      icon: Activity,
      subtitle: 'este mes',
    },
    {
      title: 'Motivo Más Frecuente', // New KPI
      value: 'N/A',
      icon: ChartBar, // Reusing ChartBar icon
      subtitle: 'últimos 30 días',
    },
    {
      title: 'Tiempo Promedio',
      value: 0,
      icon: Clock,
      subtitle: 'minutos por consulta',
    },
  ]);

  useEffect(() => {
    if (data) {
      const totalManana = data.atencionesHoy.filter(a => a.turno === 'Mañana').length;
      const totalTarde = data.atencionesHoy.filter(a => a.turno === 'Tarde').length;
      const totalHoy = data.atencionesHoy.length;
      const topMotivo = data.motivos.length > 0 ? data.motivos[0].motivoInicial : 'N/A';

      setstatsDash([
        {
          title: 'Pacientes Totales',
          value: data.pacientes,
          icon: Users,
        },
        {
          title: 'Atenciones del Mes',
          value: data.atencionesMes,
          icon: Activity,
          subtitle: 'este mes',
        },
        {
          title: 'Motivo Más Frecuente',
          value: topMotivo,
          icon: ChartBar,
          subtitle: data.motivos.length > 0 ? `(${data.motivos[0].cantidad} casos)` : 'sin datos',
        },
        {
          title: 'Tiempo Promedio',
          value: data.promedioDuracion,
          icon: Clock,
          subtitle: 'minutos por consulta',
        },
      ]);
    }
  }, [data]);

  // Helper to get the specific stat card by title
  const getStat = (title: string) => statsDash.find(stat => stat.title === title);

  const pacientesStat = getStat('Pacientes Totales');
  const atencionesMesStat = getStat('Atenciones del Mes');
  const motivoFrecuenteStat = getStat('Motivo Más Frecuente');
  const tiempoPromedioStat = getStat('Tiempo Promedio');

  const totalHoy = data?.atencionesHoy.length ?? 0;
  const mananaHoy = data?.atencionesHoy.filter(a => a.turno === 'Mañana').length ?? 0;
  const tardeHoy = data?.atencionesHoy.filter(a => a.turno === 'Tarde').length ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Pacientes Totales - Large */}
      {statsDash?.map((stat, index) => (
        <StatsCard
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          subtitle={stat.subtitle}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
