import db from '@/db';
import { users, usersCentrosMedicos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, cookies, locals }) => {
    try {
        // 1. Autenticación
        const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return createResponse(401, 'No autorizado');
        }

        const { user: currentUser } = locals;
        const { session } = await lucia.validateSession(sessionId);

        if (!session || !currentUser) {
            return createResponse(401, 'No autorizado');
        }

        const { id } = params;
        if (!id) {
            return createResponse(400, 'ID de usuario requerido');
        }

        // 2. Obtener datos del usuario
        const [userData] = await db
            .select({
                id: users.id,
                nombre: users.nombre,
                apellido: users.apellido,
                email: users.email,
                dni: users.dni,
                documento: users.documento,
                cuil: users.cuil,
                cuit: users.cuit,
                telefono: users.telefono,
                celular: users.celular,
                direccion: users.direccion,
                ciudad: users.ciudad,
                provincia: users.provincia,
                pais: users.pais,
                mp: users.mp,
                especialidad: users.especialidad,
                abreviatura: users.abreviatura,
                srcPhoto: users.srcPhoto,
                rol: users.rol,
                activo: users.activo,
            })
            .from(users)
            .where(eq(users.id, id));

        if (!userData) {
            return createResponse(404, 'Usuario no encontrado');
        }

        // 3. Obtener relación con centro médico
        const [userCentro] = await db
            .select()
            .from(usersCentrosMedicos)
            .where(eq(usersCentrosMedicos.userId, id));

        // 4. Combinar datos
        const userComplete = {
            ...userData,
            rolEnCentro: userCentro?.rolEnCentro || userData.rol,
            centroMedicoId: userCentro?.centroMedicoId,
            emailUser: userCentro?.emailUser || userData.email,
        };

        // 5. Si es recepcionista, buscar profesionales vinculados (REVERTIDO)
        /* if (userData.rol === 'recepcion' || userCentro?.rolEnCentro === 'recepcion') {
             const vinculaciones = await db
                 .select()
                 .from(recepcionistaProfesional)
                 .where(eq(recepcionistaProfesional.recepcionistaId, id));
 
             (userComplete as any).profesionalesVinculados = vinculaciones.map(v => v.profesionalId);
         } */

        return createResponse(200, 'OK', userComplete);

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};

export const PUT: APIRoute = async ({ params, request, cookies, locals }) => {

    try {
        // 1. Autenticación
        const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return createResponse(401, 'No autorizado');
        }

        const { user: currentUser } = locals;
        const { session } = await lucia.validateSession(sessionId);

        if (!session || !currentUser) {
            return createResponse(401, 'No autorizado');
        }

        const { id } = params;
        if (!id) {
            return createResponse(400, 'ID de usuario requerido');
        }

        // 2. Verificar que el usuario existe
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, id));

        if (!existingUser) {
            return createResponse(404, 'Usuario no encontrado');
        }

        // 3. Obtener datos del body
        const body = await request.json();
        const { nombre, apellido, email, documento, mp, especialidad, celular } = body;
        // 4. Validaciones básicas
        if (!nombre || !apellido || !email) {
            return createResponse(400, 'Nombre, apellido y email son obligatorios');
        }

        // 5. Actualizar usuario
        const updatedUser = await db
            .update(users)
            .set({
                ...body,
                updated_at: new Date(),
            })
            .where(eq(users.id, id)).returning()





        return createResponse(200, 'Usuario actualizado correctamente', updatedUser);

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
