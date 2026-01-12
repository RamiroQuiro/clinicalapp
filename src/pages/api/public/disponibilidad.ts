import db from '@/db';
import { licenciasProfesional, turnos } from '@/db/schema';
import { agendaGeneralCentroMedico, horariosTrabajo } from '@/db/schema/agenda';
import APP_TIME_ZONE from '@/lib/timeZone';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { addMinutes, isAfter } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { and, eq, gte, lte, ne } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const fechaQuery = url.searchParams.get('fecha'); // YYYY-MM-DD
    const profesionalId = url.searchParams.get('profesionalId');
    const centroMedicoId = url.searchParams.get('centroId');

    if (!fechaQuery || !profesionalId || !centroMedicoId) {
        return createResponse(400, 'Faltan parámetros requeridos (fecha, profesionalId, centroId)');
    }

    try {
        // Definir límites del día en UTC pero interpretados desde la zona horaria de la app
        const inicioDelDia = fromZonedTime(`${fechaQuery}T00:00:00`, APP_TIME_ZONE);
        const finDelDia = fromZonedTime(`${fechaQuery}T23:59:59.999`, APP_TIME_ZONE);

        // Obtener día de la semana
        const fechaZoned = toZonedTime(inicioDelDia, APP_TIME_ZONE);
        const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemanaNombre = diasSemana[fechaZoned.getUTCDay()];

        // 1. Duración de turnos por defecto del centro
        const [configuracion] = await db
            .select()
            .from(agendaGeneralCentroMedico)
            .where(eq(agendaGeneralCentroMedico.centroMedicoId, centroMedicoId));
        const DURACION_SLOT = configuracion?.duracionTurnoPorDefecto || 30;

        // 2. Verificar licencias (si está de licencia, no hay disponibilidad)
        const licencia = await db
            .select()
            .from(licenciasProfesional)
            .where(
                and(
                    eq(licenciasProfesional.userId, profesionalId),
                    eq(licenciasProfesional.estado, 'activa'),
                    lte(licenciasProfesional.fechaInicio, finDelDia),
                    gte(licenciasProfesional.fechaFin, inicioDelDia)
                )
            )
            .limit(1);

        if (licencia.length > 0) {
            return createResponse(200, 'Profesional ausente por licencia', []);
        }

        // 3. Obtener horarios de trabajo para ese día
        const [horario] = await db
            .select()
            .from(horariosTrabajo)
            .where(
                and(
                    eq(horariosTrabajo.userMedicoId, profesionalId),
                    eq(horariosTrabajo.diaSemana, diaSemanaNombre),
                    eq(horariosTrabajo.activo, true)
                )
            );

        if (!horario) {
            return createResponse(200, 'Sin horarios configurados', []);
        }

        // 4. Obtener turnos existentes
        const turnosExistentes = await db
            .select({
                fechaTurno: turnos.fechaTurno,
                duracion: turnos.duracion,
                estado: turnos.estado,
            })
            .from(turnos)
            .where(
                and(
                    eq(turnos.userMedicoId, profesionalId),
                    eq(turnos.centroMedicoId, centroMedicoId),
                    gte(turnos.fechaTurno, inicioDelDia),
                    lte(turnos.fechaTurno, finDelDia),
                    ne(turnos.estado, 'cancelado')
                )
            );

        // 5. Generar slots basados en jornadas
        const jornadas = [];
        if (horario.horaInicioManana && horario.horaFinManana) {
            jornadas.push({ inicio: horario.horaInicioManana, fin: horario.horaFinManana });
        }
        if (horario.horaInicioTarde && horario.horaFinTarde) {
            jornadas.push({ inicio: horario.horaInicioTarde, fin: horario.horaFinTarde });
        }

        const slotsDisponibles = [];
        const ahora = new Date();

        for (const jornada of jornadas) {
            let currentUtc = fromZonedTime(`${fechaQuery}T${jornada.inicio}:00`, APP_TIME_ZONE);
            const endUtc = fromZonedTime(`${fechaQuery}T${jornada.fin}:00`, APP_TIME_ZONE);

            while (currentUtc < endUtc) {
                const slotInicio = new Date(currentUtc);
                const slotFin = addMinutes(slotInicio, DURACION_SLOT);

                // No permitir turnos en el pasado
                if (isAfter(slotInicio, ahora)) {
                    // Verificar colisión con turnos existentes
                    const ocupado = turnosExistentes.some(t => {
                        const tInicio = new Date(t.fechaTurno);
                        const tFin = addMinutes(tInicio, t.duracion || DURACION_SLOT);
                        return slotInicio < tFin && slotFin > tInicio;
                    });

                    if (!ocupado) {
                        slotsDisponibles.push(slotInicio.toISOString());
                    }
                }

                currentUtc = addMinutes(currentUtc, DURACION_SLOT);
            }
        }

        return createResponse(200, 'Disponibilidad obtenida con éxito', slotsDisponibles);
    } catch (error) {
        console.error('Error en /api/public/disponibilidad:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
