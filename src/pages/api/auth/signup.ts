import db from '@/db';
import { centrosMedicos, preferenciaPerfilUser, users, usersCentrosMedicos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { generateId } from 'lucia';

export async function POST({ request, cookies }: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password, nombre, apellido, nombreCentro } = formData;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  // --- Validaciones ---
  if (!email || !password || !nombre || !apellido || !nombreCentro) {
    return createResponse(400, 'Faltan campos requeridos');
  }
  if (password.length < 6) {
    return createResponse(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const existingUser = (await db.select().from(users).where(eq(users.email, email))).at(0);
  if (existingUser) {
    return createResponse(400, 'El email ya está registrado');
  }

  const userId = generateId(15);
  const hashPassword = await bcrypt.hash(password, 12);

  try {
    // --- Transacción para asegurar la atomicidad ---
    const { newUser, newCentro, newRelation } = await db.transaction(async tx => {
      console.log('creando usuario --> ⌛', userId);
      // 1. Crear el usuario
      const [createdUser] = await tx
        .insert(users)
        .values({
          id: userId,
          email: email,
          nombre: nombre,
          apellido: apellido,
          password: hashPassword,

          rol: 'admin', // Rol global del dueño del centro
        })
        .returning();

      if (!createdUser) {
        tx.rollback();
        return {};
      }
      console.log('creando preferencia --> ⌛', userId);

      // 2. Crear las preferencias de perfil para el nuevo usuario
      await tx.insert(preferenciaPerfilUser).values({
        id: nanoIDNormalizador('pref'), // Generar un ID para la preferencia
        userId: userId,
        nombrePerfil: 'Default', // O un nombre de perfil que tenga sentido
        especialidad: 'General', // O la especialidad por defecto
        estado: 'activo',
        // Las preferencias JSON se establecerán con el valor por defecto del schema
      });

      // 3. Crear el Centro Médico
      console.log('creando centro --> ⌛');
      const [createdCentro] = await tx
        .insert(centrosMedicos)
        .values({
          id: nanoIDNormalizador('ce'),
          nombre: nombreCentro,
          creadoPorId: userId,
          modificadoUltimoPorId: userId,
          tipo: 'consultorio', // o el tipo que definas por defecto
        })
        .returning();

      if (!createdCentro) {
        tx.rollback();
        return {};
      }

      console.log('creando relacion de userCentro');
      // 3. Vincular el usuario al centro
      const [createdRelation] = await tx
        .insert(usersCentrosMedicos)
        .values({
          userId: createdUser.id,
          centroMedicoId: createdCentro.id,
          nombreCentroMedico: nombreCentro,
          rolEnCentro: 'adminLocal', // Rol específico en ese centro
        })
        .returning();

      return { newUser: createdUser, newCentro: createdCentro, newRelation: createdRelation };
    });

    if (!newUser || !newCentro) {
      return createResponse(500, 'No se pudo completar el registro. Por favor, intente de nuevo.');
    }

    // --- Auditoría (opcional, pero buena práctica) ---
    // ... puedes añadir logs para la creación del centro y la relación si lo deseas

    // --- Creación de Sesión y Cookies ---
    const session = await lucia.createSession(userId, {
      centroMedicoId: newCentro.id,
      nombreCentro: newCentro.nombre,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    const userData = {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      rol: newUser.rol,
      centroMedicoId: newCentro.id,
      nombreCentro: newCentro.nombre,
    };

    const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, { expiresIn: '14d' });
    cookies.set('userData', token, {
      httpOnly: true,
      secure: import.meta.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 3600,
      path: '/',
    });

    return createResponse(200, 'Usuario y consultorio creados con éxito');
  } catch (error) {
    console.error('Error al crear el usuario y consultorio:', error);
    return createResponse(500, 'Error interno del servidor');
  }
}
