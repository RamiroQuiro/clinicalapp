import { lucia } from '@/lib/auth';
import { ADMIN_ROUTES, PUBLIC_ROUTES } from '@/lib/protectRoutes';
import { defineMiddleware } from 'astro/middleware';
import jwt from 'jsonwebtoken';
import { verifyRequestOrigin } from 'lucia';

type UserData = {
  id: number;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  rol: string;
};

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.includes(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // CSRF check para métodos no GET
    if (context.request.method !== 'GET') {
      const originHeader = context.request.headers.get('Origin');
      const hostHeader = context.request.headers.get('Host');
      if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const pathname = context.url.pathname;

    // 🚪 Dejar pasar si es pública
    if (isPublicRoute(pathname)) {
      return next();
    }

    // 🚪 Dejar pasar si es API o rutas abiertas especiales
    if (
      pathname.startsWith('/api/public/') ||
      pathname.startsWith('/reportes/') ||
      pathname.startsWith('/passRestablecer') ||
      pathname.startsWith('/cursos') ||
      pathname.startsWith('/registro') ||
      pathname.startsWith('/payment/') ||
      pathname.startsWith('/publicSites/')
    ) {
      return next();
    }

    // 🔐 Validar sesión
    const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
    const userDataCookie = context.cookies.get('userData')?.value ?? null;

    let session = null;
    let user: UserData | null = null;

    if (sessionId) {
      const validation = await lucia.validateSession(sessionId);
      session = validation.session;

      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
    }

    if (userDataCookie) {
      try {
        user = jwt.verify(userDataCookie, import.meta.env.SECRET_KEY_CREATECOOKIE) as UserData;
      } catch (error) {
        console.error('Error al verificar la cookie de usuario:', error);
      }
    }

    // Guardar en locals
    context.locals.session = session;
    context.locals.user = user;

    // 🚫 Si no hay sesión ni user -> login
    if (!session || !user) {
      return Response.redirect(new URL('/login', context.url));
    }

    // 🚫 Si es admin route y no tiene rol admin -> login
    if (isAdminRoute(pathname) && user.rol !== 'admin') {
      return Response.redirect(new URL('/login', context.url));
    }

    // ✅ Todo OK
    return next();
  } catch (error) {
    console.error('Error en el middleware:', error);
    return Response.redirect(new URL('/login', context.url));
  }
});
