import db from "@/db";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import type { APIContext } from "astro";
import bcrypt from 'bcryptjs';
import { eq } from "drizzle-orm";
export async function POST({
  request,
  redirect,
  cookies,
}: APIContext): Promise<Response> {
  const formData = await request.json();
  const { email, password, userName } = await formData;

  if (!email || !password ) {
    return new Response(JSON.stringify({ data: 'email y contraseña requerida', status: 400 }))
  }
  

//   verificar si el usuario existe
  const findUser = (await db
    .select()
    .from(users)
    .where(eq(users.email, email))).at(0);

    if (!findUser) {
        return new Response(JSON.stringify({ data: 'email o contraseña incorrecta',status:401}))
    }

  // crear usuario en DB

  // Hacemos comapracion  hash de la contraseña
  if (!await bcrypt.compare(password, findUser.password) ) {
    return new Response(JSON.stringify({
      data: 'contraseña incorrecta',
        status: 402
    }));
} 



  const session = await lucia.createSession(findUser.id, { });
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