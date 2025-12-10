import db from '@/db';
import { licenciasProfesional } from '@/db/schema'; // Necesitarás crear esta tabla
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, gte, lte } from 'drizzle-orm';

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
        const nuevaLicencia = await db.insert(licenciasProfesional).values({
            id: nanoIDNormalizador('lic'),
            userId,
            centroMedicoId,
            fechaInicio: inicio,
            fechaFin: fin,
            motivo: motivo || 'Sin especificar',
            tipo: tipo || 'vacaciones', // vacaciones, enfermedad, personal, etc.
            estado: 'activa',
        }).returning();

        return createResponse(201, 'Licencia creada con éxito', nuevaLicencia[0]);

    } catch (error) {
        console.error('Error al crear licencia:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
