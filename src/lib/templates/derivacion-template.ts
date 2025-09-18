
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
  obraSocial: string;
  nAfiliado: string;
}

interface DerivacionData {
  doctorOrigen: DoctorData;
  paciente: PacienteData;
  especialidadDestino: string;
  motivoDerivacion: string;
  fecha: string;
  nombreProfesionalExterno?: string;
}

export const generateDerivacionHtml = (data: DerivacionData) => {
  const destino = data.nombreProfesionalExterno
    ? `Dr./Dra. ${data.nombreProfesionalExterno}`
    : `un especialista en ${data.especialidadDestino}`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hoja de Derivación</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #fff;
                color: #333;
                font-size: 12px;
            }
            .container {
                width: 90%;
                max-width: 800px;
                margin: 0 auto;
                padding: 10px;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #1E1B4B;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .doctor-info h2 {
                margin: 0;
                font-size: 20px;
                color: #1E1B4B;
                text-transform: capitalize;
            }
            .doctor-info p {
                margin: 2px 0;
                text-transform: capitalize;
                font-size: 12px;
            }
            .title h1 {
                margin: 0;
                font-size: 24px;
                color: #1E1B4B;
                text-align: right;
            }
            .patient-info {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                padding: 15px;
                margin-bottom: 25px;
                border-radius: 5px;
            }
            .patient-info table {
                width: 100%;
                border-collapse: collapse;
            }
            .patient-info td {
                padding: 5px;
                font-size: 12px;
            }
            .body-section {
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .body-section p {
                margin: 10px 0;
            }
            .footer {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
                margin-top: 40px;
            }
            .signature {
                text-align: center;
            }
            .signature .line {
                border-bottom: 1px solid #333;
                margin-bottom: 5px;
                height: 40px;
                width: 250px;
            }
            .footer-empresa { text-align: center; margin-top: 15px; padding-top: 6px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="doctor-info">
                    <h2>Dr. ${data.doctorOrigen.nombre} ${data.doctorOrigen.apellido}</h2>
                    <p>${data.doctorOrigen.especialidad}</p>
                    <p>Mat. Prof: ${data.doctorOrigen.matricula}</p>
                </div>
                <div class="title">
                    <h1>Hoja de Derivación</h1>
                    <p style="font-size: 12px; text-align: right;">${data.fecha}</p>
                </div>
            </div>
            <div class="patient-info">
                <table>
                    <tr>
                        <td><strong>Paciente:</strong></td>
                        <td>${data.paciente.nombre} ${data.paciente.apellido}</td>
                        <td><strong>DNI:</strong></td>
                        <td>${data.paciente.dni}</td>
                    </tr>
                    <tr>
                        <td><strong>Obra Social:</strong></td>
                        <td>${data.paciente.obraSocial}</td>
                        <td><strong>Afiliado N°:</strong></td>
                        <td>${data.paciente.nAfiliado}</td>
                    </tr>
                </table>
            </div>
            <div class="body-section">
                <p>Estimado/a colega,</p>
                <p>Por medio de la presente, derivo a su consulta al paciente <strong>${data.paciente.nombre} ${data.paciente.apellido}</strong> para evaluación y manejo por su especialidad.</p>
                <p><strong>Motivo de la Derivación:</strong></p>
                <p><em>${data.motivoDerivacion}</em></p>
                <p>Agradezco de antemano su colaboración y quedo a su disposición para cualquier consulta.</p>
                <p>Atentamente,</p>
            </div>
            <div class="footer">
                <div class="signature">
                    <div class="line"></div>
                    <p>Firma y Sello del Profesional</p>
                </div>
            </div>
            <div class="footer-empresa">
                <p>Generado por ClinicalApp - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
