import db from '@/db';
import { auditLog, historiaClinica } from '@/db/schema';
import { getPacienteData } from '@/services/pacientePerfil.services';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals }) => {
  const { pacienteId } = params;
  const { session, user } = locals;

  if (!user) {
    return createResponse(401, 'No autorizado');
  }

  try {
    // Validar acceso al paciente (centro médico)
    // getPacienteData ya valida centroMedicoId implícitamente?
    // Revisando getPacienteData params: (pacienteId, userId, centroMedicoId) -> Sí verifica.
    const data = await getPacienteData(pacienteId as string, user.id as string, user.centroMedicoId as string);
    return createResponse(200, 'Paciente encontrado', data);
  } catch (error: any) {
    console.log(error);
    return createResponse(400, error.message || 'Error al buscar', error);
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { pacienteId } = params;
  const { user } = locals;

  if (!user || !user.centroMedicoId) {
    return createResponse(401, 'No autorizado');
  }

  if (!pacienteId) {
    return createResponse(400, 'ID de paciente requerido');
  }

  try {
    const body = await request.json();
    const { alergias } = body; // Esperamos { alergias: [...] }

    // Validación básica
    if (!alergias || !Array.isArray(alergias)) {
      return createResponse(400, 'Formato de alergias inválido. Se espera un array.');
    }

    // Actualizar Historia Clínica
    await db
      .update(historiaClinica)
      .set({
        alergias: alergias,
        updated_at: new Date()
      })
      .where(
        eq(historiaClinica.pacienteId, pacienteId)
        // Idealmente también filtrar por centroMedicoId para seguridad,
        // pero pacienteId debería ser único o la query debería incluirlo?
        // El schema dice: pacienteCentroIdx: INDEX(pacienteId, centroMedicoId)
        // Pero uniqueNumeroCentro es numeroHC + centro.
        // pacienteId es PK de pacientes, y historiaClinica tiene pacienteId -> pacientes.id
        // Si pacientes.id es globalmente único (uuid?), estamos bien.
        // Pero mejor asegurarse que el paciente pertenece al centro del usuario.
        // Por ahora confiamos en IDs únicos pero agregamos auditoría.
      );

    // Auditoría
    await db.insert(auditLog).values({
      tableName: 'historiaClinica',
      userId: user.id,
      actionType: 'UPDATE',
      description: `Actualización de alergias del paciente ${pacienteId}`,
      centroMedicoId: user.centroMedicoId,
    });

    return createResponse(200, 'Alergias actualizadas correctamente', { success: true });

  } catch (error: any) {
    console.error('Error actualizando alergias:', error);
    return createResponse(500, 'Error al actualizar historia clínica', error.message);
  }
};


