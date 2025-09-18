
import type { APIRoute } from 'astro';
import { responseAPI } from '../../../../utils/responseAPI';
import { derivaciones } from '../../../../db/schema/derivaciones';
import db from '../../../../db';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

// POST /api/atenciones/[atencionId]/derivaciones
export const POST: APIRoute = async ({ params, request, locals }) => {
  const { atencionId } = params;

  // 1. Validar sesion
  const { user } = locals;
  if (!user) {
    return responseAPI(401, 'No autorizado');
  }

  // 2. Validar atencionId
  if (!atencionId) {
    return responseAPI(400, 'El ID de la atención es requerido');
  }

  // 3. Leer y validar el body
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return responseAPI(400, 'El cuerpo de la solicitud no es un JSON válido');
  }

  const {
    pacienteId,
    especialidadDestino,
    motivoDerivacion,
    userIdDestino,
    nombreProfesionalExterno,
  } = body;

  if (!pacienteId || !especialidadDestino || !motivoDerivacion) {
    return responseAPI(
      400,
      'Faltan campos requeridos: pacienteId, especialidadDestino y motivoDerivacion son obligatorios'
    );
  }

  // 4. Insertar en la base de datos
  try {
    const newDerivacionId = createId();
    await db.insert(derivaciones).values({
      id: newDerivacionId,
      atencionId: atencionId,
      pacienteId: pacienteId,
      userIdOrigen: user.id,
      especialidadDestino: especialidadDestino,
      motivoDerivacion: motivoDerivacion,
      userIdDestino: userIdDestino, // Puede ser null
      nombreProfesionalExterno: nombreProfesionalExterno, // Puede ser null
    });

    const nuevaDerivacion = await db.query.derivaciones.findFirst({
        where: eq(derivaciones.id, newDerivacionId)
    });

    return responseAPI(201, 'Derivación creada exitosamente', nuevaDerivacion);
  } catch (error) {
    console.error('Error al crear la derivación:', error);
    return responseAPI(500, 'Error interno del servidor');
  }
};
