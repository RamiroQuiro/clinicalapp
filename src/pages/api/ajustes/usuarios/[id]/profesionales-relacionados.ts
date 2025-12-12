import db from '@/db';
import { recepcionistaProfesional, users, usersCentrosMedicos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, cookies, locals }) => {
    try {
        const { id } = params;
        if (!id) {
            return createResponse(400, 'ID de usuario requerido');
        }
        const userId = id
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId));

        if (!user) {
            return createResponse(404, 'Usuario no encontrado');
        }

        const [userCentro] = await db
            .select()
            .from(usersCentrosMedicos)
            .where(eq(usersCentrosMedicos.userId, userId));

        if (!userCentro) {
            return createResponse(404, 'Centro médico no encontrado');
        }

        const relacionesConProfesional = await db.select({
            profesionalId: recepcionistaProfesional.profesionalId,
            nombreProfesional: users.nombre,
            apellidoProfesional: users.apellido,
            emailProfesional: users.email,
            documentoProfesional: users.documento,
            mpProfesional: users.mp,
            especialidadProfesional: users.especialidad,
            celularProfesional: users.celular,
            direccionProfesional: users.direccion,
            ciudadProfesional: users.ciudad,
            provinciaProfesional: users.provincia,
            paisProfesional: users.pais,
            mpProfesional: users.mp,
            especialidadProfesional: users.especialidad,
            abreviaturaProfesional: users.abreviatura,
            srcPhotoProfesional: users.srcPhoto,
            rolProfesional: users.rol,
            activoProfesional: users.activo,
        }).from(recepcionistaProfesional).innerJoin(users, eq(recepcionistaProfesional.profesionalId, users.id)).where(eq(recepcionistaProfesional.recepcionistaId, userId))
        console.log('conulta de lrelaciones', relacionesConProfesional)
        return createResponse(200, 'OK', relacionesConProfesional);
    } catch (error) {
        console.error('Error al obtener profesionales relacionados:', error);
        return createResponse(500, 'Error interno del servidor');
    }
}