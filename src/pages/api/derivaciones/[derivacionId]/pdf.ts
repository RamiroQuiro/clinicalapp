import db from '@/db';
import { derivaciones } from '@/db/schema/derivaciones';
import { pacientes } from '@/db/schema/pacientes';
import { users } from '@/db/schema/users';
import { generateDerivacionHtml } from '@/lib/templates/derivacion-template';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export const GET: APIRoute = async ({ params, locals }) => {
  const { derivacionId } = params;
  const { user } = locals;
  if (!user) {
    return createResponse(401, 'Unauthorized');
  }

  if (!derivacionId) {
    return createResponse(400, 'Bad Request: derivacionId is required');
  }

  try {
    // 1. Obtener los datos de la derivaciÃ³n
    const [derivacion] = await db
      .select()
      .from(derivaciones)
      .where(eq(derivaciones.id, derivacionId));

    if (!derivacion) {
      return createResponse(404, 'DerivaciÃ³n no encontrada');
    }

    // 2. Obtener datos del paciente y del mÃ©dico que origina
    const [pacienteData] = await db
      .select()
      .from(pacientes)
      .where(eq(pacientes.id, derivacion.pacienteId));
    const [medicoOrigenData] = await db
      .select()
      .from(users)
      .where(eq(users.id, derivacion.userIdOrigen));

    if (!pacienteData || !medicoOrigenData) {
      return new Response('Datos relacionados (paciente o mÃ©dico) no encontrados', {
        status: 404,
      });
    }

    // 3. Preparar los datos para la plantilla
    const data = {
      doctorOrigen: {
        nombre: medicoOrigenData.name || '',
        apellido: medicoOrigenData.apellido || '',
        especialidad: medicoOrigenData.especialidad || 'Medicina General',
        matricula: medicoOrigenData.matricula || 'N/A',
      },
      paciente: {
        nombre: pacienteData.nombre || '',
        apellido: pacienteData.apellido || '',
        dni: pacienteData.dni || 'N/A',
        obraSocial: pacienteData.obraSocial || 'N/A',
        nAfiliado: pacienteData.nAfiliado || 'N/A',
      },
      especialidadDestino: derivacion.especialidadDestino || 'No especificada',
      motivoDerivacion: derivacion.motivoDerivacion || 'Sin motivo detallado.',
      fecha: new Date(derivacion.created_at).toLocaleDateString('es-AR'),
      nombreProfesionalExterno: derivacion.nombreProfesionalExterno || undefined,
    };

    // 4. Generar el HTML
    const html = generateDerivacionHtml(data);

    // 5. Usar Puppeteer para convertir el HTML a PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // 6. Devolver el PDF
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="derivacion-${derivacionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF for derivacion:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
