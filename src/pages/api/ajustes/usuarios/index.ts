import db from '@/db';
import { preferenciaPerfilUser, recepcionistaProfesional, users, usersCentrosMedicos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { subscriptionService } from '@/services/suscripciones/SubscriptionService';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { and, count, eq, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, cookies, locals }) => {
    // ... existing GET implementation ...
    try {
        const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return createResponse(401, 'No autorizado');
        }

        const { user: currentUser } = locals;
        const { session } = await lucia.validateSession(sessionId);

        if (!session || !currentUser) {
            return createResponse(401, 'No autorizado');
        }

        const url = new URL(request.url);
        const search = url.searchParams.get('search') || '';
        const rol = url.searchParams.get('rol') || '';

        // Construir condiciones
        const condiciones: any[] = [];

        if (rol) {
            condiciones.push(eq(users.rol, rol as any));
        }

        if (search) {
            // ... existing search logic ...
            condiciones.push(
                or(
                    like(users.nombre, `%${search}%`),
                    like(users.apellido, `%${search}%`),
                    like(users.dni, `%${search}%`)
                )
            );
        }

        const listaUsuarios = await db
            .select({
                id: users.id,
                // ... fields
                nombre: users.nombre,
                apellido: users.apellido,
                documento: users.documento,
                srcPhoto: users.srcPhoto,
                especialidad: users.especialidad,
                rol: users.rol
            })
            .from(users)
            .where(and(...condiciones))
            .limit(50);

        return createResponse(200, 'OK', listaUsuarios);

    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};

export const POST: APIRoute = async ({ request, locals }) => {
    const { session, user: adminLocals } = locals;

    if (!session || !adminLocals) {
        return createResponse(401, 'No autorizado', true);
    }

    console.log('--- Iniciando flujo de creación/asignación de usuario ---');

    const [adminUserCentro] = await db.select().from(usersCentrosMedicos).where(and(eq(usersCentrosMedicos.userId, adminLocals.id), or(eq(usersCentrosMedicos.rolEnCentro, 'admin'), eq(usersCentrosMedicos.rolEnCentro, 'adminLocal'))));

    if (!adminUserCentro) {
        return createResponse(403, 'Acción no permitida. Se requiere rol de administrador.', true);
    }

    const centroMedicoId = adminUserCentro.centroMedicoId;
    const formData = await request.json();
    console.log('1. Datos recibidos del formulario:', formData);

    const { nombre, apellido, email, password, rol, especialidad, dni, mp, avatar, profesionales } = formData;

    if (!dni || !email || !nombre || !apellido || !rol) {
        return createResponse(400, 'DNI, email, nombre, apellido y rol son obligatorios.', true);
    }

    // --- VERIFICACIÓN DE LÍMITES DE SUSCRIPCIÓN ---
    let resourceKey = '';
    if (rol === 'profesional') resourceKey = 'maxProfesionales';
    else if (rol === 'recepcion') resourceKey = 'maxSecretarias';

    if (resourceKey) {
        // Contamos cuántos usuarios de este rol ya existen en el centro
        const [usage] = await db
            .select({ count: count() })
            .from(usersCentrosMedicos)
            .where(and(
                eq(usersCentrosMedicos.centroMedicoId, centroMedicoId),
                eq(usersCentrosMedicos.rolEnCentro, rol)
            ));

        const currentCount = usage?.count || 0;
        const check = await subscriptionService.checkLimit(centroMedicoId, resourceKey, currentCount);

        if (!check.allowed) {
            console.log(`❌ Límite excedido para ${resourceKey}: Actual ${currentCount} / Límite ${check.limit}`);
            return createResponse(403, `Has alcanzado el límite de ${rol}s (${check.limit}) permitido por tu plan actual. Por favor, actualiza tu suscripción para agregar más.`, true);
        }
    }

    try {
        console.log(`2. Buscando usuario existente por DNI: ${dni}`);
        const [existingUserByDni] = await db.select().from(users).where(eq(users.dni, dni));

        if (existingUserByDni) {
            // --- ESCENARIO 1: EL DNI YA EXISTE --- (La persona ya está en el sistema)
            console.log('  -> El DNI ya existe. Usuario encontrado:', existingUserByDni);

            const [existingRelation] = await db.select().from(usersCentrosMedicos).where(and(eq(usersCentrosMedicos.userId, existingUserByDni.id), eq(usersCentrosMedicos.centroMedicoId, centroMedicoId)));

            if (existingRelation) {
                console.log('  -> Error: El usuario ya pertenece a este centro médico.');
                return createResponse(409, `Esta persona ya está registrada en este centro con el rol de '${existingRelation.rolEnCentro}' y el email '${existingRelation.emailUser}'.`, true);
            }

            console.log('  -> El usuario existe pero no en este centro. Creando nueva relación...');
            await db.insert(usersCentrosMedicos).values({
                id: nanoIDNormalizador('user_cm'),
                userId: existingUserByDni.id,
                centroMedicoId: centroMedicoId,
                nombreCentroMedico: centroMedicoId, // TODO: Obtener el nombre real del centro
                rolEnCentro: rol,
                emailUser: email,
            });

            console.log('  -> Relación creada con éxito.');
            return createResponse(200, 'Usuario existente añadido a este centro médico.', false);

        } else {
            // --- ESCENARIO 2: EL DNI NO EXISTE --- (Es una persona nueva en el sistema)
            console.log('  -> El DNI es nuevo.');

            console.log(`  -> Verificando si el email '${email}' ya está en uso por otro usuario...`);
            const [existingUserByEmail] = await db.select().from(users).where(eq(users.email, email));

            if (existingUserByEmail) {
                console.log('  -> Error: El email ya está en uso por otro DNI.');
                return createResponse(409, `El email '${email}' ya está en uso por otra persona (DNI: ${existingUserByEmail.dni}). Por favor, use un email diferente.`, true);
            }

            if (!password) {
                return createResponse(400, 'La contraseña es obligatoria para usuarios nuevos.', true);
            }

            console.log('  -> Email disponible. Procediendo a crear el nuevo usuario y la relación...');

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUserId = nanoIDNormalizador('us');

            await db.transaction(async (tx) => {
                console.log('    -> Creando registro en la tabla `users`');
                const [createdUser] = await tx.insert(users).values({
                    id: newUserId,
                    nombre,
                    apellido,
                    email,
                    dni,
                    mp,
                    especialidad,
                    srcPhoto: avatar,
                    rol,
                    password: hashedPassword,
                }).returning();

                console.log('    -> Creando relación en `usersCentrosMedicos`');
                await tx.insert(usersCentrosMedicos).values({
                    id: nanoIDNormalizador('user_cm'),
                    userId: newUserId,
                    centroMedicoId: centroMedicoId,
                    nombreCentroMedico: centroMedicoId,
                    rolEnCentro: rol,
                    esProfesional: rol === 'profesional' ? true : false,
                    emailUser: email,
                });

                if (rol === 'profesional') {
                    console.log('    -> Creando preferencias de perfil para profesional');
                    const newPreferenciaPerfilUser = nanoIDNormalizador('pref');
                    await tx.insert(preferenciaPerfilUser).values({
                        id: newPreferenciaPerfilUser,
                        userId: newUserId,
                        nombrePerfil: 'Default',
                        especialidad: especialidad || 'General',
                        estado: 'activo',
                    });
                }

                if (rol === 'recepcion' && profesionales.length > 0) {
                    console.log(`    -> Creando ${profesionales.length} relaciones en \`recepcionistaProfesional\``);
                    const recepcionistaProfesionalInserts = profesionales.map((profesionalId: string) => {

                        return tx.insert(recepcionistaProfesional).values({
                            centroMedicoId: centroMedicoId,
                            nombreCentroMedico: centroMedicoId, // TODO: Obtener nombre real
                            rolEnCentro: rol,
                            recepcionistaId: newUserId,
                            profesionalId: profesionalId,
                            emailUser: email,
                        });
                    });
                    await Promise.all(recepcionistaProfesionalInserts);
                }
            });
            console.log('5. Transacción completada. Usuario nuevo creado con éxito.');
            return createResponse(201, 'Usuario nuevo creado y añadido al centro con éxito.', false);
        }

    } catch (error) {
        console.error('Error en el proceso de creación de usuario:', error);
        // Manejo de errores de Drizzle por constraints únicos
        if (error.message.includes('UNIQUE constraint failed')) {
            if (error.message.includes('users.dni')) {
                return createResponse(500, 'Error de concurrencia: El DNI fue registrado por otro proceso. Intente de nuevo.', true);
            }
            if (error.message.includes('users.email')) {
                return createResponse(500, 'Error de concurrencia: El email fue registrado por otro proceso. Intente de nuevo.', true);
            }
            if (error.message.includes('usersCentrosMedicos.userId, usersCentrosMedicos.centroMedicoId')) {
                return createResponse(500, 'Error de concurrencia: Este usuario ya fue añadido al centro por otro proceso. Intente de nuevo.', true);
            }
        }
        return createResponse(500, 'Error interno del servidor.', true);
    }
};