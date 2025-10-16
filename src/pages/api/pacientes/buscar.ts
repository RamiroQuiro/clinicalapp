import db from '@/db';
import { pacientes } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, like, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, request, cookies, locals }) => {
  const searchTerm = url.searchParams.get('q')?.trim();

  // 1. Autenticación rápida
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }

  const { user } = locals;
  const { session } = await lucia.validateSession(sessionId);
  if (!session || !user || !user.centroMedicoId) {
    return createResponse(401, 'No autorizado o sin centro médico asignado.');
  }

  // 2. Validación rápida
  if (!searchTerm || searchTerm.length < 2) {
    return createResponse(200, 'OK', []);
  }

  if (searchTerm.length > 50) {
    return createResponse(400, 'Término de búsqueda demasiado largo');
  }

  try {
    const centroMedicoId = user.centroMedicoId;

    // 3. BÚSQUEDA PURA Y RÁPIDA
    let searchResults;

    searchResults = await db
      .select({
        id: pacientes.id,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        fNacimiento: pacientes.fNacimiento,
        sexo: pacientes.sexo,
      })
      .from(pacientes)
      .where(
        and(
          eq(pacientes.centroMedicoId, user.centroMedicoId),
          or(
            like(pacientes.nombre, `%${searchTerm}%`),
            like(pacientes.apellido, `%${searchTerm}%`),
            like(pacientes.dni, `%${searchTerm}%`),
            like(pacientes.sexo, `%${searchTerm}%`),
            like(pacientes.celular, `%${searchTerm}%`)
          )
        )
      )
      .limit(10);

    // 4. ENRIQUECER DATOS (sin auditoría)
    const resultadosEnriquecidos = searchResults.map(paciente => ({
      ...paciente,
      edad: calcularEdadDesdeFecha(paciente.fNacimiento),
      displayName: `${paciente.nombre} ${paciente.apellido}`,
      iniciales: `${paciente.nombre[0]}${paciente.apellido[0]}`.toUpperCase(),
    }));

    // 5. LOG LIGERO (opcional, solo desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [DEV] Búsqueda "${searchTerm}": ${searchResults.length} resultados`);
    }

    return createResponse(200, 'OK', resultadosEnriquecidos);
  } catch (error) {
    console.error('❌ Error en búsqueda de pacientes:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};

// 🔧 Función auxiliar para calcular edad
function calcularEdadDesdeFecha(fechaNacimiento: Date | number): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}
