import db from '@/db';
import { archivosAdjuntos } from '@/db/schema';
import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

export const GET: APIRoute = async ({ params, cookies, locals }) => {
  const { fileId } = params;

  try {
    // 1. Authentication
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) return new Response('No autorizado', { status: 401 });
    const { session } = await lucia.validateSession(sessionId);
    if (!session) return new Response('No autorizado', { status: 401 });
    const { user } = locals
    // 2. Retrieve file metadata
    const [fileRecord] = await db
      .select({
        url: archivosAdjuntos.url,
        nombre: archivosAdjuntos.nombre,
        pacienteId: archivosAdjuntos.pacienteId,
        userMedicoId: archivosAdjuntos.userMedicoId,
      })
      .from(archivosAdjuntos)
      .where(eq(archivosAdjuntos.id, fileId));

    if (!fileRecord) {
      return new Response('Archivo no encontrado en la base de datos.', { status: 404 });
    }
    // TODO: ¿Vale la pena esta verificacion?
    // if (user.id !== fileRecord.userMedicoId) {
    //   return createResponse(400, 'usuario no autorizado para leer este archivos')
    // }

    const fullFilePath = path.join(process.cwd(), fileRecord.url);
    const stats = await fs.stat(fullFilePath);

    // 5. Determine Content-Type
    const ext = path.extname(fileRecord.url).toLowerCase();
    const mimeTypes: Record<string, string> = {
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
    const fileStream = createReadStream(fullFilePath);

    // 7. Return the streaming response
    return new Response(fileStream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `inline; filename="${fileRecord.nombre || path.basename(fileRecord.url)}"`,
      },
    });

  } catch (error: any) {
    console.error(`Error serving file ${fileId}:`, error);
    if (error.code === 'ENOENT') {
      return new Response('Archivo no encontrado en el servidor.', { status: 404 });
    }
    return new Response('Error interno del servidor.', { status: 500 });
  }
};



export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { fileId } = params;

    if (!fileId) {
      return new Response('ID de archivo no proporcionado.', { status: 400 });
    }

    // 1. Fetch the file record from the database
    const [fileRecord] = await db.select().from(archivosAdjuntos).where(eq(archivosAdjuntos.id, fileId));

    if (!fileRecord) {
      return new Response('Archivo no encontrado en la base de datos.', { status: 404 });
    }

    // 2. Construct the full file path and delete the physical file
    const fullFilePath = path.join(process.cwd(), fileRecord.url);

    try {
      await fs.unlink(fullFilePath); // Delete the file from the file system
    } catch (fsError: any) {
      console.warn(`No se pudo borrar el archivo físico ${fullFilePath}:`, fsError.message);
    }

    const eliminarFile = await db.delete(archivosAdjuntos).where(eq(archivosAdjuntos.id, fileId));

    return new Response('Archivo eliminado exitosamente.', { status: 200 });

  } catch (error: any) {
    console.error(`Error deleting file ${params.fileId}:`, error);

    if (error.status === 404 || error.code === 'ENOENT') {
      return new Response('Archivo no encontrado.', { status: 404 });
    }
    return new Response('Error interno del servidor al eliminar el archivo.', { status: 500 });
  }
};