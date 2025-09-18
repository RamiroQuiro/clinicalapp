
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

interface EstudioData {
  nombre: string;
  indicaciones?: string;
}

interface OrdenEstudioData {
  doctor: DoctorData;
  paciente: PacienteData;
  estudios: EstudioData[];
  diagnosticoPresuntivo: string;
  fecha: string;
}

export const generateOrdenEstudioHtml = (data: OrdenEstudioData) => {
  const renderEstudios = (estudios: EstudioData[]) => {
    if (!estudios || estudios.length === 0) {
      return '<p>No se solicitaron estudios.</p>';
    }
    return estudios
      .map(
        estudio => `
      <div class="study-item">
          <p class="name"><strong>- ${estudio.nombre}</strong></p>
          ${estudio.indicaciones ? `<p class="instructions"><em>Indicaciones: ${estudio.indicaciones}</em></p>` : ''}
      </div>
    `
      )
      .join('');
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orden de Estudio</title>
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
            .studies-section h3 {
                font-size: 16px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            .study-item {
                padding-left: 10px;
                margin-bottom: 10px;
            }
            .study-item .name {
                font-weight: 700;
                font-size: 14px;
            }
            .study-item .instructions {
                padding-left: 15px;
                font-style: italic;
                color: #555;
            }
            .diagnostico {
                margin-top: 25px;
                padding: 10px;
                background-color: #f9f9f9;
                border-top: 1px solid #e0e0e0;
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
                    <h2>Dr. ${data.doctor.nombre} ${data.doctor.apellido}</h2>
                    <p>${data.doctor.especialidad}</p>
                    <p>Mat. Prof: ${data.doctor.matricula}</p>
                </div>
                <div class="title">
                    <h1>Orden de Estudio</h1>
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
            <div class="studies-section">
                <h3>Estudios Solicitados</h3>
                ${renderEstudios(data.estudios)}
            </div>
            <div class="diagnostico">
                <p><strong>Diagnóstico Presuntivo:</strong> ${data.diagnosticoPresuntivo || 'No especificado'}</p>
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
