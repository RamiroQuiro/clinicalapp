import { Activity, Clock, Users, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';

type Props = {
  data: dataDash | null; // Now receives data as a prop
};
type dataDash = {
  id: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
}[];

export default function ContentedorStatsDash({ data }: Props) {
  const [statsDash, setstatsDash] = useState([
    {
      id: 'consultasHoy',
      title: 'Consultas hoy',
      value: 0,
      icon: Workflow,
      subtitle: 'consultas',
    },
    {
      id: 'totalPacientes',
      title: 'Pacientes',
      value: 0,
      icon: Users,
      subtitle: 'pacientes',
    },
    {
      id: 'atencionesMes',
      title: 'Atenciones del Mes',
      value: 0,
      icon: Activity,
      subtitle: 'este mes',
    },

    {
      id: 'promedioDuracion',
      title: 'Tiempo Promedio',
      value: 0,
      icon: Clock,
      subtitle: 'minutos por consulta',
    },
  ]);

  console.log('data stats', data);

  useEffect(() => {
    if (data) {
      const pacientesComparativa = () => {
        const pacientesMesActual = data.filter(p => p.id === 'totalPacientes')[0].value;

        const pacientesMesAnterior = data.filter(p => p.id === 'totalPacientes')[0]
          .pacienteMesAnterior;

        const tendencia =
          pacientesMesActual > pacientesMesAnterior ? 'upPeriodoActual' : 'downPeriodoAnterior';
        return { pacientesMesActual, pacientesMesAnterior, tendencia };
      };

      const atencionesDiscrimadas = () => {
        const atencionesMesActual = data.filter(p => p.id === 'atencionesMes')[0].value;
        const atencionesMesAnterior = data.filter(p => p.id === 'atencionesMes')[0]
          .atencionesMesPasado;

        const tendencia =
          atencionesMesActual > atencionesMesAnterior ? 'upPeriodoActual' : 'downPeriodoAnterior';
        return { atencionesMesActual, atencionesMesAnterior, tendencia };
      };

      const promedioDiscriminadoFuncion = () => {
        const promedioMesActual = data.filter(p => p.id === 'promedioDuracion')[0].value;
        const promedioMesAnterior = data.filter(p => p.id === 'promedioDuracion')[0]
          .promedioDuracionMesAnterior;

        const tendencia =
          promedioMesActual > promedioMesAnterior ? 'upPeriodoActual' : 'downPeriodoAnterior';
        return { promedioMesActual, promedioMesAnterior, tendencia };
      };

      const { pacientesMesActual, pacientesMesAnterior, tendencia } = pacientesComparativa();
      const atencionesDiscriminadas = atencionesDiscrimadas();
      const promedioDiscriminado = promedioDiscriminadoFuncion();

      setstatsDash([
        {
          id: 'consultasHoy',
          title: 'Consultas Hoy',
          value: totalHoy,
          icon: Users,
          subtitle: '',
        },
        {
          id: 'pacientes',
          title: 'Pacientes',
          value: pacientesMesActual,
          icon: Users,
          subtitle: tendencia,
        },
        {
          id: 'atencionesMes',
          title: 'Atenciones del Mes',
          value: data.filter(p => p.id === 'atencionesMes')[0].value,
          icon: Activity,
          subtitle: 'este mes',
        },

        {
          id: 'promedioDuracion',
          title: 'Tiempo Promedio',
          value: data.filter(p => p.id === 'promedioDuracion')[0].value,
          icon: Clock,
          subtitle: 'minutos por consulta',
        },
      ]);
    }
  }, [data]);

  const totalHoy = 0;
  const mananaHoy = 0;
  const tardeHoy = 0;

  return (
    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 w-full">
      {/* Pacientes Totales - Large */}
      {statsDash?.map((stat, index) => (
        <div key={stat.id}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            subtitle={stat.subtitle}
            trend={stat.trend}
          />
        </div>
      ))}
    </div>
  );
}
