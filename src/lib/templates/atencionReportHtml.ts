const generateReportHtml = (data: any) => {
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

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte de Atención Médica</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; font-size: 14px; }
            .container { width: 100%; max-width: 850px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .header { background-color: #5FA5FA; color: white; padding: 25px 30px; text-align: center; border-bottom: 5px solid #3498db; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
            .report-date { font-size: 12px; margin-top: 15px; color: #ecf0f1; opacity: 0.8; }

            .section { margin: 10px; padding: 10px; border-radius: 8px; background-color: #ffffff; border: 1px solid #e0e0e0; }
            .section-title { font-size: 18px; font-weight: 700; color: #5FA5FA; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #3498db; display: flex; align-items: center; }
            .section-title .icon { margin-right: 10px; font-size: 20px; color: #3498db; }

            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
            .info-item { padding: 5px 0; }
            .info-item strong { color: #555; font-weight: 600; margin-right: 5px; }

            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { border: 1px solid #e0e0e0; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: 700; color: #444; }

            .highlight-diagnosis { background-color: #e7f3ff; border-left: 4px solid #3498db; padding: 10px; margin-top: 10px; }
            .highlight-diagnosis strong { color: #3498db; }

            .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; }
            .signature-space { margin-top: 50px; padding-top: 20px; border-top: 1px dashed #ccc; text-align: center; font-size: 13px; color: #555; }
            .page-break { page-break-before: always; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reporte de Atención Médica</h1>
                <p>Clínica XYZ - Tu Salud es Nuestra Prioridad</p>
                <div class="report-date">Generado el: ${formatDate(new Date())}</div>
            </div>

            <div class="section">
                <div class="section-title"><span class="icon">&#128104;</span> Datos del Médico</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Nombre:</strong> ${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}</div>
                    <div class="info-item"><strong>Especialidad:</strong> [Especialidad del Médico]</div>
                    <div class="info-item"><strong>Matrícula:</strong> [Matrícula Profesional]</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title"><span class="icon">&#128100;</span> Datos del Paciente</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Nombre:</strong> ${pacienteData.nombre} ${pacienteData.apellido}</div>
                    <div class="info-item"><strong>DNI:</strong> ${pacienteData.dni}</div>
                    <div class="info-item"><strong>Fecha Nac.:</strong> ${formatDate(pacienteData.fNacimiento)}</div>
                    <div class="info-item"><strong>Sexo:</strong> ${pacienteData.sexo}</div>
                    <div class="info-item"><strong>Email:</strong> ${pacienteData.email || 'N/A'}</div>
                    <div class="info-item"><strong>Celular:</strong> ${pacienteData.celular || 'N/A'}</div>
                    <div class="info-item"><strong>Domicilio:</strong> ${pacienteData.domicilio || 'N/A'}</div>
                    <div class="info-item"><strong>Grupo Sanguíneo:</strong> ${pacienteData.grupoSanguineo || 'N/A'}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title"><span class="icon">&#128269;</span> Motivo de Consulta</div>
                <p>${atencionData.motivoConsulta}</p>
            </div>

            <div class="section">
                <div class="section-title"><span class="icon">&#128138;</span> Síntomas y Evolución</div>
                <p>${atencionData.sintomas || 'N/A'}</p>
            </div>

            ${
              atencionData.signosVitales
                ? `
            <div class="section">
                <div class="section-title"><span class="icon">&#128151;</span> Signos Vitales</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Tensión Arterial:</strong> ${getSignoVitalValue(atencionData.signosVitales.tensionArterial)}</div>
                    <div class="info-item"><strong>Frecuencia Cardiaca:</strong> ${getSignoVitalValue(atencionData.signosVitales.frecuenciaCardiaca)}</div>
                    <div class="info-item"><strong>Frecuencia Respiratoria:</strong> ${getSignoVitalValue(atencionData.signosVitales.frecuenciaRespiratoria)}</div>
                    <div class="info-item"><strong>Temperatura:</strong> ${getSignoVitalValue(atencionData.signosVitales.temperatura)}</div>
                    <div class="info-item"><strong>Saturación O2:</strong> ${getSignoVitalValue(atencionData.signosVitales.saturacionOxigeno)}</div>
                    <div class="info-item"><strong>Peso:</strong> ${getSignoVitalValue(atencionData.signosVitales.peso)} kg</div>
                    <div class="info-item"><strong>Talla:</strong> ${getSignoVitalValue(atencionData.signosVitales.talla)} cm</div>
                    <div class="info-item"><strong>IMC:</strong> ${getSignoVitalValue(atencionData.signosVitales.imc)}</div>
                    <div class="info-item"><strong>Glucosa:</strong> ${getSignoVitalValue(atencionData.signosVitales.glucosa)}</div>
                </div>
            </div>
            `
                : ''
            }

            <div class="section">
                <div class="section-title"><span class="icon">&#128220;</span> Examen Físico</div>
                <p>[Hallazgos detallados del examen físico]</p>
            </div>

            ${
              atencionData.diagnosticos && atencionData.diagnosticos.length > 0
                ? `
            <div class="section">
                <div class="section-title"><span class="icon">&#128204;</span> Diagnósticos</div>
                <table>
                    <thead>
                        <tr>
                            <th>Código CIE</th>
                            <th>Diagnóstico</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${atencionData.diagnosticos
                          .map(
                            (diag: any) => `
                            <tr class="${diag.principal ? 'highlight-diagnosis' : ''}">
                                <td>${diag.codigoCIE || 'N/A'}</td>
                                <td>${diag.diagnostico || 'N/A'}</td>
                                <td>${diag.observaciones || 'N/A'}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            ${
              atencionData.medicamentos && atencionData.medicamentos.length > 0
                ? `
            <div class="section">
                <div class="section-title"><span class="icon">&#128137;</span> Tratamiento (Medicamentos)</div>
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
                        ${atencionData.medicamentos
                          .map(
                            (med: any) => `
                            <tr>
                                <td>${med.nombreGenerico || 'N/A'}</td>
                                <td>${med.nombreComercial || 'N/A'}</td>
                                <td>${med.dosis || 'N/A'}</td>
                                <td>${med.frecuencia || 'N/A'}</td>
                            </tr>
                        `
                          )
                          .join('')}
                    </tbody>
                </table>
            </div>
            `
                : ''
            }

            <div class="section">
                <div class="section-title"><span class="icon">&#128197;</span> Seguimiento y Controles Futuros</div>
                <p>[Recomendaciones y controles futuros]</p>
            </div>

            <div class="signature-space">
                <p>___________________________________</p>
                <p>Firma del Médico Tratante</p>
                <p>${atencionData.nombreDoctor} ${atencionData.apellidoDoctor}</p>
                <p>[Matrícula Profesional]</p>
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

export default generateReportHtml;
