import db from '@/db';
import {
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  pacientes,
  preferenciaPerfilUser,
  signosVitales,
  users,
} from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import generateReportHtmlV4 from '@/lib/templates/atencionReportHtmlV4';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export const GET: APIRoute = async ({ params, request, cookies, locals }) => {
  const { pacienteId, atencionId } = params;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return createResponse(401, 'No autorizado');

  const { user } = locals;
  if (!user) return createResponse(401, 'No autorizado');

  if (!pacienteId || !atencionId) {
    return createResponse(400, 'Se requieren el ID del paciente y de la atención');
  }

  let browser;
  try {
    // 1. Obtener todos los datos en paralelo
    const [atencionData] = await db
      .select({
        id: atenciones.id,
        motivoConsulta: atenciones.motivoConsulta,
        sintomas: atenciones.sintomas,
        observaciones: atenciones.observaciones,
        planSeguir: atenciones.planSeguir,
        estado: atenciones.estado,
        created_at: atenciones.created_at,
        inicioAtencion: atenciones.inicioAtencion,
        finAtencion: atenciones.finAtencion,
        duracionAtencion: atenciones.duracionAtencion,
        nombreDoctor: users.nombre,
        apellidoDoctor: users.apellido,
      })
      .from(atenciones)
      .innerJoin(users, eq(users.id, atenciones.userIdMedico))
      .where(eq(atenciones.id, atencionId));

    if (!atencionData) {
      return createResponse(404, 'Atención no encontrada');
    }

    const [pacienteData] = await db
      .select({
        id: pacientes.id,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        sexo: pacientes.sexo,
        fNacimiento: pacientes.fNacimiento,
        celular: pacientes.celular,
        email: pacientes.email,
        domicilio: pacientes.domicilio,
        grupoSanguineo: historiaClinica.grupoSanguineo,
        historiaClinicaId: historiaClinica.id,
      })
      .from(pacientes)
      .leftJoin(historiaClinica, eq(historiaClinica.pacienteId, pacientes.id))
      .where(eq(pacientes.id, pacienteId));

    if (!pacienteData) {
      return createResponse(404, 'Paciente no encontrado');
    }

    const [userPreferences] = await db
      .select()
      .from(preferenciaPerfilUser)
      .where(eq(preferenciaPerfilUser.userId, user.id));

    const [signosVitalesAtencion] = await db
      .select()
      .from(signosVitales)
      .where(eq(signosVitales.atencionId, atencionId));

    const diagnosticosAtencion = await db
      .select()
      .from(diagnostico)
      .where(eq(diagnostico.atencionId, atencionId));

    const medicamentosAtencion = await db
      .select()
      .from(medicamento)
      .where(eq(medicamento.atencionId, atencionId));

    const reportData = {
      atencionData: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        medicamentos: medicamentosAtencion,
        signosVitales: signosVitalesAtencion || null,
      },
      pacienteData: pacienteData,
      preferencias: userPreferences?.preferencias || {},
    };

    // 2. Generar HTML
    const htmlContent = generateReportHtmlV4(reportData);

    // 3. Usar Puppeteer para generar el PDF
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // 4. Registrar evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'EXPORT',
      tableName: 'atenciones',
      recordId: atencionId,
      description: `El usuario ${user.name} (${user.email}) exportó a PDF la atención con ID ${atencionId} del paciente ${pacienteData.nombre} ${pacienteData.apellido}.`,
      ipAddress,
      userAgent,
    });

    // 5. Enviar el PDF como respuesta
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte_atencion_${pacienteId}_${atencionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error al generar el PDF de la atención:', error);
    return createResponse(500, 'Error interno del servidor al generar el PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
