import db from '@/db';
import { users, usersCentrosMedicos } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIContext } from 'astro';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST({ request, cookies }: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password } = formData;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  if (!email || !password) {
    return createResponse(400, 'Email y contraseña son requeridos');
  }

  const user = (await db.select().from(users).where(eq(users.email, email))).at(0);

  if (!user) {
    await logAuditEvent({
      userId: email, // Usamos el email porque no tenemos ID de usuario
      actionType: 'LOGIN_FAILURE',
      tableName: 'users',
      description: `Intento de login fallido: usuario no encontrado con email ${email}.`,
      ipAddress,
      userAgent,
    });
    return createResponse(400, 'Email o contraseña incorrecta');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    await logAuditEvent({
      userId: user.id,
      actionType: 'LOGIN_FAILURE',
      tableName: 'users',
      recordId: user.id,
      description: `Intento de login fallido: contraseña incorrecta para el usuario ${user.email}.`,
      ipAddress,
      userAgent,
    });
    return createResponse(400, 'Email o contraseña incorrecta');
  }

  const centroMedico = (
    await db.select().from(usersCentrosMedicos).where(eq(usersCentrosMedicos.userId, user.id))
  ).at(0);

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  const userData = {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    centroMedicoId: centroMedico?.centroMedicoId,
    centroMedico: centroMedico?.nombreCentroMedico,
    rol: user.rol,
    rolEnCentro: centroMedico?.rolEnCentro,
  };

  const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, { expiresIn: '14d' });
  cookies.set('userData', token, {
    httpOnly: true,
    secure: import.meta.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 14 * 24 * 3600,
    path: '/',
  });

  await logAuditEvent({
    userId: user.id,
    actionType: 'LOGIN_SUCCESS',
    tableName: 'users',
    recordId: user.id,
    description: `El usuario ${user.email} ha iniciado sesión correctamente.`,
    ipAddress,
    userAgent,
  });

  return createResponse(200, 'Inicio de sesión exitoso');
}
