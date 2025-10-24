const generateReportHtmlV4 = (data: any) => {
  const { atencionData, pacienteData, centroMedicoData, preferencias } = data;

  // --- HELPERS ---
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatDateTime = (dateString: string | number | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderSection = (title: string, content: string | null) => {
    if (!content) return '';
    return `<div class="section"><h3>${title}</h3>${content}</div>`;
  };

  const renderInfoItem = (label: string, value: any, unit: string = '') => {
    if (value === null || value === undefined || value === '' || value === 'N/A' || value === '---') return null;
    return `<div><span>${label}:</span> ${value}${unit}</div>`;
  };

  // --- CONTENIDO DINÁMICO ---

  const signosVitalesContent = () => {
    const vitalesPrefs = preferencias?.signosVitales?.campos || [];
    const vitalesData = atencionData.signosVitales;
    if (!vitalesData || vitalesPrefs.length === 0) return null;

    const labels: { [key: string]: string } = {
      peso: 'Peso',
      talla: 'Talla',
      temperatura: 'Temp.',
      frecuenciaCardiaca: 'F.C.',
      frecuenciaRespiratoria: 'F.R.',
      saturacionOxigeno: 'Sat. O2',
      tensionArterial: 'T.A.', // Legado
      presionSistolica: 'T.A. Sistólica',
      presionDiastolica: 'T.A. Diastólica',
      imc: 'IMC',
      glucosa: 'Glucosa',
      perimetroCefalico: 'Per. Cefálico',
      perimetroAbdominal: 'Per. Abdominal',
      dolor: 'Dolor (EVA)',
    };

    const units: { [key: string]: string } = {
      peso: ' kg',
      talla: ' cm',
      temperatura: ' °C',
      frecuenciaCardiaca: ' lpm',
      frecuenciaRespiratoria: ' rpm',
      saturacionOxigeno: ' %',
      glucosa: ' mg/dl',
    };

    const renderedItems = vitalesPrefs
      .map((key: string) => {
        const label = labels[key];
        const value = vitalesData[key];
        const unit = units[key] || '';
        return renderInfoItem(label, value, unit);
      })
      .filter(Boolean) // Eliminar nulos
      .join('');

    return renderedItems ? `<div class="info-grid">${renderedItems}</div>` : null;
  };

  const diagnosticosContent = (atencionData.diagnosticos && atencionData.diagnosticos.length > 0) ? `
    <table>
        <thead><tr><th>Diagnóstico</th><th>Código</th><th>Observaciones</th></tr></thead>
        <tbody>
            ${atencionData.diagnosticos.map((diag: any) => `
                <tr class="${diag.principal ? 'highlight' : ''}">
                    <td>${diag.diagnostico || ''} ${diag.principal ? '(Principal)' : ''}</td>
                    <td>${diag.codigoCIE || ''}</td>
                    <td>${diag.observaciones || ''}</td>
                </tr>`).join('')}
        </tbody>
    </table>
  ` : '<p>No hay diagnósticos para esta atención.</p>';

  const medicamentosContent = (atencionData.medicamentos && atencionData.medicamentos.length > 0) ? `
    <table>
        <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th></tr></thead>
        <tbody>
            ${atencionData.medicamentos.map((med: any) => `
                <tr>
                    <td>${med.nombreGenerico || ''} ${med.nombreComercial ? `(${med.nombreComercial})` : ''}</td>
                    <td>${med.dosis || ''}</td>
                    <td>${med.frecuencia || ''}</td>
                </tr>`).join('')}
        </tbody>
    </table>
  ` : '<p>No se indicaron medicamentos para esta atención.</p>';

  const derivacionesContent = (atencionData.derivaciones && atencionData.derivaciones.length > 0) ? `
    ${atencionData.derivaciones.map((d: any) => `
      <div class="sub-section">
        <p><strong>Especialidad Destino:</strong> ${d.especialidadDestino || 'N/A'}</p>
        <p><strong>Motivo:</strong> ${d.motivoDerivacion || 'N/A'}</p>
        ${d.nombreProfesionalExterno ? `<p><strong>Profesional Externo:</strong> ${d.nombreProfesionalExterno}</p>` : ''}
      </div>`).join('')}
  ` : null;

  const ordenesEstudioContent = (atencionData.ordenesEstudio && atencionData.ordenesEstudio.length > 0) ? `
    ${atencionData.ordenesEstudio.map((o: any) => `
      <div class="sub-section">
        <p><strong>Diagnóstico Presuntivo:</strong> ${o.diagnosticoPresuntivo || 'N/A'}</p>
        <p><strong>Estudios Solicitados:</strong></p>
        <ul>${o.estudiosSolicitados.map((e: string) => `<li>${e}</li>`).join('')}</ul>
      </div>`).join('')}
  ` : null;

  // --- RENDERIZADO FINAL ---
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
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1E1B4B; padding-bottom: 15px; margin-bottom: 20px; }
            .doctor-info h2 { margin: 0; font-size: 20px; color: #1E1B4B; text-transform: capitalize; }
            .doctor-info p { margin: 2px 0; text-transform: capitalize; font-size: 12px; }
            .report-title { text-align: right; }
            .report-title h1 { margin: 0; font-size: 22px; color: #1E1B4B; }
            .report-title p { margin: 2px 0; font-size: 11px; }
            .patient-info-box { background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 25px; border-radius: 5px; }
            .patient-info-box table { width: 100%; border-collapse: collapse; }
            .patient-info-box td { padding: 4px; font-size: 11px; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section h3 { font-size: 16px; color: #1E1B4B; border-bottom: 1px solid #e0e0e0; padding-bottom: 5px; margin-bottom: 10px; }
            .section p { margin-bottom: 5px; color: #555; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 5px 15px; color: #555; }
            .info-grid div span { font-weight: 700; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th, td { border-bottom: 1px solid #e8e8e8; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: 700; color: #333; }
            tr.highlight td { background-color: #f0f5ff; }
            .sub-section { border: 1px solid #f0f0f0; border-radius: 4px; padding: 10px; margin-top: 10px; }
            ul { padding-left: 20px; margin: 5px 0; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 30px; margin-top: 40px; }
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
                    <tr><td><strong>Paciente:</strong></td><td>${pacienteData.nombre} ${pacienteData.apellido}</td><td><strong>DNI:</strong></td><td>${pacienteData.dni}</td></tr>
                    <tr><td><strong>Obra Social:</strong></td><td>${pacienteData.obraSocial || 'N/A'}</td><td><strong>Afiliado N°:</strong></td><td>${pacienteData.nAfiliado || 'N/A'}</td></tr>
                </table>
            </div>

                        ${renderSection('Motivo de Consulta', `<p>${atencionData.motivoConsulta || 'Sin motivo de consulta registrado.'}</p>`) }

                        

                        ${renderSection('Síntomas', `<p>${atencionData.sintomas || 'Sin síntomas registrados.'}</p>`) }

            

                        ${renderSection('Observaciones', `<p>${atencionData.observaciones || 'Sin hallazgos registrados.'}</p>`) }

            

                        ${renderSection('Signos Vitales', signosVitalesContent())}

            

                        ${renderSection('Diagnósticos', diagnosticosContent)}

            

                        ${renderSection('Tratamiento Indicado', medicamentosContent)}

            

                        ${renderSection('Plan a Seguir', atencionData.planSeguir ? `<p>${atencionData.planSeguir}</p>` : null)}

            

                        ${renderSection('Derivaciones', derivacionesContent)}

            

                        ${renderSection('Órdenes de Estudio', ordenesEstudioContent)}

            

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



