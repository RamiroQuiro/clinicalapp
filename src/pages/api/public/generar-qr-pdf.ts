import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import puppeteer from 'puppeteer';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { centroMedicoId, nombreCentro, qrUrl } = await request.json();

        if (!centroMedicoId || !nombreCentro || !qrUrl) {
            return createResponse(400, 'Faltan datos requeridos');
        }

        // HTML del cartel con estilos CSS inline
        const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>QR Sala de Espera - ${nombreCentro}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 40px;
        }
        
        .cartel-container {
          max-width: 600px;
          margin: 0 auto;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          background: white;
        }
        
        .header {
          margin-bottom: 32px;
        }
        
        .titulo {
          font-size: 32px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .subtitulo {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 16px;
        }
        
        .fecha {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 32px;
        }
        
        .qr-container {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          margin-bottom: 32px;
          display: inline-block;
        }
        
        .qr-image {
          width: 256px;
          height: 256px;
        }
        
        .instrucciones {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 32px;
          text-align: left;
        }
        
        .instrucciones h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 12px;
        }
        
        .instrucciones ol {
          color: #1e40af;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .instrucciones li {
          margin-bottom: 8px;
        }
        
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          font-size: 12px;
          color: #9ca3af;
        }
        
        .footer .brand {
          font-weight: bold;
        }
        
        .url {
          font-family: monospace;
          font-size: 10px;
          color: #6b7280;
          word-break: break-all;
          margin-top: 8px;
        }
        
        @media print {
          body { padding: 20px; }
          .cartel-container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="cartel-container">
        <div class="header">
          <h1 class="titulo">${nombreCentro}</h1>
          <p class="subtitulo">Sala de Espera Digital</p>
          <div class="fecha">
            <p>Fecha: ${new Date().toLocaleDateString('es-AR')}</p>
            <p>Hora: ${new Date().toLocaleTimeString('es-AR')}</p>
          </div>
        </div>
        
        <div class="qr-container">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrUrl)}" 
            alt="QR para Check-in"
            class="qr-image"
          />
        </div>
        
        <div class="instrucciones">
          <h4>¿Cómo usar?</h4>
          <ol>
            <li>Abra la cámara de su celular</li>
            <li>Apunte hacia el código QR</li>
            <li>Escanee automáticamente o manualmente</li>
            <li>Complete el formulario de check-in</li>
            <li>Espere su llamado en la sala</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Powered by</p>
          <div>
            <span class="brand">clínicalApp</span> • <span class="brand">ramaCode</span>
          </div>
          <div class="url">${qrUrl}</div>
        </div>
      </div>
    </body>
    </html>
    `;

        // Generar PDF con Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setContent(htmlContent);
        await page.emulateMediaType('print');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // Devolver PDF
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="cartel-qr-sala-espera-${nombreCentro.replace(/\s+/g, '-')}.pdf"`
            }
        });

    } catch (error) {
        console.error('Error generando PDF:', error);
        return createResponse(500, 'Error al generar PDF');
    }
};
