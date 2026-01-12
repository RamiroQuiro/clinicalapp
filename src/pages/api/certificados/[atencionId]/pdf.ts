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
        const {
            paciente,
            tipo = 'reposo', // por defecto reposo para compatibilidad
            diagnostico,
            diasReposo,
            fechaInicio,
            fechaAlta,
            actividadAptitud,
            observaciones,
            presentarA
        } = body;

        // Validacion basica segun el tipo
        if (!paciente || !presentarA) {
            return new Response('Faltan datos basicos requeridos', { status: 400 });
        }

        if (tipo === 'reposo' && (!diagnostico || !diasReposo || !fechaInicio)) {
            return new Response('Faltan datos para certificado de reposo', { status: 400 });
        }

        if (tipo === 'alta' && !fechaAlta) {
            return new Response('Faltan datos para certificado de alta', { status: 400 });
        }

        const currentUser = user as any;

        const certificadoData = {
            doctor: {
                nombre: currentUser?.nombre || '',
                apellido: currentUser?.apellido || '',
                especialidad: currentUser?.especialidad || 'Medico',
                matricula: currentUser?.mp || 'N/A',
            },
            paciente: {
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                dni: paciente.dni,
            },
            tipo,
            diagnostico,
            diasReposo,
            fechaInicio,
            fechaAlta,
            actividadAptitud,
            observaciones,
            presentarA,
            fechaEmision: formatDate(new Date()) || new Date().toLocaleDateString('es-AR'),
        };
        console.log('datos del certificado', certificadoData)
        const htmlContent = generateCertificadoHtml(certificadoData as any);
        // 5. Usar Puppeteer para convertir el HTML a PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();


        return new Response(pdfBuffer as any, {
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