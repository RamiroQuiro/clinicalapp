import db from '@/db';
import { licenciasProfesional, pacientes, turnos } from '@/db/schema';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';

// GET - Obtener licencias de un profesional
export const GET: APIRoute = async ({ request, locals }) => {
    const { session, user } = locals;
    if (!session) {
        return createResponse(401, 'No autorizado');
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const desde = url.searchParams.get('desde'); // Fecha inicio rango
    const hasta = url.searchParams.get('hasta'); // Fecha fin rango

    if (!userId) {
        return createResponse(400, 'Falta el parámetro userId');
    }

    try {
        let query = db.select().from(licenciasProfesional).where(eq(licenciasProfesional.userId, userId));

        // Filtrar por rango de fechas si se proporciona
        if (desde && hasta) {
            query = query.where(
                and(
                    gte(licenciasProfesional.fechaInicio, new Date(desde)),
                    lte(licenciasProfesional.fechaFin, new Date(hasta))
                )
            );
        }

        const licencias = await query;

        return createResponse(200, 'Licencias obtenidas con éxito', licencias);

    } catch (error) {
        console.error('Error al obtener licencias:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};

// POST - Crear nueva licencia
export const POST: APIRoute = async ({ request, locals }) => {
    const { session, user } = locals;

    if (!session || !user) {
        return createResponse(401, 'No autorizado');
    }

    const { userId, centroMedicoId, fechaInicio, fechaFin, motivo, tipo } = await request.json();

    // Validaciones
    if (!userId || !centroMedicoId || !fechaInicio || !fechaFin) {
        return createResponse(400, 'Datos incompletos');
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (inicio > fin) {
        return createResponse(400, 'La fecha de inicio debe ser anterior a la fecha de fin');
    }

    try {
        // 🔍 VALIDACIÓN: Verificar si hay turnos agendados en el rango de fechas
        const turnosEnRango = await db
            .select({
                id: turnos.id,
                fechaTurno: turnos.fechaTurno,
                horaAtencion: turnos.horaAtencion,
                pacienteNombre: pacientes.nombre,
                pacienteApellido: pacientes.apellido,
                motivoConsulta: turnos.motivoConsulta,
                estado: turnos.estado,
            })
            .from(turnos)
            .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
            .where(
                and(
                    eq(turnos.userMedicoId, userId),
                    eq(turnos.centroMedicoId, centroMedicoId),
                    gte(turnos.fechaTurno, inicio),
                    lte(turnos.fechaTurno, fin),
                    inArray(turnos.estado, ['pendiente', 'confirmado'])
                )
            );

        // Si hay turnos, retornar error con la lista
        if (turnosEnRango.length > 0) {
            return createResponse(
                400,
                `No se puede crear la licencia. Hay ${turnosEnRango.length} turno(s) agendado(s) en ese período.`,
                {
                    turnos: turnosEnRango.map((t) => ({
                        id: t.id,
                        fecha: t.fechaTurno,
                        hora: t.horaAtencion,
                        paciente: `${t.pacienteNombre} ${t.pacienteApellido}`,
                        motivo: t.motivoConsulta,
                        estado: t.estado,
                    })),
                }
            );
        }

        // Si no hay turnos, crear la licencia
        const nuevaLicencia = await db.insert(licenciasProfesional).values({
            id: nanoIDNormalizador('lic'),
            userId,
            centroMedicoId,
            fechaInicio: inicio,
            fechaFin: fin,
            motivo: motivo || 'Sin especificar',
            tipo: tipo || 'vacaciones',
            estado: 'activa',
        }).returning();

        return createResponse(201, 'Licencia creada con éxito', nuevaLicencia[0]);

    } catch (error) {
        console.error('Error al crear licencia:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
