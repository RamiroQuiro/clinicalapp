import { lucia } from '@/lib/auth';
import { ADMIN_ROUTES, PUBLIC_ROUTES, RECEPCION_ROUTES } from '@/lib/protectRoutes';
import { defineMiddleware } from 'astro/middleware';
import jwt from 'jsonwebtoken';
import { verifyRequestOrigin } from 'lucia';

type UserData = {
  id: string;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  rol: string;
  rolEnCentro?: string;
  centroMedicoId?: string;
};

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname);
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.includes(pathname);
}

function isRecepcionRoute(pathname: string): boolean {
  return RECEPCION_ROUTES.includes(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // ✅ Protección CSRF en métodos no GET
    if (context.request.method !== 'GET') {
      const originHeader = context.request.headers.get('Origin');
      const hostHeader = context.request.headers.get('Host');
      if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
        return new Response('Forbidden', { status: 403 });
      }
    }

    const pathname = context.url.pathname;

    // ✅ Dejar pasar si es ruta pública
    if (isPublicRoute(pathname)) {
      return next();
    }

    // ✅ Rutas abiertas especiales (públicas por naturaleza)
    if (
      pathname.startsWith('/portal/') ||
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

    // 🔒 Validar sesión
    const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
    const userDataCookie = context.cookies.get('userData')?.value ?? null;

    let session = null;
    let user: UserData | null = null;

    if (sessionId) {
      const validation = await lucia.validateSession(sessionId);
      session = validation.session;

      // ✅ Set cookies BEFORE calling next() to avoid immutable headers error
      if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      } else if (!session) {
        const blank = lucia.createBlankSessionCookie();
        context.cookies.set(blank.name, blank.value, blank.attributes);
      }
    }

    if (userDataCookie) {
      try {
        user = jwt.verify(userDataCookie, import.meta.env.SECRET_KEY_CREATECOOKIE) as UserData;
      } catch (error) {
        console.error('Error al verificar la cookie de usuario:', error);
      }
    }

    // 🚫 Si no hay sesión o usuario -> login
    if (!session || !user) {
      return Response.redirect(new URL('/login', context.url));
    }

    // 🧠 Guardar en locals
    context.locals.session = session;
    context.locals.user = user;

    // --- 🔄 REDIRECCIONES SEGÚN ROL ---
    // Si el usuario es recepcionista y entra a /dashboard base, redirigilo a su panel
    if (user.rolEnCentro === 'recepcion' && pathname === '/dashboard') {
      return Response.redirect(new URL('/dashboard/recepcion', context.url));
    }

    // 🚫 Bloqueo de rutas no autorizadas
    if (isAdminRoute(pathname) && user.rol !== 'admin') {
      return Response.redirect(new URL('/login', context.url));
    }

    if (isRecepcionRoute(pathname) && user.rolEnCentro !== 'recepcion') {
      return Response.redirect(new URL('/login', context.url));
    }

    // ✅ Todo OK
    return next();
  } catch (error) {
    console.error('Error en el middleware:', error);
    return Response.redirect(new URL('/login', context.url));
  }
});
