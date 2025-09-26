import db from '@/db';
import { turnos, users } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, gte, lte } from 'drizzle-orm';

import { pacientes } from '@/db/schema';
import { addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const APP_TIME_ZONE = 'America/Argentina/Buenos_Aires';

// GET /api/agenda?fecha=YYYY-MM-DD
export const GET: APIRoute = async ({ locals, request }) => {
  // 1. Validar sesion
  if (!locals.session) {
    return createResponse(401, 'No autorizado');
  }

  // 2. Obtener y validar la fecha de la consulta
  const url = new URL(request.url);
  const fechaQuery = url.searchParams.get('fecha'); // ej: '2025-09-22'
  const profesionalId = url.searchParams.get('profesionalId');
  if (!fechaQuery || !/^\d{4}-\d{2}-\d{2}$/.test(fechaQuery)) {
    return createResponse(400, 'Fecha no proporcionada o en formato incorrecto. Use YYYY-MM-DD.');
  }

  // 3. Definir la jornada laboral y la duración de los slots
  const JORNADA_LABORAL = [
    { inicio: 8, fin: 12 }, // Turno mañana (8:00 a 11:59)
    { inicio: 18, fin: 22 }, // Turno tarde (18:00 a 21:59)
  ];
  const DURACION_SLOT_MINUTOS = 30;

  try {
    // 4. Obtener los turnos existentes para el día seleccionado (en UTC)
    const inicioDelDia = toZonedTime(`${fechaQuery}T00:00:00`, APP_TIME_ZONE);
    const finDelDia = toZonedTime(`${fechaQuery}T23:59:59`, APP_TIME_ZONE);

    const turnosDelDia = await db
      .select({
        id: turnos.id,
        fechaTurno: turnos.fechaTurno,
        duracion: turnos.duracion,
        pacienteNombre: pacientes.nombre,
        pacienteApellido: pacientes.apellido,
        pacienteCelular: pacientes.celular,
        profesionalNombre: users.nombre,
        profesionalApellido: users.apellido,
        estado: turnos.estado,
        horaTurno: turnos.fechaTurno,
        motivoConsulta: turnos.motivoConsulta,
      })
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
      .leftJoin(users, eq(turnos.userMedicoId, users.id))
      .where(
        and(
          gte(turnos.fechaTurno, inicioDelDia),
          lte(turnos.fechaTurno, finDelDia),
          eq(turnos.userMedicoId, profesionalId)
        )
      );

    // 5. Generar todos los slots posibles para la jornada laboral (en UTC)
    const slotsDelDia = [];
    JORNADA_LABORAL.forEach(rango => {
      let currentSlotUtc = toZonedTime(
        `${fechaQuery}T${String(rango.inicio).padStart(2, '0')}:00:00`,
        APP_TIME_ZONE
      );
      const endSlotUtc = toZonedTime(
        `${fechaQuery}T${String(rango.fin).padStart(2, '0')}:00:00`,
        APP_TIME_ZONE
      );

      while (currentSlotUtc < endSlotUtc) {
        slotsDelDia.push(new Date(currentSlotUtc));
        currentSlotUtc = addMinutes(currentSlotUtc, DURACION_SLOT_MINUTOS);
      }
    });

    // 6. Fusionar turnos y slots para crear la agenda completa
    const agendaCompleta = slotsDelDia.map(slotInicio => {
      const slotFin = new Date(slotInicio.getTime() + DURACION_SLOT_MINUTOS * 60000);

      // Buscar si algún turno existente se superpone con este slot
      const turnoOcupante = turnosDelDia.find(turno => {
        const turnoInicio = new Date(turno.fechaTurno);
        const turnoFin = new Date(
          turnoInicio.getTime() + (turno.duracion || DURACION_SLOT_MINUTOS) * 60000
        );
        // Lógica de superposición de intervalos: (InicioA < FinB) y (FinA > InicioB)
        return slotInicio < turnoFin && slotFin > turnoInicio && turno.estado !== 'cancelado';
      });

      if (turnoOcupante) {
        return {
          hora: slotInicio.toISOString(),
          disponible: false,
          turnoInfo: {
            id: turnoOcupante.id,
            pacienteCelular: turnoOcupante.pacienteCelular,
            pacienteNombre: turnoOcupante.pacienteNombre,
            pacienteApellido: turnoOcupante.pacienteApellido,
            profesionalNombre: turnoOcupante.profesionalNombre,
            profesionalApellido: turnoOcupante.profesionalApellido,
            motivoConsulta: turnoOcupante.motivoConsulta,
            horaTurno: turnoOcupante.horaTurno,
            duracion: turnoOcupante.duracion,
            estado: turnoOcupante.estado,
          },
        };
      } else {
        return {
          hora: slotInicio.toISOString(),
          disponible: true,
          turnoInfo: null,
        };
      }
    });

    return createResponse(200, 'Agenda del día obtenida exitosamente', agendaCompleta);
  } catch (error) {
    console.error('Error al obtener la agenda del día:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};

// POST /api/turnos
export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Validar sesion
  const { user } = locals;
  if (!user) {
    return createResponse(401, 'No autorizado');
  }

  // 2. Leer y validar el body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return createResponse(400, 'El cuerpo de la solicitud no es un JSON válido');
  }

  const {
    pacienteId,
    fechaTurno, // timestamp
    duracion,
    tipoConsulta,
    motivoConsulta,
    motivoInicial,
  } = body;

  if (!pacienteId || !fechaTurno || !duracion) {
    return createResponse(
      400,
      'Faltan campos requeridos: pacienteId, fechaTurno y duracion son obligatorios'
    );
  }

  try {
    const newTurnoId = nanoid();
    const nuevoTurno = await db
      .insert(turnos)
      .values({
        id: newTurnoId,
        pacienteId: pacienteId,
        otorgaUserId: user.id, // Quien otorga el turno (el medico logueado)
        userMedicoId: user.id, // El medico que atendera (por defecto el logueado)
        fechaTurno: fechaTurno,
        duracion: duracion,
        tipoConsulta: tipoConsulta,
        motivoConsulta: motivoConsulta,
        motivoInicial: motivoInicial,
        estado: 'pendiente', // Estado inicial del turno
      })
      .returning();

    return createResponse(201, 'Turno creado exitosamente', nuevoTurno);
  } catch (error) {
    console.error('Error al crear el turno:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
