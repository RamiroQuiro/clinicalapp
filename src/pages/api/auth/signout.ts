
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIContext } from 'astro';

export async function POST(context: APIContext): Promise<Response> {
  const { session, user } = context.locals;
  const ipAddress = context.request.headers.get('x-forwarded-for') || undefined;
  const userAgent = context.request.headers.get('user-agent') || undefined;

  if (!session || !user) {
    return context.redirect('/login');
  }

  // 1. Invalidar la sesión en el servidor
  await lucia.invalidateSession(session.id);

  // 2. Registrar el evento de auditoría
  await logAuditEvent({
    userId: user.id,
    actionType: 'VIEW', // Usamos VIEW como un tipo genérico para logout
    tableName: 'sessions',
    recordId: session.id,
    description: `El usuario ${user.email} cerró sesión.`,
    ipAddress,
    userAgent,
  });

  // 3. Crear una cookie de sesión en blanco para limpiar el navegador
  const sessionCookie = lucia.createBlankSessionCookie();
  context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  // 4. Limpiar la cookie de datos de usuario adicional
  context.cookies.delete('userData', { path: '/' });

  return context.redirect('/login');
}
