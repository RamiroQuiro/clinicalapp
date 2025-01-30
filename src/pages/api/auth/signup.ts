import type { APIContext } from 'astro';

import db from '@/db';
import { users } from '@/db/schema';
import { lucia } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { generateId } from 'lucia';

export async function POST({ request, redirect, cookies }: APIContext): Promise<Response> {
  const formData = await request.json();
  console.log(formData);
  const { email, password, nombre, apellido } = await formData;
  // console.log(email, password);
  if (!email || !password || !nombre || !apellido) {
    return new Response(
      JSON.stringify({
        data: 'faltan campos requeridos',
        status: 400,
      })
    );
  }
  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        data: 'contraseña mayor a 6 caracteres',
        status: 400,
      })
    );
  }

  //   verificar si el usuario existe
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  // console.log(existingUser);

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        data: 'email ya registrado',
        status: 400,
      })
    );
  }

  // crear usuario en DB

  const userId = generateId(15);
  // Hacemos hash de la contraseña
  const hashPassword = await bcrypt.hash(password, 12);

  const newUser = (
    await db
      .insert(users)
      .values([
        {
          id: userId,
          email: email,
          nombre: nombre,
          apellido: apellido,
          password: hashPassword,
        },
      ])
      .returning()
  ).at(0);
  console.log('NUEV USUARIO->', newUser);
  const session = await lucia.createSession(userId, {
    nombre: nombre,
    apellido: apellido,
  });
  console.log('sesion de usuario de alta ', session);
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  // Crear una cookie con los datos del usuario
  const userData = {
    id: newUser.id,
    nombre: newUser.nombre,
    apellido: newUser.apellido,
    email: newUser.email,
  };

  const token = jwt.sign(userData, import.meta.env.SECRET_KEY_CREATECOOKIE, { expiresIn: '7d' }); // Firmar la cookie
  cookies.set('userData', token, {
    httpOnly: true,
    secure: import.meta.env.NODE_ENV === 'production', // Solo enviar en HTTPS en producción
    sameSite: 'strict',
    maxAge: 3600, // 1 hora
    path: '/',
  });

  return new Response(
    JSON.stringify({
      data: 'usuario creado con exito',
      status: 200,
    })
  );
}
