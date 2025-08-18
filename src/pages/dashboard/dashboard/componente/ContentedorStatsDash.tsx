import { statsDashStore } from '@/context/store';
import { useStore } from '@nanostores/react';
import { Activity, ChartBar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsAtenciondelDia from './StatsAtenciondelDia';
import StatsCard from './StatsCard';

type Props = {};
type dataDash = {
  pacientes: number;
  atencionesMes: any[]; // <--- CORREGIDO: Debe ser un array
  atencionesUlt7d: any[];
  motivos: any[]; // Asumo que motivos también es un array para contar
  promedioDuracion: number;
  ultimasAtenciones: any[];
  atencionesHoy: any[];
};
export default function ContentedorStatsDash({}: Props) {
  const { data, loading }: { data: dataDash | null; loading: boolean } = useStore(statsDashStore);

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
      title: 'Últimos 7 días',
      value: 0,
      color: 'orange',
      icon: ChartBar,
      trend: 'neutral',
    },
    {
      title: 'Tiempo Promedio',
      value: 0,
      icon: Clock,
      subtitle: 'minutos por consulta',
    },
  ]);
  // console.log('data el contenedor de stat dash ->', data);
  useEffect(() => {
    if (data) {
      setstatsDash([
        {
          title: 'Pacientes Totales',
          value: data?.data?.pacientes ?? 0,
          icon: Users,
        },
        {
          title: 'Atenciones del Mes',
          value: data?.data?.atencionesMes?.length ?? 0,
          icon: Activity,
          subtitle: 'este mes',
        },
        {
          title: 'Últimos 7 días',
          value: data?.data?.atencionesUlt7d?.length ?? 0,
          color: 'orange',
          icon: ChartBar,
          trend: 'neutral',
        },
        {
          title: 'Tiempo Promedio',
          value: data?.data?.promedioDuracion || 0,
          icon: Clock,
          subtitle: 'minutos por consulta',
        },
      ]);
    }
  }, [data]);

  return (
    <div className="flex items-center justify-around gap-2 w-full h-full">
      <StatsAtenciondelDia />
      {statsDash.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
