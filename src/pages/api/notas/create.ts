import db from '@/db';
import { notasMedicas } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  // 1. Validar sesión
  if (!session || !user) {
    return new Response('No autorizado', { status: 401 });
  }

  // 2. Obtener y validar datos del body
  const { descripcion, pacienteId, title, atencionId } = await request.json();

  if (!descripcion || !pacienteId) {
    return createResponse(400, 'Faltan datos requeridos (descripcion, pacienteId)');
  }

  const newNoteId = nanoid();
  const newNoteData = {
    id: newNoteId,
    descripcion,
    pacienteId,
    title,
    atencionId: atencionId ? atencionId : null,
    userMedicoId: user.id,
  };

  // 3. Insertar en la base de datos
  try {
    const insertandoDB = await db.insert(notasMedicas).values(newNoteData).returning();

    // 4. Registrar evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'CREATE',
      tableName: 'notasMedicas',
      recordId: newNoteId,
      newValue: insertandoDB[0],
      description: `El usuario ${user.name} creó una nueva nota médica.`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // 5. Devolver respuesta de éxito
    return createResponse(201, 'Nota médica creada con éxito', insertandoDB[0]);
  } catch (error) {
    console.error('Error al insertar la nota médica:', error);
    return createResponse(500, 'Error interno del servidor', error);
  }
};
