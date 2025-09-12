import db from '@/db';
import { atenciones, historiaClinica, medicamento, pacientes, users } from '@/db/schema';
import { generateRecetaHtml } from '@/lib/templates/receta-template';
import formatDate from '@/utils/formatDate';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export const GET: APIRoute = async ({ params }) => {
  const { atencionId } = params;

  if (!atencionId) {
    return new Response('ID de atención no proporcionado', { status: 400 });
  }

  try {
    // 1. Obtener los datos de la atención
    const atencionResult = await db
      .select()
      .from(atenciones)
      .where(eq(atenciones.id, atencionId))
      .limit(1);
    const atencion = atencionResult[0];

    if (!atencion) {
      return new Response('Atención no encontrada', { status: 404 });
    }

    // 2. Obtener datos del paciente, doctor y medicamentos
    const pacienteResult = await db
      .select({
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        obraSocial: historiaClinica.obraSocial,
        nAfiliado: historiaClinica.nObraSocial,
        domicilio: pacientes.domicilio,
        fNacimiento: pacientes.fNacimiento,
        sexo: pacientes.sexo,
        celular: pacientes.celular,
        email: pacientes.email,
      })
      .from(pacientes)
      .innerJoin(historiaClinica, eq(pacientes.id, historiaClinica.pacienteId))
      .where(eq(pacientes.id, atencion.pacienteId))
      .limit(1);
    const paciente = pacienteResult[0];

    const doctorResult = await db
      .select()
      .from(users)
      .where(eq(users.id, atencion.userIdMedico))
      .limit(1);
    const doctor = doctorResult[0];

    const medicamentos = await db
      .select()
      .from(medicamento)
      .where(eq(medicamento.atencionId, atencionId));

    if (!paciente || !doctor) {
      return new Response('Datos del paciente o del doctor no encontrados', { status: 404 });
    }

    // 3. Ensamblar el objeto de datos para la plantilla
    const recetaData = {
      doctor: {
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        especialidad: doctor.especialidad || 'Medicina General',
        matricula: doctor.mp || 'N/A',
      },
      paciente: {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: paciente.dni,
        obraSocial: paciente.obraSocial || 'N/A',
        nAfiliado: paciente.nAfiliado || 'N/A',
      },
      medicamentos: medicamentos.map(med => ({
        nombreGenerico: med.nombreGenerico,
        nombreComercial: med.nombreComercial,
        dosis: med.dosis,
        indicaciones: med.descripcion,
        frecuencia: med.frecuencia,

        duracion: med.duracion,
      })),
      fecha: formatDate(atencion.fecha),
    };

    // 4. Generar el HTML a partir de la plantilla
    const htmlContent = generateRecetaHtml(recetaData);

    // 5. Usar Puppeteer para convertir el HTML a PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // 6. Devolver el PDF en la respuesta
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receta-${atencionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error al generar el PDF de la receta:', error);
    return new Response('Error interno al generar el PDF', { status: 500 });
  }
};
