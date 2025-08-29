import { Temporal } from 'temporal-polyfill';

/**
 * Devuelve el timestamp actual en segundos (UTC, sin zona horaria).
 */
export function getFechaUnix(): number {
  return Temporal.Now.instant().epochMilliseconds;
}

/**
 * Convierte Date, milisegundos o segundos en timestamp Unix en segundos.
 */
export function convertirASegundos(fecha: Date | number): number {
  if (typeof fecha === 'number') {
    return fecha > 1e12
      ? Math.floor(fecha / 1000) // milisegundos → segundos
      : fecha; // ya está en segundos
  }
  return Math.floor(fecha.getTime() / 1000);
}

/**
 * Formatea un timestamp Unix (segundos) a fecha legible en español argentino.
 */
export function formatearFechaArgentina(timestamp: number, incluirHora = true): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(incluirHora && { hour: '2-digit', minute: '2-digit' }),
  });
}

/**
 * Devuelve el inicio y fin del mes actual como timestamps en segundos.
 */
export function getInicioYFinDeMesActual(): { inicio: number; fin: number } {
  const hoy = Temporal.Now.plainDateISO();
  const inicio = hoy.with({ day: 1 }).toZonedDateTime('UTC').toInstant();
  const fin = hoy
    .with({ day: 1 })
    .add({ months: 1 })
    .subtract({ days: 1 })
    .toZonedDateTime('UTC')
    .with({ hour: 23, minute: 59, second: 59 })
    .toInstant();

  return {
    inicio: inicio.epochMilliseconds,
    fin: fin.epochMilliseconds,
  };
}

/**
 * Devuelve el inicio y fin del mes anterior como timestamps en segundos.
 */

export function getInicioYFinDeMesAnterior(): { inicio: number; fin: number } {
  const hoy = Temporal.Now.plainDateISO();
  const mesAnterior = hoy.subtract({ months: 1 });
  const inicio = mesAnterior.with({ day: 1 }).toZonedDateTime('UTC').toInstant();
  const fin = mesAnterior
    .with({ day: 1 })
    .add({ months: 1 })
    .subtract({ days: 1 })
    .toZonedDateTime('UTC')
    .with({ hour: 23, minute: 59, second: 59 })
    .toInstant();

  return {
    inicio: inicio.epochMilliseconds,
    fin: fin.epochMilliseconds,
  };
}

/**
 * Devuelve el inicio y fin del mismo mes del año anterior como timestamps en segundos.
 */
export function getInicioYFinMismoMesAnioAnterior(): {
  inicio: number;
  fin: number;
} {
  const hoy = Temporal.Now.plainDateISO();
  const anioAnterior = hoy.subtract({ years: 1 });
  const inicio = anioAnterior.with({ day: 1 }).toZonedDateTime('UTC').toInstant();
  const fin = anioAnterior
    .with({ day: 1 })
    .add({ months: 1 })
    .subtract({ days: 1 })
    .toZonedDateTime('UTC')
    .with({ hour: 23, minute: 59, second: 59 })
    .toInstant();

  return {
    inicio: inicio.epochMilliseconds,
    fin: fin.epochMilliseconds,
  };
}

/**
 * Devuelve el inicio y fin del año actual como timestamps en segundos.
 */
export function getInicioYFinDelAnioActual(): { inicio: number; fin: number } {
  const hoy = Temporal.Now.plainDateISO();
  const inicio = hoy.with({ month: 1, day: 1 }).toZonedDateTime('UTC').toInstant();
  const fin = hoy
    .with({ month: 12, day: 31 })
    .toZonedDateTime('UTC')
    .with({ hour: 23, minute: 59, second: 59 })
    .toInstant();

  return {
    inicio: inicio.epochMilliseconds,
    fin: fin.epochMilliseconds,
  };
}

/**
 * Devuelve los timestamps desde hoy - N días hasta hoy (UTC).
 */
export function getUltimosNDias(n: number): { desde: number; hasta: number } {
  const ahora = Temporal.Now.instant();

  const desde = ahora.subtract({ hours: n * 24 });

  return {
    desde: desde.epochMilliseconds,
    hasta: ahora.epochMilliseconds,
  };
}

/**
 * Calcula la duración en minutos entre dos fechas en formato ISO string.
 * @param startIsoString Fecha de inicio en formato ISO string.
 * @param endIsoString Fecha de fin en formato ISO string.
 * @returns Duración en minutos, o null si alguna fecha no es válida.
 */
export function getDurationInMinutes(startIsoString: string, endIsoString: string): number | null {
  try {
    const startDate = new Date(startIsoString);
    const endDate = new Date(endIsoString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null; // Invalid date
    }

    const diffMilliseconds = endDate.getTime() - startDate.getTime();
    const diffMinutes = diffMilliseconds / (1000 * 60);
    return diffMinutes;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return null;
  }
}
