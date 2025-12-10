import db from '@/db';
import { users } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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
        const { currentPassword, newPassword, confirmPassword } = body;

        // 4. Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            return createResponse(400, 'Todos los campos son obligatorios');
        }

        if (newPassword !== confirmPassword) {
            return createResponse(400, 'Las contraseñas nuevas no coinciden');
        }

        if (newPassword.length < 6) {
            return createResponse(400, 'La contraseña debe tener al menos 6 caracteres');
        }

        // 5. Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isPasswordValid) {
            return createResponse(401, 'Contraseña actual incorrecta');
        }

        // 6. Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 7. Actualizar contraseña
        await db
            .update(users)
            .set({
                password: hashedPassword,
                updated_at: new Date(),
            })
            .where(eq(users.id, id));

        // 8. Opcional: Invalidar todas las sesiones excepto la actual
        // await lucia.invalidateUserSessions(id);
        // await lucia.createSession(id, {});

        return createResponse(200, 'Contraseña actualizada correctamente');

    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
