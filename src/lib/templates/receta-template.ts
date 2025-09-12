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

interface MedicamentoData {
  nombreGenerico: string;
  nombreComercial?: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

interface RecetaData {
  doctor: DoctorData;
  paciente: PacienteData;
  medicamentos: MedicamentoData[];
  fecha: string;
}

export const generateRecetaHtml = (data: RecetaData) => {
  const renderMedicamentos = (medicamentos: MedicamentoData[]) => {
    if (!medicamentos || medicamentos.length === 0) {
      return '<p>No se prescribieron medicamentos.</p>';
    }
    return medicamentos
      .map(
        med => `
      <div class="patient-info">
          <p class="nameMedicacion">Rp/ ${med.nombreGenerico} ${med.nombreComercial ? `(${med.nombreComercial})` : ''}</p>
          <div class="contenedorMedicamentos">
          <div class="itemsContenedorMedicamentos">
            <b>Dosis:</b>
            <p>${med.dosis}</p>
          </div>
          <div class="itemsContenedorMedicamentos">
            <b>Frecuencia:</b>
            <p>${med.frecuencia}</p>
          </div>
          <div class="itemsContenedorMedicamentos">
            <b>Duración:</b>
            <p>${med.duracion}</p>
          </div>
          </div>
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
        <title>Receta Médica</title>
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
                margin: 0px auto;
                border: 0px solid #e0e0e0;
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
            .recipe-title h1 {
                margin: 0;
               
                font-size: 24px;
                color: #1E1B4B;
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
            .prescriptions h3 {
                font-size: 16px;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 5px;
                margin-bottom: 5px;
            }
            .medication {
                margin-bottom: 5px;
                padding-bottom: 5px;
                padding-left: 10px;
                border-bottom: 1px solid #e0e0e0;
            }
            .nameMedicacion {
                font-weight: 700;
                font-size: 14px;
            }
            .contenedorMedicamentos {
                display: flex;
                flex-direction: row;
                gap: 5px;
                justify-content: space-start;
                align-items: center;
            }
            .itemsContenedorMedicamentos {
                display: flex;
                justify-content: space-start;
                align-items: center;
            }
            .medication .instructions {
                padding-left: 15px;
                font-style: italic;
            }
            .footer {
                display: flex;
                justify-content: space-end;
                align-items: center;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
                margin-top: 40px;
            }
            .signature .line {
                border-bottom: 1px solid #333;
                margin-bottom: 5px;
                height: 40px;
            }
            .footerEmpresa { text-align: center; margin-top: 15px; padding-top: 6px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; }
            .signature-space { margin-top: 20px; padding-top: 15px; border-top: 1px dashed #ccc; text-align: center; font-size: 12px; color: #555; }
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
                <div class="recipe-title">
                    <h1>RECETA MÉDICA</h1>
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
            <div class="prescriptions">
                <h3>Prescripción</h3>
                ${renderMedicamentos(data.medicamentos)}
            </div>
            <div class="footer">
               
                <div class="signature">
                    <div class="line"></div>
                    <p>Firma y Sello del Profesional</p>
                </div>
            </div>
            <div class="footerEmpresa">
                <p>Generado por ClinicalApp - ${new Date().getFullYear()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
