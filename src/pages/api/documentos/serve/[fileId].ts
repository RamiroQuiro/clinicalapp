import db from '@/db';
import { archivosAdjuntos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';

import { eq } from 'drizzle-orm';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async ({ request, params, cookies }) => {
  const { fileId } = params;
  console.log('fileId', fileId);
  try {
    // 1. Authentication and Authorization
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }

    // 2. Retrieve file metadata from database
    const [fileRecord] = await db
      .select()
      .from(archivosAdjuntos)
      .where(eq(archivosAdjuntos.id, fileId));

    if (!fileRecord) {
      return new Response('Archivo no encontrado', { status: 404 });
    }

    // Basic authorization: Ensure the logged-in user has access to this patient's files
    // This is a simplified check. You might need more complex logic based on roles/permissions.
    // For now, assuming any logged-in user can access any file if they know the fileId.
    // A more robust check would involve verifying if user.id is associated with fileRecord.pacienteId
    // or if the user has a role that grants access to all patient files.
    // For now, we'll assume the user is authorized if they are logged in.

    // 3. Construct the full file path
    const fullFilePath = path.join(process.cwd(), fileRecord.url); // fileRecord.url is already relative to project root

    // 4. Read the file content
    const fileContent = await fs.readFile(fullFilePath);

    // 5. Determine Content-Type (MIME type)
    const ext = path.extname(fileRecord.url).toLowerCase();
    let contentType = 'application/octet-stream'; // Default
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    // Add other types as needed

    // 6. Stream the file back to the client
    return new Response(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileRecord.nombre || path.basename(fileRecord.url)}"`, // 'inline' to display in browser, 'attachment' to download
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    // Check if file not found specifically
    if (error.code === 'ENOENT') {
      // 'Error No Entry' - file does not exist
      return new Response('Archivo no encontrado en el servidor.', { status: 404 });
    }
    return new Response('Error interno del servidor al servir el archivo.', { status: 500 });
  }
};
