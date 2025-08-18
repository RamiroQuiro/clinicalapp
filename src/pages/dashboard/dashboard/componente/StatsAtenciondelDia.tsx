import DivReact from '@/components/atomos/DivReact';
import { statsDashStore } from '@/context/store';
import { getFechaUnix } from '@/utils/timesUtils';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

type Props = {};

export default function StatsAtenciondelDia() {
  const { data, loading } = useStore(statsDashStore);
  const [atencionesDelDia, setAtencionesDelDia] = useState([]);
  const today = new Date(getFechaUnix() * 1000);
  useEffect(() => {
    // filtrar atenciones del día
    if (data?.atencionesHoy) {
      setAtencionesDelDia(
        data?.atencionesHoy.filter((atencion: any) => {
          const atencionFecha = new Date(atencion.fecha);
          return (
            atencionFecha.getUTCFullYear() === today.getUTCFullYear() &&
            atencionFecha.getUTCMonth() === today.getUTCMonth() &&
            atencionFecha.getUTCDate() === today.getUTCDate()
          );
        })
      );
    }
  }, [loading, data]);
  const atencionTurnoTarde =
    atencionesDelDia?.find((turno: any) => turno.turno === 'tarde')?.total || 0;
  const atencionTurnoManana =
    atencionesDelDia?.find((turno: any) => turno.turno === 'mañana')?.total || 0;

  return (
    <DivReact>
      <div className="flex w-full items-center gap-2 justify-between border-b pb-1 mb-1">
        <p className="text-sm font-medium text-gray-600">Consultas Hoy</p>
        <span className="text-2xl text-primary-texto">
          {atencionTurnoManana + atencionTurnoTarde}
        </span>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-center justify-normal">
          <p className="text-sm font-medium text-gray-600">Mañana</p>
          <h3 className="mt-1 text-xl font-semibold">{atencionTurnoManana}</h3>
        </div>
        <div className="flex flex-col items-center justify-normal">
          <p className="text-sm font-medium text-gray-600">Tarde</p>
          <h3 className="mt-1 text-xl font-semibold">{atencionTurnoTarde}</h3>
        </div>
      </div>
    </DivReact>
  );
}
