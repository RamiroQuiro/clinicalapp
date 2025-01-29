import { lucia } from "@/lib/auth";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/protectRoutes";
import { defineMiddleware } from "astro/middleware";
import { verifyRequestOrigin } from "lucia";

// Función para verificar si una ruta es pública
function isPublicRoute(pathname) {
  // Verifica si la ruta es una ruta pública exacta
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Si no se cumple ninguna de las condiciones anteriores, la ruta no es pública
  return false;
}

// Función para verificar si una ruta es de administrador
function isAdminRoute(pathname) {
  // Verifica si la ruta es una ruta de administrador exacta
  if (ADMIN_ROUTES.includes(pathname)) {
    return true;
  }

  // Si no se cumple ninguna de las condiciones anteriores, la ruta no es de administrador
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    if (context.request.method !== "GET") {
      const originHeader = context.request.headers.get("Origin");
      const hostHeader = context.request.headers.get("Host");
      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
        return new Response(null, {
          status: 403,
        });
      }
    }

    // Si la ruta es pública, dejamos pasar la solicitud
    if (isPublicRoute(context.url.pathname)) {
      return next();
    }

    // Si la ruta comienza con "/api/" o "/passRestablecer", también dejamos pasar la solicitud
    if (
      context.url.pathname.startsWith("/api/") ||
      context.url.pathname.startsWith("/reportes/") ||
      context.url.pathname.startsWith("/passRestablecer") ||
      context.url.pathname.startsWith("/cursos") ||
      context.url.pathname.startsWith("/payment/") ||
      context.url.pathname.startsWith("/publicSites/")
    ) {
      return next();
    }
    const sessionId =
      context.cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      context.locals.user = null;
      context.locals.session = null;
    }
    const sessionCookie = await lucia.validateSession(sessionId);
    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      context.cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    context.locals.session = session;
    context.locals.user = user;

    // Si la cookie no existe, redirigimos al usuario a la página de inicio de sesión
    if (!context.locals.session) {
      return Response.redirect(new URL("/login", context.url));
    }

    // Si todo está bien, pasamos a la siguiente ruta
    return next();
  } catch (error) {
    console.error("Error en el middleware:", error);
    // Redirigimos al usuario a la página de inicio de sesión en caso de cualquier error
    return Response.redirect(new URL("/login", context.url));
  }
});