import APP_TIME_ZONE from '@/lib/timeZone';
import { format, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';


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

/**
 * Retorna el nombre del día de la semana en español para una fecha dada.
 * @param date La fecha.
 * @returns El nombre del día de la semana (ej. 'lunes').
 */
export const getDayOfWeek = (date: Date): string => {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  return days[date.getDay()];
};

/**
 * Retorna un objeto Date representando el inicio del día (00:00:00) en la zona horaria de la aplicación.
 * @param date La fecha.
 * @returns Un objeto Date al inicio del día.
 */
export const getStartOfDay = (date: Date): Date => {
  // Obtenemos la fecha en la zona horaria objetivo
  const zoned = toZonedTime(date, APP_TIME_ZONE);
  // Ponemos 00:00:00
  zoned.setHours(0, 0, 0, 0);
  // Convertimos de vuelta a UTC "real"
  return fromZonedTime(zoned, APP_TIME_ZONE);
};

/**
 * Retorna un objeto Date representando el final del día (23:59:59) en la zona horaria de la aplicación.
 * @param date La fecha.
 * @returns Un objeto Date al final del día.
 */
export const getEndOfDay = (date: Date): Date => {
  const zoned = toZonedTime(date, APP_TIME_ZONE);
  zoned.setHours(23, 59, 59, 999);
  return fromZonedTime(zoned, APP_TIME_ZONE);
};

/**
 * Formatea una fecha a 'YYYY-MM-DD'.
 * @param date La fecha.
 * @returns Un string con la fecha formateada.
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  return format(date, 'yyyy-MM-dd', { timeZone: APP_TIME_ZONE });
};

