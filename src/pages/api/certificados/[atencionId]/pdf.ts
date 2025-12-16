import { generateCertificadoHtml } from '@/lib/templates/certificado-template';
import formatDate from '@/utils/formatDate';
import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';

export const POST: APIRoute = async ({ request, locals }) => {
    const { user } = locals;
    if (!user) {
        return new Response('No autorizado', { status: 401 });
    }

    try {
        const body = await request.json();
        const { paciente, diagnostico, diasReposo, fechaInicio, presentarA } = body;

        if (!paciente || !diagnostico || !diasReposo || !fechaInicio || !presentarA) {
            return new Response('Faltan datos requeridos en el cuerpo de la solicitud', { status: 400 });
        }

        const certificadoData = {
            doctor: {
                nombre: user?.nombre || '',
                apellido: user?.apellido || '',
                especialidad: user?.especialidad || 'Médico',
                matricula: user?.mp || 'N/A',
            },
            paciente: {
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                dni: paciente.dni,
            },
            diagnostico,
            diasReposo,
            fechaInicio,
            presentarA,
            fechaEmision: formatDate(new Date()),
        };
        console.log('datos del ceritifacdo', certificadoData)
        const htmlContent = generateCertificadoHtml(certificadoData);
        // 5. Usar Puppeteer para convertir el HTML a PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();


        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="certificado-${paciente.dni}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error al generar el PDF del certificado:', error);
        return new Response('Error interno al generar el PDF', { status: 500 });
    }
};