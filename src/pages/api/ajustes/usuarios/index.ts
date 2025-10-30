import type { APIRoute } from 'astro';


import db from '@/db';
import { preferenciaPerfilUser, users, usersCentrosMedicos } from '@/db/schema';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import bcrypt from 'bcrypt';
import { and, eq, or } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
    const { session, user } = locals

    if (!session || !user) {
        return createResponse(401, 'No autorizado', true);
    }

    const [adminUserCentro] = await db.select().from(usersCentrosMedicos).where(and(eq(usersCentrosMedicos.userId, user.id), or(eq(usersCentrosMedicos.rolEnCentro, 'admin'), eq(usersCentrosMedicos.rolEnCentro, 'superadmin'))));

    if (!adminUserCentro) {
        return createResponse(403, 'Acción no permitida. Se requiere rol de administrador.', true);
    }

    const centroMedicoId = adminUserCentro.centroMedicoId;
    const formData = await request.json();
    const { nombre, apellido, email, password, rol, especialidad, dni, mp, avatar } = formData;

    if (!nombre || !apellido || !email || !password || !rol) {
        return createResponse(400, 'Faltan campos obligatorios.', true);
    }

    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email));

        if (existingUser.length > 0) {
            return createResponse(409, 'El email ya está en uso.', true);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUserId = nanoIDNormalizador('us');


        // --- Transacción para asegurar la atomicidad ---
        const { newUser, newRelation } = await db.transaction(async tx => {

            // 1. Crear el usuario
            const [createdUser] = await tx
                .insert(users)
                .values({
                    id: newUserId,
                    nombre,
                    apellido,
                    email,
                    dni,
                    mp,
                    avatar,
                    password: hashedPassword,
                })
                .returning();

            if (!createdUser) {
                tx.rollback();
                return {};
            }

            const newPreferenciaPerfilUser = nanoIDNormalizador('pref');




            console.log('creando relacion de userCentro');
            // 3. Vincular el usuario al centro
            const [createdRelation] = await tx
                .insert(usersCentrosMedicos)
                .values({
                    userId: createdUser.id,
                    centroMedicoId: centroMedicoId,
                    // TODO: Obtener el nombre real del centro médico en lugar de usar el ID
                    nombreCentroMedico: centroMedicoId, 
                    rolEnCentro: rol, // Rol específico en ese centro
                })
                .returning();


            if (rol === 'profesional') {
                const newPreferenciaPerfilUser = nanoIDNormalizador('pref');
                await tx.insert(preferenciaPerfilUser).values({
                    id: newPreferenciaPerfilUser,
                    userId: newUserId,
                    nombrePerfil: 'Default', // O un nombre de perfil que tenga sentido
                    especialidad: especialidad || 'General', // Usar la especialidad del form o una por defecto
                    estado: 'activo',
                    // Las preferencias JSON se establecerán con el valor por defecto del schema
                });
            }

            return { newUser: createdUser, newRelation: createdRelation };
        });
        return createResponse(201, 'Usuario creado con éxito', false);

    } catch (error) {
        console.error('Error al crear el usuario:', error);
        if (error instanceof Error && error.message.includes('Faltan campos profesionales')) {
            return createResponse(400, error.message, true);
        }
        return createResponse(500, 'Error interno del servidor.', true);
    }
};