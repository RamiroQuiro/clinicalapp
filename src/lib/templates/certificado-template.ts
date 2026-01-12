export type TipoCertificado = 'reposo' | 'alta' | 'aptitud';

interface DoctorData {
    nombre: string;
    apellido: string;
    especialidad: string;
    matricula: string;
}

interface PacienteData {
    nombre: string;
    apellido: string;
    dni: string;
}

export interface CertificadoData {
    doctor: DoctorData;
    paciente: PacienteData;
    tipo: TipoCertificado;
    diagnostico?: string;
    diasReposo?: string;
    fechaInicio?: string;
    fechaAlta?: string;
    actividadAptitud?: string;
    presentarA: string;
    fechaEmision: string;
    observaciones?: string;
}

export const generateCertificadoHtml = (data: CertificadoData) => {
    let contenidoCuerpo = '';

    // Logica para generar el contenido segun el tipo de certificado
    switch (data.tipo) {
        case 'reposo':
            const diasReposoNum = parseInt(data.diasReposo || '0', 10);
            const diasEnPalabras = diasReposoNum === 1 ? 'un (1) dia' : `${data.diasReposo} (${data.diasReposo}) dias`;
            const fechaInicio = data.fechaInicio
                ? new Date(data.fechaInicio + 'T00:00:00').toLocaleDateString('es-AR')
                : new Date().toLocaleDateString('es-AR');

            contenidoCuerpo = `
                <p>
                    Por medio de la presente, se deja constancia que el/la paciente <strong>${data.paciente.nombre} ${data.paciente.apellido}</strong>,
                    DNI <strong>${data.paciente.dni}</strong>, fue atendido/a en la fecha, presentando un diagnostico de
                    <strong>${data.diagnostico}</strong>.
                </p>
                <p>
                    Se indica reposo laboral/escolar por <strong>${diasEnPalabras}</strong> a partir del dia ${fechaInicio}.
                </p>
            `;
            break;

        case 'alta':
            const fechaAlta = data.fechaAlta
                ? new Date(data.fechaAlta + 'T00:00:00').toLocaleDateString('es-AR')
                : new Date().toLocaleDateString('es-AR');

            contenidoCuerpo = `
                <p>
                    Por medio de la presente, certifico que el/la paciente <strong>${data.paciente.nombre} ${data.paciente.apellido}</strong>,
                    DNI <strong>${data.paciente.dni}</strong>, ha recibido el alta medica en la fecha ${fechaAlta}.
                </p>
                <p>
                    Se encuentra en condiciones de retomar sus actividades habituales.
                </p>
                ${data.diagnostico ? `<p>Motivo de la baja anterior: <strong>${data.diagnostico}</strong>.</p>` : ''}
            `;
            break;

        case 'aptitud':
            contenidoCuerpo = `
                <p>
                    Certifico que he examinado en la fecha a <strong>${data.paciente.nombre} ${data.paciente.apellido}</strong>,
                    DNI <strong>${data.paciente.dni}</strong>.
                </p>
                <p>
                    Al momento del examen fisico, no se evidencian signos de patologia aguda o cronica descompensada que contraindiquen
                    la realizacion de <strong>${data.actividadAptitud || 'actividades fisicas habituales'}</strong>.
                </p>
                ${data.observaciones ? `<p>Observaciones: ${data.observaciones}</p>` : ''}
            `;
            break;
    }

    // Agregar el parrafo de 'A solicitud de...' que es comun a todos
    contenidoCuerpo += `
        <p>
            Se extiende el presente certificado a solicitud del interesado/a para ser presentado ante <strong>${data.presentarA}</strong>.
        </p>
    `;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Certificado Medico</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #fff;
                color: #333;
                font-size: 14px;
            }
            .container {
                width: 90%;
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                color: #1E1B4B;
                border-bottom: 2px solid #1E1B4B;
                padding-bottom: 10px;
                display: inline-block;
            }
            .body-section {
                margin-bottom: 40px;
                line-height: 2;
                text-align: justify;
            }
            .body-section p {
                margin: 20px 0;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding-top: 60px;
                margin-top: 80px;
            }
            .signature {
                text-align: center;
                width: 280px;
            }
            .signature .line {
                border-bottom: 1px solid #333;
                margin-bottom: 8px;
                padding-top: 40px;
            }
            .doctor-info {
                font-size: 12px;
            }
            .date-info {
                text-align: right;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Certificado Medico</h1>
            </div>
            <div class="body-section">
                ${contenidoCuerpo}
            </div>
            <div class="footer">
                <div class="date-info">
                    <p>Emitido el ${data.fechaEmision}</p>
                </div>
                <div class="signature">
                    <div class="line"></div>
                    <div class="doctor-info">
                        <strong>Dr./Dra. ${data.doctor.nombre} ${data.doctor.apellido}</strong><br>
                        ${data.doctor.especialidad}<br>
                        Mat. Prof: ${data.doctor.matricula}
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};