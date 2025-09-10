import db from '@/db';
import { archivosAdjuntos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import fs from 'node:fs'; // Use the core 'fs' module
import path from 'node:path';

export const GET: APIRoute = async ({ params, cookies }) => {
  const { fileId } = params;

  try {
    // 1. Authentication
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) return new Response('No autorizado', { status: 401 });
    const { session } = await lucia.validateSession(sessionId);
    if (!session) return new Response('No autorizado', { status: 401 });

    // 2. Retrieve file metadata
    const [fileRecord] = await db
      .select({
        url: archivosAdjuntos.url,
        nombre: archivosAdjuntos.nombre,
        pacienteId: archivosAdjuntos.pacienteId, // Needed for authorization
      })
      .from(archivosAdjuntos)
      .where(eq(archivosAdjuntos.id, fileId));

    if (!fileRecord) {
      return new Response('Archivo no encontrado en la base de datos.', { status: 404 });
    }

    // 3. Authorization (Future enhancement: check if user can access fileRecord.pacienteId)

    // 4. Construct file path and check existence
    const fullFilePath = path.join(process.cwd(), fileRecord.url);
    const stats = await fs.promises.stat(fullFilePath);

    // 5. Determine Content-Type
    const ext = path.extname(fileRecord.url).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 6. Create a readable stream
    const fileStream = fs.createReadStream(fullFilePath);

    // 7. Return the streaming response
    return new Response(fileStream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `inline; filename="${fileRecord.nombre || path.basename(fileRecord.url)}"`,
      },
    });

  } catch (error) {
    console.error(`Error serving file ${fileId}:`, error);
    if (error.code === 'ENOENT') {
      return new Response('Archivo no encontrado en el servidor.', { status: 404 });
    }
    return new Response('Error interno del servidor.', { status: 500 });
  }
};
