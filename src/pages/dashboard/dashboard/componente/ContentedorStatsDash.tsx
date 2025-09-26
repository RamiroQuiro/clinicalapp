import { Activity, Clock, Users, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatsCardV2 } from './StatsCard';

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
      color: 'blue',
    },
    {
      id: 'totalPacientes',
      title: 'Pacientes',
      value: 0,
      icon: Users,
      subtitle: 'pacientes',
      color: 'green',
    },
    {
      id: 'atencionesMes',
      title: 'Atenciones del Mes',
      value: 0,
      icon: Activity,
      subtitle: 'este mes',
      color: 'orange',
    },

    {
      id: 'promedioDuracion',
      title: 'Tiempo Promedio',
      value: 0,
      icon: Clock,
      subtitle: 'minutos por consulta',
      color: 'purple',
    },
  ]);

  useEffect(() => {
    if (data) {
      const pacientesComparativa = () => {
        const pacientesMesActual = data.filter(p => p.id === 'totalPacientes')[0].value;

        const pacientesMesAnterior = data.filter(p => p.id === 'totalPacientes')[0]
          .pacienteMesAnterior;

        const tendenciaPacientes =
          pacientesMesActual == pacientesMesAnterior
            ? 'neutral'
            : pacientesMesActual > pacientesMesAnterior
              ? 'upPeriodoActual'
              : 'downPeriodoAnterior';
        return { pacientesMesActual, pacientesMesAnterior, tendenciaPacientes };
      };

      const atencionesDiscrimadas = () => {
        const atencionesMesActual = data.filter(p => p.id === 'atencionesMes')[0].value;
        const atencionesMesAnterior = data.filter(p => p.id === 'atencionesMes')[0]
          .atencionesMesPasado;

        const tendenciaAtenciones =
          atencionesMesActual == atencionesMesAnterior
            ? 'neutral'
            : atencionesMesActual > atencionesMesAnterior
              ? 'upPeriodoActual'
              : 'downPeriodoAnterior';
        return { atencionesMesActual, atencionesMesAnterior, tendenciaAtenciones };
      };

      const promedioDiscriminadoFuncion = () => {
        const promedioMesActual = data.filter(p => p.id === 'promedioDuracion')[0].value;
        const promedioMesAnterior = data.filter(p => p.id === 'promedioDuracion')[0]
          .promedioDuracionMesAnterior;

        const tendenciaPromedio =
          promedioMesActual == promedioMesAnterior
            ? 'neutral'
            : promedioMesActual > promedioMesAnterior
              ? 'upPeriodoActual'
              : 'downPeriodoAnterior';
        return { promedioMesActual, promedioMesAnterior, tendenciaPromedio };
      };

      const { pacientesMesActual, pacientesMesAnterior, tendenciaPacientes } =
        pacientesComparativa();
      const { atencionesMesActual, atencionesMesAnterior, tendenciaAtenciones } =
        atencionesDiscrimadas();
      const { promedioMesActual, promedioMesAnterior, tendenciaPromedio } =
        promedioDiscriminadoFuncion();

      setstatsDash([
        {
          id: 'consultasHoy',
          title: 'Consultas Hoy',
          value: totalHoy,
          icon: Users,
          color: 'blue',
          subtitle: '',
        },
        {
          id: 'pacientes',
          title: 'Pacientes',
          value: pacientesMesActual,
          icon: Users,
          color: 'green',
          subtitle: tendenciaPacientes,
        },
        {
          id: 'atencionesMes',
          title: 'Atenciones del Mes',
          value: atencionesMesActual,
          icon: Activity,
          color: 'orange',
          subtitle: tendenciaAtenciones,
        },

        {
          id: 'promedioDuracion',
          title: 'Tiempo Promedio',
          value: promedioMesActual,
          icon: Clock,
          color: 'purple',
          subtitle: tendenciaPromedio,
        },
      ]);
    }
  }, [data]);

  const totalHoy = 0;
  const mananaHoy = 0;
  const tardeHoy = 0;

  return (
    <div className="grid gap-2 grid-cols-2 lg:grid-cols-4 md:w-full itse">
      {/* Pacientes Totales - Large */}
      {statsDash?.map((stat, index) => (
        <div key={stat.id}>
          <StatsCardV2
            color={stat.color}
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
