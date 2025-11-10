
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { Clock, Moon, Sun } from 'lucide-react';
import { useMemo } from 'react';
import BotonHora from './BotonHora';

function HorariosSkeletonLoader() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 border border-primary-border rounded-lg animate-pulse">
          <div className="h-5 bg-primary-texto/30 rounded w-1/2 mb-4"></div>
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-20 bg-primary-texto/30 rounded"></div>
            <div className="h-10 w-20 bg-primary-texto/30 rounded"></div>
            <div className="h-10 w-20 bg-primary-texto/30 rounded"></div>
            <div className="h-10 w-20 bg-primary-texto/30 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HorariosDisponibles({ agenda, dia, profesional, hangleAgendar, isLoading }: { agenda: any, dia: Date, profesional: any, hangleAgendar: (hora: string) => void, isLoading: boolean }) {
  const horariosDisponibles = useMemo(() => {
    return agenda?.filter((slot: any) => slot.disponible)
  }, [agenda]);

  const horariosAgrupados = useMemo(
    () => ({
      mañana: horariosDisponibles?.filter(
        slot => parseInt(formatUtcToAppTime(slot.hora, 'HH')) < 12
      ),
      tarde: horariosDisponibles?.filter(
        slot => parseInt(formatUtcToAppTime(slot.hora, 'HH')) >= 12
      ),
    }),
    [horariosDisponibles]
  );

  const handleAgendarClick = (hora: string) => {
    hangleAgendar(hora)
  };


  if (isLoading) {
    return (
      <HorariosSkeletonLoader />
    );
  }

  if (horariosDisponibles?.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-10 h-10 text-orange-300 mx-auto mb-2" />
        <p className="text-gray-600 font-medium mb-1">No hay horarios</p>
        <p className="text-gray-400 text-sm">Prueba con otra fecha</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {horariosAgrupados?.mañana?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Sun className="w-4 h-4 mr-2 text-yellow-500" />
            Turno Mañana
          </h3>
          <div className="flex flex-wrap gap-2">
            {horariosAgrupados?.mañana?.map(slot => (
              <BotonHora key={slot.hora} slot={slot} onClick={handleAgendarClick} />
            ))}
          </div>
        </div>
      )}

      {horariosAgrupados?.tarde?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Moon className="w-4 h-4 mr-2 text-blue-500" />
            Turno Tarde
          </h3>
          <div className="flex flex-wrap gap-2">
            {horariosAgrupados?.tarde?.map(slot => (
              <BotonHora key={slot.hora} slot={slot} onClick={handleAgendarClick} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
