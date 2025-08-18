import { lucia } from '@/lib/auth';

/**
 * Función para validar la sesión del usuario antes de procesar una solicitud.
 * Requiere que el objeto `request` tenga un atributo `session` con la
 * información de la sesión del usuario.
 * @param {Request} request - Objeto de la solicitud HTTP.
 * @returns {Promise<void>} - Promesa que se resuelve si la sesión es válida,
 * y se rechaza con un código de estado y un mensaje de error si no lo es.
 */
export async function validarSesion(request: Request): Promise<void> {
  const { session } = await lucia.validateSession(request);
  if (!session) {
    throw new Error('Debes iniciar sesión para acceder a este recurso');
  }
}

/**
 * Función para validar la sesión del usuario como administrador antes de procesar
 * una solicitud.
 * Requiere que el objeto `request` tenga un atributo `session` con la
 * información de la sesión del usuario.
 * @param {Request} request - Objeto de la solicitud HTTP.
 * @returns {Promise<void>} - Promesa que se resuelve si la sesión es válida y
 * el usuario es administrador, y se rechaza con un código de estado y un mensaje
 * de error si no lo es.
 */
export async function validarSesionAdministrador(request: Request): Promise<void> {
  const { session, user } = await lucia.validateSession(request);
  if (!session || user.rol !== 'admin') {
    throw new Error('Debes iniciar sesión como administrador para acceder a este recurso');
  }
}
