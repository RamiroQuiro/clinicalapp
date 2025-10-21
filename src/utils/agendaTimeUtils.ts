import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// --- CONFIGURACIÓN ---
const APP_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/**
 * Convierte una fecha (string o Date) que está en UTC a la zona horaria de la aplicación.
 * Útil para mostrar en la UI fechas que vienen de la base de datos.
 * @param dateOrString La fecha en formato UTC (ej. '2025-09-25T18:00:00.000Z') o un objeto Date.
 * @returns Un objeto Date ajustado a la zona horaria de la aplicación.
 */
export const convertUtcToAppTime = (dateOrString: string | Date): Date => {
  return toZonedTime(dateOrString, APP_TIME_ZONE);
};

/**
 * Convierte una fecha local (de la zona horaria de la aplicación) a UTC.
 * Útil para enviar al servidor una fecha seleccionada por el usuario en la UI.
 * @param dateOrString La fecha en la zona horaria de la aplicación.
 * @returns Un objeto Date en UTC.
 */
export const convertAppTimeToUtc = (dateOrString: string | Date): Date => {
  return fromZonedTime(dateOrString, APP_TIME_ZONE);
};

/**
 * Formatea una fecha (que ya está en la zona horaria de la aplicación) a un string legible.
 * @param date El objeto Date para formatear.
 * @param formatString El formato deseado (ej. 'dd/MM/yyyy HH:mm').
 * @returns Un string con la fecha formateada.
 */
export const formatAppTime = (date: Date, formatString: string): string => {
  return format(date, formatString, { locale: es, timeZone: APP_TIME_ZONE });
};

/**
 * Función combinada: Convierte una fecha UTC y la formatea directamente.
 * Ideal para renderizar en la UI.
 * @param utcDateOrString La fecha en formato UTC.
 * @param formatString El formato deseado.
 * @returns Un string con la fecha formateada en la zona horaria de la aplicación.
 */
export const formatUtcToAppTime = (
  utcDateOrString: string | Date,
  formatString: string
): string => {
  const appDate = convertUtcToAppTime(utcDateOrString);
  return formatAppTime(appDate, formatString);
};
