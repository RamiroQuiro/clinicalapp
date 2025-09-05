const generateReportHtmlV2 = (data: any) => {
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

  // Helper para renderizar una sección solo si tiene contenido
  const renderSection = (title: string, content: string, icon: string) => {
    if (!content.trim()) return '';
    return `
      <div class="section">
          <div class="section-title"><span class="icon">${icon}</span> ${title}</div>
          ${content}
      </div>
    `;
  };

  // Helper para renderizar un campo solo si tiene valor
  const renderInfoItem = (label: string, value: any) => {
    if (!value || value === 'N/A') return '';
    return `<div class="info-item"><strong>${label}:</strong> ${value}</div>`;
  };

  const pacienteInfo = `
    <div class="info-grid">
        ${renderInfoItem('Nombre', `${pacienteData.nombre} ${pacienteData.apellido}`)}
        ${renderInfoItem('DNI', pacienteData.dni)}
        ${renderInfoItem('Fecha Nac.', formatDate(pacienteData.fNacimiento))}
        ${renderInfoItem('Sexo', pacienteData.sexo)}
        ${renderInfoItem('Email', pacienteData.email)}
        ${renderInfoItem('Celular', pacienteData.celular)}
        ${renderInfoItem('Domicilio', pacienteData.domicilio)}
        ${renderInfoItem('Grupo Sanguíneo', pacienteData.grupoSanguineo)}
    </div>
  `;

  const atencionInfo = `
    <div class="info-grid">
        ${renderInfoItem('ID Atención', atencionData.id)}
        ${renderInfoItem('Médico', `${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}`)}
        ${renderInfoItem('Fecha Inicio', formatDate(atencionData.inicioAtencion))}
        ${renderInfoItem('Fecha Fin', formatDate(atencionData.finAtencion))}
        ${renderInfoItem('Duración', atencionData.duracionAtencion ? `${atencionData.duracionAtencion} min` : '')}
        ${renderInfoItem('Motivo Consulta', atencionData.motivoConsulta)}
        ${renderInfoItem('Síntomas', atencionData.sintomas)}
        ${renderInfoItem('Observaciones', atencionData.observaciones)}
    </div>
  `;

  const signosVitalesContent = atencionData.signosVitales ? `
    <div class="info-grid">
        ${renderInfoItem('Tensión Arterial', getSignoVitalValue(atencionData.signosVitales.tensionArterial))}
        ${renderInfoItem('Frecuencia Cardiaca', getSignoVitalValue(atencionData.signosVitales.frecuenciaCardiaca))}
        ${renderInfoItem('Frecuencia Respiratoria', getSignoVitalValue(atencionData.signosVitales.frecuenciaRespiratoria))}
        ${renderInfoItem('Temperatura', getSignoVitalValue(atencionData.signosVitales.temperatura))}
        ${renderInfoItem('Saturación O2', getSignoVitalValue(atencionData.signosVitales.saturacionOxigeno))}
        ${renderInfoItem('Peso', getSignoVitalValue(atencionData.signosVitales.peso) ? `${getSignoVitalValue(atencionData.signosVitales.peso)} kg` : '')}
        ${renderInfoItem('Talla', getSignoVitalValue(atencionData.signosVitales.talla) ? `${getSignoVitalValue(atencionData.signosVitales.talla)} cm` : '')}
        ${renderInfoItem('IMC', getSignoVitalValue(atencionData.signosVitales.imc))}
        ${renderInfoItem('Glucosa', getSignoVitalValue(atencionData.signosVitales.glucosa))}
    </div>
  ` : '';

  const diagnosticosContent = atencionData.diagnosticos && atencionData.diagnosticos.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>Código CIE</th>
                <th>Diagnóstico</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            ${atencionData.diagnosticos.map((diag: any) => `
                <tr class="${diag.principal ? 'highlight-diagnosis' : ''}">
                    <td>${diag.codigoCIE || ''}</td>
                    <td>${diag.diagnostico || ''}</td>
                    <td>${diag.observaciones || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  ` : '';

  const medicamentosContent = atencionData.medicamentos && atencionData.medicamentos.length > 0 ? `
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
            ${atencionData.medicamentos.map((med: any) => `
                <tr>
                    <td>${med.nombreGenerico || ''}</td>
                    <td>${med.nombreComercial || ''}</td>
                    <td>${med.dosis || ''}</td>
                    <td>${med.frecuencia || ''}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
  ` : '';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Atención Médica</title>
        <style>
            body { font-family: 'Roboto', 'Helvetica Neue', 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.5; font-size: 13px; }
            .container { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .header { background-color: #f8f8f8; color: #333; padding: 20px 25px; text-align: center; border-bottom: 1px solid #e0e0e0; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 500; color: #2c3e50; }
            .header p { margin: 4px 0 0; font-size: 12px; color: #777; }
            .report-date { font-size: 11px; margin-top: 10px; color: #999; }

            .section { margin: 15px 25px; padding: 15px; border-radius: 6px; background-color: #ffffff; border: 1px solid #f0f0f0; page-break-inside: avoid; }
            .section-title { font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; }
            .section-title .icon { margin-right: 8px; font-size: 18px; color: #555; }

            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
            .info-item { padding: 3px 0; }
            .info-item strong { color: #444; font-weight: 500; margin-right: 5px; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; page-break-inside: avoid; }
            th, td { border: 1px solid #e8e8e8; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: 600; color: #555; }

            .highlight-diagnosis { background-color: #eef7ff; border-left: 3px solid #3498db; }

            .footer { text-align: center; margin-top: 25px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; }
            .signature-space { margin-top: 40px; padding-top: 15px; border-top: 1px dashed #ccc; text-align: center; font-size: 12px; color: #555; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reporte de Atención Médica</h1>
                <p>Clínica XYZ - Tu Salud es Nuestra Prioridad</p>
                <div class="report-date">Generado el: ${formatDate(new Date())}</div>
            </div>

            ${renderSection(
              'Datos del Médico',
              `
                <div class="info-grid">
                    ${renderInfoItem('Nombre', `${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}`)}
                    ${renderInfoItem('Especialidad', '[Especialidad del Médico]')}
                    ${renderInfoItem('Matrícula', '[Matrícula Profesional]')}
                </div>
              `,
              '&#128104;'
            )}

            ${renderSection(
              'Datos del Paciente',
              pacienteInfo,
              '&#128100;'
            )}

            ${renderSection(
              'Motivo de Consulta',
              `<p>${atencionData.motivoConsulta || 'N/A'}</p>`,
              '&#128269;'
            )}

            ${renderSection(
              'Síntomas y Evolución',
              `<p>${atencionData.sintomas || 'N/A'}</p>`,
              '&#128138;'
            )}

            ${renderSection(
              'Signos Vitales',
              signosVitalesContent,
              '&#128151;'
            )}

            ${renderSection(
              'Examen Físico',
              `<p>[Hallazgos detallados del examen físico]</p>`,
              '&#128220;'
            )}

            ${renderSection(
              'Diagnósticos',
              diagnosticosContent,
              '&#128204;'
            )}

            ${renderSection(
              'Tratamiento (Medicamentos)',
              medicamentosContent,
              '&#128137;'
            )}

            ${renderSection(
              'Seguimiento y Controles Futuros',
              `<p>[Recomendaciones y controles futuros]</p>`,
              '&#128197;'
            )}

            <div class="signature-space">
                <p>___________________________________</p>
                <p>Firma del Médico Tratante</p>
                ${renderInfoItem('', `${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}`)}
                ${renderInfoItem('', '[Matrícula Profesional]')}
            </div>

            <div class="footer">
                <p>Reporte generado por ClinicalApp - ${new Date().getFullYear()}</p>
                <p>Página 1 de 1</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export default generateReportHtmlV2;
