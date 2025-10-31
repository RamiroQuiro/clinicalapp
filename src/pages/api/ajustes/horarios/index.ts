import db from '@/db';
import { horariosTrabajo } from '@/db/schema/agenda';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return createResponse(400, 'Falta el parámetro userId');
  }

  // TODO: Añadir validación de permisos (solo admin o el propio usuario puede ver)

  try {
    const horarios = await db.select().from(horariosTrabajo).where(eq(horariosTrabajo.userMedicoId, userId));

    // Si no se encuentran horarios, se puede devolver un array vacío o un estado inicial
    if (!horarios || horarios.length === 0) {
      return createResponse(200, 'No se encontraron horarios para este usuario.', []);
    }

    return createResponse(200, 'Horarios obtenidos con éxito', horarios);

  } catch (error) {
    console.error('Error al obtener los horarios:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  // 1. Validación de sesión y permisos (básico)
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
    // TODO: Añadir lógica de permisos más granular si es necesario (ej: solo admin o el propio usuario)
  }

  const { userId, horarios } = await request.json();

  // 2. Console.log para verificar los datos recibidos, como solicitaste
  console.log('--- DATOS RECIBIDOS EN LA API DE HORARIOS ---');
  console.log('Usuario a modificar:', userId);
  console.log('Horarios a guardar:', JSON.stringify(horarios, null, 2));
  console.log('--------------------------------------------');

  if (!userId || !horarios || !Array.isArray(horarios) || horarios.length !== 7) {
    return createResponse(400, 'Datos inválidos');
  }

  try {
    // 3. Iniciar una transacción para asegurar que todos los cambios se apliquen o ninguno
    await db.transaction(async (tx) => {
      for (const horario of horarios) {
        await tx
          .insert(horariosTrabajo)
          .values({
            id: nanoIDNormalizador(`${userId}-${horario.diaSemana}`, 5),
            userMedicoId: userId,
            diaSemana: horario.diaSemana,
            activo: horario.activo,
            horaInicioManana: horario.horaInicioManana,
            horaFinManana: horario.horaFinManana,
            horaInicioTarde: horario.horaInicioTarde,
            horaFinTarde: horario.horaFinTarde,
          })
          .onConflictDoUpdate({
            target: [horariosTrabajo.userMedicoId, horariosTrabajo.diaSemana],
            set: {
              activo: horario.activo,
              horaInicioManana: horario.horaInicioManana,
              horaFinManana: horario.horaFinManana,
              horaInicioTarde: horario.horaInicioTarde,
              horaFinTarde: horario.horaFinTarde,
            },
          });
      }
    });

    return createResponse(200, 'Horarios guardados con éxito');

  } catch (error) {
    console.error('Error al guardar los horarios:', error);
    return createResponse(500, 'Error interno del servidor', error);
  }
};
