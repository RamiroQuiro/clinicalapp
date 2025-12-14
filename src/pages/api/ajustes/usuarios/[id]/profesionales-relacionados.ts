import db from '@/db';
import { recepcionistaProfesional, users, usersCentrosMedicos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals }) => {
    try {
        const { id } = params;
        const { user, session } = locals

        if (!user || !session) {
            return createResponse(401, 'Usuario no autenticado');
        }
        if (!id) {
            return createResponse(400, 'ID de recepcionista requerido');
        }

        const relaciones = await db
            .select({
                profesionalId: recepcionistaProfesional.profesionalId,
                nombre: users.nombre,
                apellido: users.apellido,
                dni: users.dni,
                especialidad: users.especialidad,
                srcPhoto: users.srcPhoto,
                email: users.email,
                activo: users.activo,
            })
            .from(recepcionistaProfesional)
            .innerJoin(users, eq(recepcionistaProfesional.profesionalId, users.id))
            .where(eq(recepcionistaProfesional.recepcionistaId, id));

        return createResponse(200, 'OK', relaciones);
    } catch (error) {
        console.error('Error al obtener profesionales relacionados:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
export const POST: APIRoute = async ({ params, request, cookies, locals }) => {
    try {
        const { id } = params; // ID del recepcionista
        const body = await request.json();
        const { profesionalId } = body;

        if (!id || !profesionalId) {
            return createResponse(400, 'Faltan datos requeridos (recepcionistaId o profesionalId)');
        }

        // Verificar o obtener el Centro Medico (asumimos el del usuario actual o buscamos)
        // Para simplificar, obtenemos la relación del recepcionista con su centro
        const [relacionCentro] = await db
            .select()
            .from(usersCentrosMedicos)
            .where(eq(usersCentrosMedicos.userId, id));

        if (!relacionCentro) {
            return createResponse(404, 'El recepcionista no tiene centro médico asignado');
        }

        // Verificar si ya existe la relación
        const [existing] = await db
            .select()
            .from(recepcionistaProfesional)
            .where(and(
                eq(recepcionistaProfesional.recepcionistaId, id),
                eq(recepcionistaProfesional.profesionalId, profesionalId)
            ));

        if (existing) {
            return createResponse(409, 'La relación ya existe');
        }

        // Crear relación
        await db.insert(recepcionistaProfesional).values({
            id: crypto.randomUUID(), // o usar tu nanoIDNormalizador si lo importas
            recepcionistaId: id,
            profesionalId: profesionalId,
            centroMedicoId: relacionCentro.centroMedicoId, // Ahora es string, ok
            nombreCentroMedico: relacionCentro.nombreCentroMedico,
            rolEnCentro: 'recepcion', // Rol de quien recibe (el recepcionista)
            emailUser: relacionCentro.emailUser, // Email del recepcionista
        });

        return createResponse(201, 'Relación creada correctamente');

    } catch (error) {
        console.error('Error al crear relación:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};