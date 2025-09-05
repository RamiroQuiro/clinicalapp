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
      <title>Reporte de Atención Médica</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #222; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 5px; }
        h2 { font-size: 15px; margin: 15px 0 8px; border-bottom: 1px solid #555; }
        .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
        .item { font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
        th { background: #f2f2f2; }
        .firma { margin-top: 40px; text-align: center; font-size: 12px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #555; }
      </style>
    </head>
    <body>
      <h1>Reporte de Atención Médica</h1>
      <p style="text-align:center; font-size:12px;">Generado el: {{fechaGeneracion}}</p>
    
      <h2>Datos del Médico</h2>
      <div class="datos">
        <div class="item"><strong>Nombre:</strong> {{doctorNombre}}</div>
        <div class="item"><strong>Especialidad:</strong> {{doctorEspecialidad}}</div>
        <div class="item"><strong>Matrícula:</strong> {{doctorMatricula}}</div>
      </div>
    
      <h2>Datos del Paciente</h2>
      <div class="datos">
        <div class="item"><strong>Nombre:</strong> {{pacienteNombre}}</div>
        <div class="item"><strong>DNI:</strong> {{pacienteDNI}}</div>
        <div class="item"><strong>Fecha Nac.:</strong> {{pacienteNacimiento}}</div>
        <div class="item"><strong>Sexo:</strong> {{pacienteSexo}}</div>
        <div class="item"><strong>Contacto:</strong> {{pacienteContacto}}</div>
      </div>
    
      <h2>Motivo de Consulta</h2>
      <p>{{motivoConsulta}}</p>
    
      <h2>Síntomas y Evolución</h2>
      <p>{{sintomasEvolucion}}</p>
    
      <h2>Signos Vitales</h2>
      <div class="datos">
        <div class="item"><strong>TA:</strong> {{tensionArterial}}</div>
        <div class="item"><strong>FC:</strong> {{frecuenciaCardiaca}}</div>
        <div class="item"><strong>FR:</strong> {{frecuenciaRespiratoria}}</div>
        <div class="item"><strong>Temp:</strong> {{temperatura}}</div>
        <div class="item"><strong>Sat O2:</strong> {{saturacion}}</div>
        <div class="item"><strong>Peso:</strong> {{peso}}</div>
        <div class="item"><strong>Talla:</strong> {{talla}}</div>
        <div class="item"><strong>IMC:</strong> {{imc}}</div>
      </div>
    
      <h2>Examen Físico</h2>
      <p>{{examenFisico}}</p>
    
      <h2>Diagnósticos</h2>
      <table>
        <thead>
          <tr><th>Código CIE</th><th>Diagnóstico</th><th>Observaciones</th></tr>
        </thead>
        <tbody>
          {{#each diagnosticos}}
          <tr>
            <td>{{codigo}}</td>
            <td>{{nombre}}</td>
            <td>{{observaciones}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    
      <h2>Tratamiento</h2>
      <table>
        <thead>
          <tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th></tr>
        </thead>
        <tbody>
          {{#each medicamentos}}
          <tr>
            <td>{{nombre}}</td>
            <td>{{dosis}}</td>
            <td>{{frecuencia}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    
      <h2>Seguimiento y Controles</h2>
      <p>{{seguimiento}}</p>
    
      <div class="firma">
        <p>___________________________________</p>
        <p>{{doctorNombre}} - Matrícula {{doctorMatricula}}</p>
      </div>
    
      <div class="footer">
        Reporte generado por ClinicalApp - {{anioActual}}
      </div>
    </body>
    </html>
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Atención Médica</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #222; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 5px; }
        h2 { font-size: 15px; margin: 15px 0 8px; border-bottom: 1px solid #555; }
        .datos { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
        .item { font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 5px; text-align: left; }
        th { background: #f2f2f2; }
        .firma { margin-top: 40px; text-align: center; font-size: 12px; }
        .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #555; }
      </style>
    </head>
    <body>
      <h1>Reporte de Atención Médica</h1>
      <p style="text-align:center; font-size:12px;">Generado el: {{fechaGeneracion}}</p>
    
      <h2>Datos del Médico</h2>
      <div class="datos">
        <div class="item"><strong>Nombre:</strong> {{doctorNombre}}</div>
        <div class="item"><strong>Especialidad:</strong> {{doctorEspecialidad}}</div>
        <div class="item"><strong>Matrícula:</strong> {{doctorMatricula}}</div>
      </div>
    
      <h2>Datos del Paciente</h2>
      <div class="datos">
        <div class="item"><strong>Nombre:</strong> {{pacienteNombre}}</div>
        <div class="item"><strong>DNI:</strong> {{pacienteDNI}}</div>
        <div class="item"><strong>Fecha Nac.:</strong> {{pacienteNacimiento}}</div>
        <div class="item"><strong>Sexo:</strong> {{pacienteSexo}}</div>
        <div class="item"><strong>Contacto:</strong> {{pacienteContacto}}</div>
      </div>
    
      <h2>Motivo de Consulta</h2>
      <p>{{motivoConsulta}}</p>
    
      <h2>Síntomas y Evolución</h2>
      <p>{{sintomasEvolucion}}</p>
    
      <h2>Signos Vitales</h2>
      <div class="datos">
        <div class="item"><strong>TA:</strong> {{tensionArterial}}</div>
        <div class="item"><strong>FC:</strong> {{frecuenciaCardiaca}}</div>
        <div class="item"><strong>FR:</strong> {{frecuenciaRespiratoria}}</div>
        <div class="item"><strong>Temp:</strong> {{temperatura}}</div>
        <div class="item"><strong>Sat O2:</strong> {{saturacion}}</div>
        <div class="item"><strong>Peso:</strong> {{peso}}</div>
        <div class="item"><strong>Talla:</strong> {{talla}}</div>
        <div class="item"><strong>IMC:</strong> {{imc}}</div>
      </div>
    
      <h2>Examen Físico</h2>
      <p>{{examenFisico}}</p>
    
      <h2>Diagnósticos</h2>
      <table>
        <thead>
          <tr><th>Código CIE</th><th>Diagnóstico</th><th>Observaciones</th></tr>
        </thead>
        <tbody>
          {{#each diagnosticos}}
          <tr>
            <td>{{codigo}}</td>
            <td>{{nombre}}</td>
            <td>{{observaciones}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    
      <h2>Tratamiento</h2>
      <table>
        <thead>
          <tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th></tr>
        </thead>
        <tbody>
          {{#each medicamentos}}
          <tr>
            <td>{{nombre}}</td>
            <td>{{dosis}}</td>
            <td>{{frecuencia}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    
      <h2>Seguimiento y Controles</h2>
      <p>{{seguimiento}}</p>
    
      <div class="firma">
        <p>___________________________________</p>
        <p>{{doctorNombre}} - Matrícula {{doctorMatricula}}</p>
      </div>
    
      <div class="footer">
        Reporte generado por ClinicalApp - {{anioActual}}
      </div>
    </body>
    </html>
        `;
};

export default generateReportHtml;
