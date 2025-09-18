import db from '@/db';
import { historiaClinica, pacientes, users } from '@/db/schema';
import { atenciones } from '@/db/schema/atenciones';
import { ordenesEstudio } from '@/db/schema/ordenesEstudio';
import { generateOrdenEstudioHtml } from '@/lib/templates/orden-estudio-template';
import formatDate from '@/utils/formatDate';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export const GET: APIRoute = async ({ params, locals }) => {
  const { ordenId } = params;

  if (!ordenId) {
    return new Response('Bad Request: ordenId is required', { status: 400 });
  }

  try {
    // 1. Obtener los datos de la orden de estudio
    const [orden] = await db.select().from(ordenesEstudio).where(eq(ordenesEstudio.id, ordenId));

    if (!orden) {
      return new Response('Orden de estudio no encontrada', { status: 404 });
    }

    // 2. Obtener los datos relacionados (paciente y mÃ©dico) a travÃ©s de la atenciÃ³n
    const [atencionCompleta] = await db
      .select({
        paciente: {
          nombre: pacientes.nombre,
          apellido: pacientes.apellido,
          dni: pacientes.dni,
          obraSocial: historiaClinica.obraSocial,
          nAfiliado: historiaClinica.nObraSocial,
        },
        medico: {
          name: users.nombre,
          apellido: users.apellido,
          especialidad: users.especialidad,
          mp: users.mp,
        },
      })
      .from(atenciones)
      .innerJoin(users, eq(atenciones.userIdMedico, users.id))
      .innerJoin(pacientes, eq(atenciones.pacienteId, pacientes.id))
      .innerJoin(historiaClinica, eq(pacientes.id, historiaClinica.pacienteId))
      .where(eq(atenciones.id, orden.atencionId));

    if (!atencionCompleta || !atencionCompleta.paciente || !atencionCompleta.medico) {
      return new Response('Datos relacionados a la atenciÃ³n no encontrados o incompletos', {
        status: 404,
      });
    }

    const { paciente, medico } = atencionCompleta;

    // 3. Preparar los datos para la plantilla
    // El schema dice que estudiosSolicitados es string[], la plantilla espera {nombre: string}[]
    const estudiosParaPlantilla = orden.estudiosSolicitados.map(nombre => ({ nombre }));

    const data = {
      doctor: {
        nombre: medico.name || '',
        apellido: medico.apellido || '',
        especialidad: medico.especialidad || 'Medicina General',
        matricula: medico.mp || 'N/A',
      },
      paciente: {
        nombre: paciente.nombre || '',
        apellido: paciente.apellido || '',
        dni: paciente.dni || 'N/A',
        obraSocial: paciente.obraSocial || 'N/A',
        nAfiliado: paciente.nAfiliado || 'N/A',
      },
      estudios: estudiosParaPlantilla,
      diagnosticoPresuntivo: orden.diagnosticoPresuntivo,
      fecha: formatDate(orden.created_at),
    };

    // 4. Generar el HTML
    const html = generateOrdenEstudioHtml(data);

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
        'Content-Disposition': `attachment; filename="orden-estudio-${ordenId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
