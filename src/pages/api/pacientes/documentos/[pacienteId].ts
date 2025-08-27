import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { generateId } from 'lucia';
import db from '../../../../db';
import { archivosAdjuntos } from '../../../../db/schema';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const formData = await request.formData();
  const { pacienteId } = params;

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }

    const nombre = formData.get('nombre')?.toString();
    const descripcion = formData.get('descripcion')?.toString();
    const estado = formData.get('estado')?.toString();
    const tipo = formData.get('tipo')?.toString();
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
    // NEW: Define upload directory outside public, with patientId subfolder
    const baseUploadDir = path.join(process.cwd(), 'documents'); // Project root /documents
    const patientUploadDir = path.join(baseUploadDir, pacienteId); // /documents/patientId/

    // Ensure patient-specific upload directory exists
    await fs.mkdir(patientUploadDir, { recursive: true });

    for (const file of files) {
      const uniqueFileName = `${generateId(10)}-${file.name}`; // Generate unique name
      const filePath = path.join(patientUploadDir, uniqueFileName);
      // NEW: URL will be an internal path, not publicly accessible
      const fileInternalPath = path.relative(process.cwd(), filePath); // Store path relative to project root

      // Save file to disk
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

      uploadedFilesData.push({
        id: generateId(13),
        pacienteId,
        descripcion: descripcion || '',
        nombre: nombre, // Use the single name for all files for now, or adjust frontend to send name per file
        url: fileInternalPath, // Store the internal path
        estado: estado || 'revisar',
        tipo: tipo,
        userId: user.id,
      });
    }

    await db.insert(archivosAdjuntos).values(uploadedFilesData);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Archivos guardados correctamente.',
        uploadedCount: uploadedFilesData.length,
      })
    );
  } catch (error) {
    console.error('Error al guardar archivos adjuntos:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error interno del servidor al guardar archivos.',
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
