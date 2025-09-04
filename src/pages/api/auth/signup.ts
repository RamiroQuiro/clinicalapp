import db from '@/db';
import { users } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { generateId } from 'lucia';

export async function POST({ request, cookies }: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password, nombre, apellido } = formData;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  if (!email || !password || !nombre || !apellido) {
    return createResponse(400, 'Faltan campos requeridos');
  }
  if (password.length < 6) {
    return createResponse(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (existingUser) {
    return createResponse(400, 'El email ya está registrado');
  }

  const userId = generateId(15);
  const hashPassword = await bcrypt.hash(password, 12);

  try {
    const newUser = (
      await db
        .insert(users)
        .values({
          id: userId,
          email: email,
          nombre: nombre,
          apellido: apellido,
          password: hashPassword,
        })
        .returning()
    ).at(0);

    if (!newUser) {
      return createResponse(500, 'No se pudo crear el usuario');
    }

    // Clonar el objeto de usuario y eliminar la contraseña para la auditoría
    const newValueForAudit = { ...newUser };
    delete newValueForAudit.password;

    await logAuditEvent({
      userId: userId, // El usuario que se está creando es el actor principal
      actionType: 'CREATE',
      tableName: 'users',
      recordId: userId,
      newValue: newValueForAudit,
      description: `Se ha registrado un nuevo usuario: ${email}`,
      ipAddress,
      userAgent,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    const userData = {
      id: newUser.id,
      nombre: newUser.nombre,
      apellido: newUser.apellido,
      email: newUser.email,
      rol: newUser.rol,
    };

    const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, { expiresIn: '14d' });
    cookies.set('userData', token, {
      httpOnly: true,
      secure: import.meta.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 3600,
      path: '/',
    });

    return createResponse(200, 'Usuario creado con éxito');
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return createResponse(500, 'Error interno del servidor');
  }
}

