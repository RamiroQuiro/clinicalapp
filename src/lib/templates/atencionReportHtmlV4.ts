const generateReportHtmlV4 = (data: any) => {
    const { atencionData, pacienteData, centroMedicoData } = data;

    const formatDate = (dateString: string | number | Date) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const formatDateTime = (dateString: string | number | Date) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getSignoVitalValue = (value: any) =>
        value !== null && value !== undefined ? value : '---';

    const renderSection = (title: string, content: string) => {
        if (!content || content.trim() === '<div class="info-grid"></div>' || content.trim() === '<table><tbody></tbody></table>') return '';
        return `
      <div class="section">
          <h3>${title}</h3>
          ${content}
      </div>
    `;
    };

    const renderInfoItem = (label: string, value: any) => {
        if (value === null || value === undefined || value === '' || value === 'N/A') return '';
        return `<div><span>${label}:</span> ${value}</div>`;
    };

    const pacienteInfo = `
    <div class="info-grid">
        ${renderInfoItem('Nombre', `${pacienteData?.nombre} ${pacienteData?.apellido}`)}
        ${renderInfoItem('DNI', pacienteData?.dni)}
        ${renderInfoItem('Fecha Nac.', formatDate(pacienteData?.fNacimiento))}
        ${renderInfoItem('Sexo', pacienteData?.sexo)}
        ${renderInfoItem('Email', pacienteData?.email)}
        ${renderInfoItem('Celular', pacienteData?.celular)}
        ${renderInfoItem('Domicilio', pacienteData?.domicilio)}
        ${renderInfoItem('Grupo Sanguíneo', pacienteData?.grupoSanguineo)}
    </div>
  `;

    const signosVitalesContent = atencionData.signosVitales ? `
    <div class="info-grid">
        ${renderInfoItem('T.A.', getSignoVitalValue(atencionData.signosVitales.tensionArterial))}
        ${renderInfoItem('F.C.', getSignoVitalValue(atencionData.signosVitales.frecuenciaCardiaca))}
        ${renderInfoItem('F.R.', getSignoVitalValue(atencionData.signosVitales.frecuenciaRespiratoria))}
        ${renderInfoItem('Temp.', getSignoVitalValue(atencionData.signosVitales.temperatura) ? `${getSignoVitalValue(atencionData.signosVitales.temperatura)} °C` : '')}
        ${renderInfoItem('Sat. O2', getSignoVitalValue(atencionData.signosVitales.saturacionOxigeno) ? `${getSignoVitalValue(atencionData.signosVitales.saturacionOxigeno)} %` : '')}
        ${renderInfoItem('Peso', getSignoVitalValue(atencionData.signosVitales.peso) ? `${getSignoVitalValue(atencionData.signosVitales.peso)} kg` : '')}
        ${renderInfoItem('Talla', getSignoVitalValue(atencionData.signosVitales.talla) ? `${getSignoVitalValue(atencionData.signosVitales.talla)} cm` : '')}
        ${renderInfoItem('IMC', getSignoVitalValue(atencionData.signosVitales.imc))}
    </div>
  ` : '';

    const diagnosticosContent = atencionData.diagnosticos && atencionData.diagnosticos.length > 0 ? `
    <table>
        <thead>
            <tr>
                <th>Diagnóstico</th>
                <th>Código</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            ${atencionData.diagnosticos.map((diag: any) => `
                <tr class="${diag.principal ? 'highlight' : ''}">
                    <td>${diag.diagnostico || ''} ${diag.principal ? '(Principal)' : ''}</td>
                    <td>${diag.codigoCIE || ''}</td>
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
                <th>Medicamento</th>
                <th>Dosis</th>
                <th>Frecuencia</th>
            </tr>
        </thead>
        <tbody>
            ${atencionData.medicamentos.map((med: any) => `
                <tr>
                    <td>${med.nombreGenerico || ''} ${med.nombreComercial ? `(${med.nombreComercial})` : ''}</td>
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
        <title>Resumen de Atención</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; background-color: #fff; color: #333; font-size: 11px; }
            .container { width: 90%; max-width: 800px; margin: 20px auto; padding: 20px; }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #1E1B4B;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .doctor-info h2 { margin: 0; font-size: 20px; color: #1E1B4B; text-transform: capitalize; }
            .doctor-info p { margin: 2px 0; text-transform: capitalize; font-size: 12px; }
            .report-title { text-align: right; }
            .report-title h1 { margin: 0; font-size: 22px; color: #1E1B4B; }
            .report-title p { margin: 2px 0; font-size: 11px; }

            .patient-info-box {
                background-color: #f9f9f9;
                border: 1px solid #e0e0e0;
                padding: 15px;
                margin-bottom: 25px;
                border-radius: 5px;
            }
            .patient-info-box table { width: 100%; border-collapse: collapse; }
            .patient-info-box td { padding: 4px; font-size: 11px; }

            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section h3 { font-size: 16px; color: #1E1B4B; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; margin-bottom: 10px; }
            .section p, .section div { margin-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 5px 15px; }
            .info-grid div span { font-weight: 700; }

            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border-bottom: 1px solid #e8e8e8; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: 700; color: #333; }
            tr.highlight td { background-color: #f0f5ff; }

            .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding-top: 30px;
                margin-top: 40px;
            }
            .signature { text-align: center; width: 250px; }
            .signature .line { border-bottom: 1px solid #333; height: 50px; margin-bottom: 5px; }
            .footer-org { text-align: right; font-size: 10px; color: #888; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="doctor-info">
                    <h2>Dr. ${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}</h2>
                    <p>${atencionData.especialidadDoctor || 'Medicina General'}</p>
                    <p>Mat. Prof: ${atencionData.matriculaDoctor || 'N/A'}</p>
                </div>
                <div class="report-title">
                    <h1>Resumen de Atención</h1>
                    <p>ID Atención: ${atencionData.id}</p>
                    <p>Fecha: ${formatDateTime(atencionData.inicioAtencion)}</p>
                </div>
            </div>

            <div class="patient-info-box">
                <table>
                    <tr>
                        <td><strong>Paciente:</strong></td>
                        <td>${pacienteData.nombre} ${pacienteData.apellido}</td>
                        <td><strong>DNI:</strong></td>
                        <td>${pacienteData.dni}</td>
                    </tr>
                    <tr>
                        <td><strong>Obra Social:</strong></td>
                        <td>${pacienteData.obraSocial || 'N/A'}</td>
                        <td><strong>Afiliado N°:</strong></td>
                        <td>${pacienteData.nAfiliado || 'N/A'}</td>
                    </tr>
                </table>
            </div>

            ${renderSection('Motivo de Consulta', `<p>${atencionData?.motivoConsulta || ''}</p>`)}
            
            ${renderSection('Enfermedad Actual y Antecedentes', `<p>${atencionData?.sintomas || ''}</p>`)}

            ${renderSection('Examen Físico', `<p>${atencionData?.observaciones || ''}</p>`)}

            ${renderSection('Signos Vitales', signosVitalesContent)}

            ${renderSection('Diagnósticos', diagnosticosContent)}

            ${renderSection('Tratamiento Indicado', medicamentosContent)}

            <div class="footer">
                <div class="footer-org">
                    <p>${centroMedicoData?.nombre || 'ClinicalApp'}</p>
                    <p>${centroMedicoData?.direccion || ''}</p>
                    <p>${centroMedicoData?.telefono || ''}</p>
                </div>
                <div class="signature">
                    <div class="line"></div>
                    <p>Firma y Sello del Profesional</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export default generateReportHtmlV4;
