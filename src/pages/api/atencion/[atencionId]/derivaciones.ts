import type { APIRoute } from 'astro';

import db from '@/db';
import { derivaciones } from '@/db/schema';

import { createResponse } from '@/utils/responseAPI';
import { nanoid } from 'nanoid';

// POST /api/atenciones/[atencionId]/derivaciones
export const POST: APIRoute = async ({ params, request, locals }) => {
  const { atencionId } = params;

  // 1. Validar sesion
  const { user } = locals;
  if (!user) {
    return createResponse(401, 'No autorizado');
  }

  // 2. Validar atencionId
  if (!atencionId) {
    return createResponse(400, 'El ID de la atención es requerido');
  }

  // 3. Leer y validar el body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return createResponse(400, 'El cuerpo de la solicitud no es un JSON válido');
  }

  const {
    pacienteId,
    especialidadDestino,
    motivoDerivacion,
    userIdDestino,
    nombreProfesionalExterno,
  } = body;

  if (!pacienteId || !especialidadDestino || !motivoDerivacion) {
    return createResponse(
      400,
      'Faltan campos requeridos: pacienteId, especialidadDestino y motivoDerivacion son obligatorios'
    );
  }

  // 4. Insertar en la base de datos
  try {
    const derivacion = await db
      .insert(derivaciones)
      .values({
        id: nanoid(),
        atencionId: atencionId,
        pacienteId: pacienteId,
        userIdOrigen: user.id,
        especialidadDestino: especialidadDestino,
        motivoDerivacion: motivoDerivacion,
        userIdDestino: userIdDestino, // Puede ser null
        nombreProfesionalExterno: nombreProfesionalExterno, // Puede ser null
      })
      .returning();

    return createResponse(201, 'Derivación creada exitosamente', derivacion);
  } catch (error) {
    console.error('Error al crear la derivación:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
