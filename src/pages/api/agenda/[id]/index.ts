import type { APIRoute } from 'astro';
import { createResponse } from '@/utils/responseAPI';
import db from '@/db';
import { turnos } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/turnos/[id]
export const PUT: APIRoute = async ({ params, request, locals }) => {
  // 1. Validar sesion
  const { user } = locals;
  if (!user) {
    return createResponse(401, 'No autorizado');
  }

  const { id } = params;
  if (!id) {
    return createResponse(400, 'El ID del turno es requerido');
  }

  // 2. Leer y validar el body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return createResponse(400, 'El cuerpo de la solicitud no es un JSON válido');
  }

  // Campos que se pueden actualizar
  const {
    pacienteId,
    fechaTurno,
    duracion,
    tipoConsulta,
    motivoConsulta,
    motivoInicial,
    estado,
  } = body;

  // Construir el objeto de actualización dinámicamente
  const updateData: Record<string, any> = {};
  if (pacienteId) updateData.pacienteId = pacienteId;
  if (fechaTurno) updateData.fechaTurno = fechaTurno;
  if (duracion) updateData.duracion = duracion;
  if (tipoConsulta) updateData.tipoConsulta = tipoConsulta;
  if (motivoConsulta) updateData.motivoConsulta = motivoConsulta;
  if (motivoInicial) updateData.motivoInicial = motivoInicial;
  if (estado) updateData.estado = estado;

  // Añadir updated_at
  updateData.updated_at = new Date().getTime();

  if (Object.keys(updateData).length === 1 && updateData.updated_at) {
    return createResponse(400, 'No hay datos para actualizar');
  }

  try {
    const [updatedTurno] = await db.update(turnos)
      .set(updateData)
      .where(eq(turnos.id, id))
      .returning();

    if (!updatedTurno) {
      return createResponse(404, 'Turno no encontrado');
    }

    return createResponse(200, 'Turno actualizado exitosamente', updatedTurno);
  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
