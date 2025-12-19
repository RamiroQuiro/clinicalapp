// src/pages/api/agenda/summary.ts
import db from '@/db';
import { licenciasProfesional, turnos } from '@/db/schema';
import { agendaGeneralCentroMedico, horariosTrabajo } from '@/db/schema/agenda';
import { formatDateToYYYYMMDD, getDayOfWeek, getEndOfDay, getStartOfDay } from '@/utils/agendaTimeUtils';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { addDays } from 'date-fns';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';

// Constantes para los umbrales de ocupación (mejorados)
const UMBRAL_OCUPACION_ALTA = 80; // %
const UMBRAL_OCUPACION_MEDIA = 40; // %
const UMBRAL_OCUPACION_BAJA = 10; // %
const UMBRAL_LICENCIA = 100; // %

// Helper para convertir hora (HH:MM) a minutos desde la medianoche con timezone
const convertirHoraAMinutos = (hora: string | null | undefined): number => {
  if (!hora) return 0;

  // Crear fecha base con la hora y el timezone correcto
  const fechaBase = toZonedTime(new Date(), APP_TIME_ZONE);
  const [horas, minutos] = hora.split(':').map(Number);

  // Crear fecha con la hora del horario
  const fechaConHora = new Date(fechaBase);
  fechaConHora.setHours(horas, minutos, 0, 0);

  // Convertir a minutos usando el timezone
  const fechaUTC = toZonedTime(fechaConHora, APP_TIME_ZONE);
  return fechaUTC.getHours() * 60 + fechaUTC.getMinutes();
};

// Helper para calcular los minutos disponibles de trabajo en un día
const calcularMinutosDisponibles = (horario: typeof horariosTrabajo.$inferSelect): number => {
  let totalMinutos = 0;
  if (horario.activo) {
    if (horario.horaInicioManana && horario.horaFinManana) {
      totalMinutos += convertirHoraAMinutos(horario.horaFinManana) - convertirHoraAMinutos(horario.horaInicioManana);
    }
    if (horario.horaInicioTarde && horario.horaFinTarde) {
      totalMinutos += convertirHoraAMinutos(horario.horaFinTarde) - convertirHoraAMinutos(horario.horaInicioTarde);
    }
  }
  return totalMinutos;
};

// Sistema de colores mejorado para mejor visibilidad
const obtenerEstadoOcupacion = (porcentajeOcupacion: number) => {
  if (porcentajeOcupacion >= UMBRAL_OCUPACION_ALTA) {
    return {
      estado: 'full',
      color: '#dc2626', // Rojo intenso - Muy ocupado
      colorClaro: '#fecaca', // Rojo claro
      porcentaje: porcentajeOcupacion
    };
  } else if (porcentajeOcupacion >= UMBRAL_OCUPACION_MEDIA) {
    return {
      estado: 'ocupacionAlta',
      color: '#ea580c', // Naranja - Ocupado
      colorClaro: '#fed7aa', // Naranja claro
      porcentaje: porcentajeOcupacion
    };
  } else if (porcentajeOcupacion >= UMBRAL_OCUPACION_BAJA) {
    return {
      estado: 'ocupacionMedia',
      color: '#ca8a04', // Amarillo - Moderado
      colorClaro: '#fef08a', // Amarillo claro
      porcentaje: porcentajeOcupacion
    };
  } else if (porcentajeOcupacion >= UMBRAL_LICENCIA) {
    return {
      estado: 'licencia',
      color: '#6b7280', // Gris - No disponible
      colorClaro: '#e5e7eb', // Gris claro
      porcentaje: porcentajeOcupacion
    };
  } else {
    return {
      estado: 'disponible',
      color: '#16a34a', // Verde - Disponible
      colorClaro: '#bbf7d0', // Verde claro
      porcentaje: porcentajeOcupacion
    };
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const professionalIdsParam = url.searchParams.get('professionalIds');
    const centroMedicoId = locals.user?.centroMedicoId;

    if (!startDateParam || !endDateParam || !professionalIdsParam || !centroMedicoId) {
      return createResponse(400, 'Faltan parámetros requeridos (startDate, endDate, professionalIds, centroMedicoId)');
    }
    console.log('consultas a esta api syummay')
    const ID_PROFESIONALES = professionalIdsParam.split(',');
    const FECHA_INICIO = new Date(startDateParam);
    const FECHA_FIN = new Date(endDateParam);

    // Estructura mejorada con más información
    const resumenOcupacion: {
      [key: string]: {
        estado: string;
        color: string;
        colorClaro: string;
        numeroTurnos?: number; // Optional if not returned by obtainEstadoOcupacion, but we assign it
        porcentaje: number;
        profesionales: { [profId: string]: number }; // % por profesional
        totalTurnos: number;
        turnosPorProfesional: { [profId: string]: number };
        hayAgenda: boolean;
        esLicencia: boolean;
      }
    } = {};

    // Obtener la duración por defecto de los turnos del centro médico
    const [agendaGeneral] = await db
      .select()
      .from(agendaGeneralCentroMedico)
      .where(eq(agendaGeneralCentroMedico.centroMedicoId, centroMedicoId));

    const DURACION_TURNO_POR_DEFECTO = agendaGeneral?.duracionTurnoPorDefecto || 30;

    // Obtener todos los horarios de trabajo de los profesionales para el rango de fechas
    const todosLosHorariosProfesionales = await db
      .select()
      .from(horariosTrabajo)
      .where(inArray(horariosTrabajo.userMedicoId, ID_PROFESIONALES));

    // Obtener todos los turnos en el rango de fechas para los profesionales
    const todosLosTurnosEnRango = await db
      .select({
        fechaTurno: turnos.fechaTurno,
        duracion: turnos.duracion,
        userMedicoId: turnos.userMedicoId,
        estado: turnos.estado,
      })
      .from(turnos)
      .where(
        and(
          gte(turnos.fechaTurno, getStartOfDay(FECHA_INICIO)),
          lte(turnos.fechaTurno, getEndOfDay(FECHA_FIN)),
          inArray(turnos.userMedicoId, ID_PROFESIONALES),
          eq(turnos.centroMedicoId, centroMedicoId)
        )
      );

    // Obtener licencias en el rango
    const licenciasEnRango = await db.select()
      .from(licenciasProfesional)
      .where(
        and(
          inArray(licenciasProfesional.userId, ID_PROFESIONALES),
          eq(licenciasProfesional.centroMedicoId, centroMedicoId),
          eq(licenciasProfesional.estado, 'activa'),
          // Superposición de fechas: (StartA <= EndB) and (EndA >= StartB)
          lte(licenciasProfesional.fechaInicio, FECHA_FIN),
          gte(licenciasProfesional.fechaFin, FECHA_INICIO)
        )
      );

    let fechaActual = new Date(FECHA_INICIO);
    while (fechaActual <= FECHA_FIN) {
      const CLAVE_FECHA = formatDateToYYYYMMDD(fechaActual);
      const NOMBRE_DIA_SEMANA = getDayOfWeek(fechaActual);

      const INICIO_DIA_ACTUAL = getStartOfDay(fechaActual);
      const FIN_DIA_ACTUAL = getEndOfDay(fechaActual);

      let porcentajesProfesionales: { [profId: string]: number } = {};
      let turnosPorProfesional: { [profId: string]: number } = {};
      let porcentajeTotalDia = 0;
      let profesionalesQueTrabajan = 0;
      let totalTurnosDia = 0;
      let hayAgendaEsteDia = false;

      // Verificar licencias para este día
      let profesionalesDeLicencia = 0;

      for (const idProf of ID_PROFESIONALES) {
        // Chequear si este profesional tiene licencia HOY
        const tieneLicencia = licenciasEnRango.some(lic =>
          lic.userId === idProf &&
          lic.fechaInicio <= FIN_DIA_ACTUAL &&
          lic.fechaFin >= INICIO_DIA_ACTUAL
        );

        if (tieneLicencia) {
          profesionalesDeLicencia++;
          porcentajesProfesionales[idProf] = 100; // Ocupado (licencia)
          turnosPorProfesional[idProf] = 0;
          continue; // No procesar agenda si tiene licencia
        }

        const horarioDelProfesional = todosLosHorariosProfesionales.find(
          (h) => h.userMedicoId === idProf && h.diaSemana === NOMBRE_DIA_SEMANA
        );

        if (!horarioDelProfesional || !horarioDelProfesional.activo) {
          porcentajesProfesionales[idProf] = 0;
          turnosPorProfesional[idProf] = 0;
          continue;
        }

        // Si llegamos aquí, hay agenda este día
        hayAgendaEsteDia = true;
        profesionalesQueTrabajan++;

        const MINUTOS_DISPONIBLES_TOTALES = calcularMinutosDisponibles(horarioDelProfesional);
        const SLOTS_DISPONIBLES_TOTALES = MINUTOS_DISPONIBLES_TOTALES / DURACION_TURNO_POR_DEFECTO;

        if (SLOTS_DISPONIBLES_TOTALES <= 0) {
          porcentajesProfesionales[idProf] = 0;
          turnosPorProfesional[idProf] = 0;
          continue;
        }

        const turnosDelProfesionalEnDia = todosLosTurnosEnRango.filter(
          (turno) =>
            turno.userMedicoId === idProf &&
            turno.fechaTurno >= INICIO_DIA_ACTUAL &&
            turno.fechaTurno <= FIN_DIA_ACTUAL &&
            !['cancelado', 'ausente'].includes(turno.estado)
        );

        const CANTIDAD_TURNOS_PROF = turnosDelProfesionalEnDia.length;
        turnosPorProfesional[idProf] = CANTIDAD_TURNOS_PROF;
        totalTurnosDia += CANTIDAD_TURNOS_PROF;

        const MINUTOS_RESERVADOS = turnosDelProfesionalEnDia.reduce(
          (sum, turno) => sum + (turno.duracion || DURACION_TURNO_POR_DEFECTO),
          0
        );

        const PORCENTAJE_OCUPACION_PROF = (MINUTOS_RESERVADOS / MINUTOS_DISPONIBLES_TOTALES) * 100;
        porcentajesProfesionales[idProf] = Math.min(PORCENTAJE_OCUPACION_PROF, 100);
        porcentajeTotalDia += PORCENTAJE_OCUPACION_PROF;
      }

      // Determinar el estado final
      let estadoOcupacion;

      // Si TODOS los profesionales seleccionados tienen licencia
      if (profesionalesDeLicencia === ID_PROFESIONALES.length && ID_PROFESIONALES.length > 0) {
        estadoOcupacion = {
          estado: 'licencia',
          color: '#3b82f6',
          colorClaro: '#f3f4f6',
          porcentaje: 100
        };
      } else if (!hayAgendaEsteDia) {
        // No hay agenda este día
        estadoOcupacion = {
          estado: 'no-agenda',
          color: '#9ca3af', // Gris
          colorClaro: '#f3f4f6', // Gris claro
          porcentaje: 0
        };
      } else {
        const PORCENTAJE_PROMEDIO_DIA = profesionalesQueTrabajan > 0
          ? porcentajeTotalDia / profesionalesQueTrabajan
          : 0;
        estadoOcupacion = obtenerEstadoOcupacion(PORCENTAJE_PROMEDIO_DIA);
      }

      resumenOcupacion[CLAVE_FECHA] = {
        ...estadoOcupacion,
        profesionales: porcentajesProfesionales,
        totalTurnos: totalTurnosDia,
        turnosPorProfesional: turnosPorProfesional,
        hayAgenda: hayAgendaEsteDia,
        esLicencia: estadoOcupacion.estado === 'licencia'
      };

      fechaActual = addDays(fechaActual, 1);
    }

    return createResponse(200, 'Resumen de ocupación obtenido exitosamente', resumenOcupacion);
  } catch (error) {
    console.error('Error al obtener el resumen de ocupación:', error);
    return createResponse(500, 'Error interno del servidor', null);
  }
};