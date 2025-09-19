import db from '@/db';
import { pacientes, turnos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET /api/turnos
export const GET: APIRoute = async ({ locals }) => {
  // 1. Validar sesion
  if (!locals.session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    // 2. Consultar la base de datos
    const turnosFromDb = await db
      .select({
        id: turnos.id,
        title: pacientes.nombre,
        start: turnos.fechaTurno,
        duracion: turnos.duracion,
      })
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id));
    // TODO: Filtrar por médico si es necesario

    // 3. Calcular la fecha de fin usando la duración
    const turnosData = turnosFromDb.map(turno => {
      const startDate = new Date(turno.start);
      const durationMinutes = turno.duracion || 30; // Usar 30 min por defecto si no está definida
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000); // Duración en milisegundos
      return {
        ...turno,
        end: endDate,
      };
    });

    return createResponse(200, 'Turnos obtenidos exitosamente', turnosData);
  } catch (error) {
    console.error('Error al obtener los turnos:', error);
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
