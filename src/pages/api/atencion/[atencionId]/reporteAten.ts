import db from '@/db';
import {
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  pacientes,
  signosVitales,
  users,
} from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import puppeteer from 'puppeteer';

// Función para generar el HTML del reporte
const generateReportHtml = (data: any) => {
  const { atencionData, pacienteData } = data;

  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSignoVitalValue = (value: any) =>
    value !== null && value !== undefined ? value : 'N/A';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Atención Médica</title>
        <style>
            body { font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
            .container { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 15px; }
            .header h1 { color: #4CAF50; margin: 0; font-size: 28px; }
            .header p { color: #777; font-size: 14px; margin-top: 5px; }
            .section { margin-bottom: 25px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background-color: #f9f9f9; }
            .section-title { background-color: #4CAF50; color: white; padding: 10px 15px; margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0; font-size: 18px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { padding: 5px 0; }
            .info-item strong { color: #555; width: 120px; display: inline-block; }
            .full-width { grid-column: 1 / -1; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
            .notes { white-space: pre-wrap; background-color: #fff; border: 1px solid #e0e0e0; padding: 10px; border-radius: 5px; min-height: 50px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reporte de Atención Médica</h1>
                <p>Fecha de Generación: ${formatDate(new Date())}</p>
            </div>

            <div class="section">
                <div class="section-title">Datos del Paciente</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Nombre:</strong> ${pacienteData.nombre} ${pacienteData.apellido}</div>
                    <div class="info-item"><strong>DNI:</strong> ${pacienteData.dni}</div>
                    <div class="info-item"><strong>Fecha Nac.:</strong> ${formatDate(pacienteData.fNacimiento)}</div>
                    <div class="info-item"><strong>Sexo:</strong> ${pacienteData.sexo}</div>
                    <div class="info-item"><strong>Email:</strong> ${pacienteData.email || 'N/A'}</div>
                    <div class="info-item"><strong>Celular:</strong> ${pacienteData.celular || 'N/A'}</div>
                    <div class="info-item full-width"><strong>Domicilio:</strong> ${pacienteData.domicilio || 'N/A'}</div>
                    <div class="info-item"><strong>Grupo Sanguíneo:</strong> ${pacienteData.grupoSanguineo || 'N/A'}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Datos de la Atención</div>
                <div class="info-grid">
                    <div class="info-item"><strong>ID Atención:</strong> ${atencionData.id}</div>
                    <div class="info-item"><strong>Médico:</strong> ${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}</div>
                    <div class="info-item"><strong>Fecha Inicio:</strong> ${formatDate(atencionData.inicioAtencion)}</div>
                    <div class="info-item"><strong>Fecha Fin:</strong> ${formatDate(atencionData.finAtencion)}</div>
                    <div class="info-item"><strong>Duración:</strong> ${atencionData.duracionAtencion ? `${atencionData.duracionAtencion} min` : 'N/A'}</div>
                    <div class="info-item full-width"><strong>Motivo Consulta:</strong> ${atencionData.motivoConsulta}</div>
                    <div class="info-item full-width"><strong>Síntomas:</strong> ${atencionData.sintomas || 'N/A'}</div>
                    <div class="info-item full-width"><strong>Observaciones:</strong> ${atencionData.observaciones || 'N/A'}</div>
                </div>
            </div>

            ${
              atencionData.signosVitales
                ? `
            <div class="section">
                <div class="section-title">Signos Vitales</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Tensión Arterial:</strong> ${getSignoVitalValue(atencionData.signosVitales.tensionArterial)}</div>
                    <div class="info-item"><strong>Frecuencia Cardiaca:</strong> ${getSignoVitalValue(atencionData.signosVitales.frecuenciaCardiaca)}</div>
                    <div class="info-item"><strong>Frecuencia Respiratoria:</strong> ${getSignoVitalValue(atencionData.signosVitales.frecuenciaRespiratoria)}</div>
                    <div class="info-item"><strong>Temperatura:</strong> ${getSignoVitalValue(atencionData.signosVitales.temperatura)}</div>
                    <div class="info-item"><strong>Saturación O2:</strong> ${getSignoVitalValue(atencionData.signosVitales.saturacionOxigeno)}</div>
                    <div class="info-item"><strong>Peso:</strong> ${getSignoVitalValue(atencionData.signosVitales.peso)} kg</div>
                    <div class="info-item"><strong>Talla:</strong> ${getSignoVitalValue(atencionData.signosVitales.talla)} cm</div>
                    <div class="info-item"><strong>IMC:</strong> ${getSignoVitalValue(atencionData.signosVitales.imc)}</div>
                    <div class="info-item"><strong>Glucosa:</strong> ${getSignoVitalValue(atencionData.signosVitales.glucosa)}</div>
                </div>
            </div>
            `
                : ''
            }

            ${
              atencionData.diagnosticos && atencionData.diagnosticos.length > 0
                ? `
            <div class="section">
                <div class="section-title">Diagnósticos</div>
                <table>
                    <thead>
                        <tr>
                            <th>Código CIE</th>
                            <th>Diagnóstico</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${atencionData.diagnosticos
                          .map(
                            (diag: any) => `
                            <tr>
                                <td>${diag.codigoCIE || 'N/A'}</td>
                                <td>${diag.diagnostico || 'N/A'}</td>
                                <td>${diag.observaciones || 'N/A'}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            ${
              atencionData.medicamentos && atencionData.medicamentos.length > 0
                ? `
            <div class="section">
                <div class="section-title">Medicamentos</div>
                <table>
                    <thead>
                        <tr>
                            <th>Nombre Genérico</th>
                            <th>Nombre Comercial</th>
                            <th>Dosis</th>
                            <th>Frecuencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${atencionData.medicamentos
                          .map(
                            (med: any) => `
                            <tr>
                                <td>${med.nombreGenerico || 'N/A'}</td>
                                <td>${med.nombreComercial || 'N/A'}</td>
                                <td>${med.dosis || 'N/A'}</td>
                                <td>${med.frecuencia || 'N/A'}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            <div class="footer">
                <p>Reporte generado por ClinicalApp - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const { pacienteId, atencionId } = params;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;
  console.log('ingresando a la ruta de pdf', params);
  // 1. Autenticación
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  if (!pacienteId || !atencionId) {
    return createResponse(400, 'Se requieren el ID del paciente y de la atención');
  }

  let browser;
  try {
    // 2. Obtener datos de la atención
    const [atencionData] = await db
      .select({
        id: atenciones.id,
        motivoConsulta: atenciones.motivoConsulta,
        sintomas: atenciones.sintomas,
        observaciones: atenciones.observaciones,
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
    };

    // 3. Generar HTML
    const htmlContent = generateReportHtml(reportData);

    // 4. Usar Puppeteer para generar el PDF
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // 5. Registrar evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'EXPORT',
      tableName: 'atenciones',
      recordId: atencionId,
      description: `El usuario ${user.name} (${user.email}) exportó a PDF la atención con ID ${atencionId} del paciente ${pacienteData.nombre} ${pacienteData.apellido}.`,
      ipAddress,
      userAgent,
    });

    // 6. Enviar el PDF como respuesta
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
