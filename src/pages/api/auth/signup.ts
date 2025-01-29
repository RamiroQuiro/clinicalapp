import type { APIContext } from "astro";

import db from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";

export async function POST({
  request,
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();
console.log(formData)
  const { email, password, nombre,apellido } = await formData;
  // console.log(email, password);
  if (!email || !password || !nombre || !apellido ) {
    return new Response(
      JSON.stringify({
        data: "faltan campos requeridos",
        status: 400,
      })
    );
  }
  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        data: "contraseña mayor a 6 caracteres",
        status: 400,
      })
    );
  }

  //   verificar si el usuario existe
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  // console.log(existingUser);

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        data: "email ya registrado",
        status: 400,
      })
    );
  }

  // crear usuario en DB

  const userId = generateId(15);
  // Hacemos hash de la contraseña
  const hashPassword = await bcrypt.hash(password, 12);

  await db.insert(users).values([
    {
      id: userId,
      email:email,
      nombre:nombre,
      apellido:apellido,
      password: hashPassword,
    },
  ]);

  const session = await lucia.createSession(userId, {
    nombre:nombre,apellido:apellido
  });
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return new Response(
    JSON.stringify({
      data: "usuario creado con exito",
      status: 200,
    })
  );
}