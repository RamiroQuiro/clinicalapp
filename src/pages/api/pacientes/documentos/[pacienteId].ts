import { lucia } from '@/lib/auth';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import fs from 'node:fs/promises';
import path from 'node:path';
import db from '../../../../db';
import { archivosAdjuntos } from '../../../../db/schema';

export const POST: APIRoute = async ({ request, params, cookies, locals }) => {
  const formData = await request.formData();
  const { pacienteId } = params;

  const { session, user } = locals
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }

    const nombre = formData.get('nombre')?.toString();
    const descripcion = formData.get('descripcion')?.toString();
    const estado = formData.get('estado')?.toString();
    const tipo = formData.get('tipo')?.toString();
    const atencionId = formData.get('atencionId')?.toString();
    const files = formData.getAll('files') as File[];

    if (!nombre || !tipo || files.length === 0) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'Nombre, tipo y al menos un archivo son requeridos.',
        }),
        { status: 400 }
      );
    }

    const uploadedFilesData = [];

    const baseUploadDir = path.join(process.cwd(), `documentos/${user?.centroMedicoId}`);
    const patientUploadDir = path.join(baseUploadDir, pacienteId);

    // Ensure patient-specific upload directory exists
    await fs.mkdir(patientUploadDir, { recursive: true });

    for (const file of files) {
      const uniqueFileName = `${generateId(10)}-${file.name}`; // Generate unique name
      const filePath = path.join(patientUploadDir, uniqueFileName);

      const fileInternalPath = path.relative(process.cwd(), filePath); // Store path relative to project root

      // Save file to disk
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

      uploadedFilesData.push({
        id: nanoIDNormalizador('archivosAdjuntos', 10),
        pacienteId,
        centroMedicoId: user?.centroMedicoId,
        atencionId: atencionId || null,
        descripcion: descripcion || '',
        nombre: nombre,
        url: fileInternalPath,
        estado: estado || 'revisar',
        tipo: tipo,
        userMedicoId: user.id,
      });
    }

    const [insert] = await db.insert(archivosAdjuntos).values(uploadedFilesData).returning();

    return createResponse(200, 'Archivos guardados correctamente.', insert);
  } catch (error) {
    console.error('Error al guardar archivos adjuntos:', error);
    return createResponse(500, 'Error interno del servidor al guardar archivos.', error);
  }
};

export const PUT: APIRoute = async ({ locals, request, params, cookies }) => {
  const formData = await request.formData();
  const { pacienteId } = params;
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = locals
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const id = formData.get('id')?.toString();
    const atencionId = formData.get('atencionId')?.toString();
    const descripcion = formData.get('descripcion')?.toString();
    const nombre = formData.get('nombre')?.toString();
    const estado = formData.get('estado')?.toString();
    const tipo = formData.get('tipo')?.toString();

    const [update] = await db
      .update(archivosAdjuntos)
      .set({
        atencionId,
        descripcion: descripcion,
        nombre: nombre,
        userMedicoId: user.id,
        estado: estado,
        tipo: tipo,
      })
      .where(and(eq(archivosAdjuntos.id, id), eq(archivosAdjuntos.pacienteId, pacienteId)))
      .returning();
    return createResponse(200, 'Archivos actualizados correctamente.', update);
  } catch (error) {
    console.error('Error al actualizar archivos adjuntos:', error);
    return createResponse(500, 'Error al actualizar archivos adjuntos', error);
  }
};
