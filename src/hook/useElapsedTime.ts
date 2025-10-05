import { useState, useEffect } from 'react';

// Hook para calcular el tiempo transcurrido desde un momento dado
export function useElapsedTime(startTime: string | Date): string {
  const [elapsedTime, setElapsedTime] = useState('--');

  useEffect(() => {
    if (!startTime) {
      setElapsedTime('N/A');
      return;
    }

    const calculateElapsedTime = () => {
      const start = new Date(startTime);
      const now = new Date();
      // Diferencia en minutos
      const diffInMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));

      if (isNaN(diffInMinutes) || diffInMinutes < 0) return 'Recién llegado';
      if (diffInMinutes < 1) return 'Hace instantes';
      if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      const remainingMinutes = diffInMinutes % 60;
      return `Hace ${diffInHours}h ${remainingMinutes}min`;
    };

    // Calcular inmediatamente al montar
    setElapsedTime(calculateElapsedTime());

    // Actualizar cada 30 segundos para no sobrecargar
    const intervalId = setInterval(() => {
      setElapsedTime(calculateElapsedTime());
    }, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [startTime]); // El efecto se re-ejecuta si la hora de inicio cambia

  return elapsedTime;
}
