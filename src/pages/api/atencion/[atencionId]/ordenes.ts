import type { APIRoute } from 'astro';

import db from '@/db';
import { ordenesEstudio } from '@/db/schema/ordenesEstudio';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';

// POST /api/atenciones/[atencionId]/ordenes
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
  const data = await request.json();

  const { pacienteId, diagnosticoPresuntivo, estudiosSolicitados, userMedicoId } = data;
  console.log('data del frontend ->', data);
  if (!userMedicoId || !pacienteId || !diagnosticoPresuntivo || !estudiosSolicitados) {
    return createResponse(
      400,
      'Faltan campos requeridos: pacienteId, diagnosticoPresuntivo y estudiosSolicitados son obligatorios'
    );
  }

  // 4. Insertar en la base de datos
  // revisar por estudios esta en formato json
  try {
    const newOrdenId = nanoIDNormalizador(`oE-${atencionId.slice(-5)}`, 5);
    const [nuevaOrden] = await db
      .insert(ordenesEstudio)
      .values({
        id: newOrdenId,
        atencionId: atencionId,
        pacienteId: pacienteId,
        userMedicoId: userMedicoId,
        diagnosticoPresuntivo: diagnosticoPresuntivo,
        estudiosSolicitados: estudiosSolicitados,
      })
      .returning();

    return createResponse(201, 'Orden de estudio creada exitosamente', nuevaOrden);
  } catch (error) {
    console.error('Error al crear la orden de estudio:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
