export const getTemplate = (name: string, token: string, hostUrl: string) => {
  const verificationUrl = `${hostUrl}/verificar-email/${token}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f5;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #111827;
    }
    .message {
      margin-bottom: 30px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    .link-fallback {
      margin-top: 30px;
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ControlStock</h1>
    </div>
    <div class="content">
      <div class="greeting">¡Hola ${name}!</div>
      <p class="message">
        Gracias por registrarte en ControlStock. Para comenzar a gestionar tu negocio, necesitamos verificar tu dirección de correo electrónico.
      </p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
      </div>
      
      <div class="link-fallback">
        <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
        <p><a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a></p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ControlStock. Todos los derechos reservados.</p>
      <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const getTemplateEmailRestablecimiento = (
  email: string,
  token: string
) => {
  // Nota: Asumimos localhost:3000 por defecto si no se pasa hostUrl,
  // pero idealmente deberíamos pasar hostUrl también a esta función.
  // Por ahora mantenemos la lógica existente pero mejoramos el diseño.
  const resetUrl = `http://localhost:4321/api/auth/confirm/${token}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f5;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #374151;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #111827;
    }
    .message {
      margin-bottom: 30px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background-color: #ef4444;
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #dc2626;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    .link-fallback {
      margin-top: 30px;
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ControlStock</h1>
    </div>
    <div class="content">
      <div class="greeting">Hola</div>
      <p class="message">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada a <strong>${email}</strong>.
      </p>
      
      <div class="button-container">
        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
      </div>
      
      <div class="link-fallback">
        <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
        <p><a href="${resetUrl}" style="color: #ef4444;">${resetUrl}</a></p>
      </div>
      
      <p class="message" style="margin-top: 20px; font-size: 14px;">
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ControlStock. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
};
export const getTemplateConfirmacionTurno = (params: {
  nombrePaciente: string;
  nombreProfesional: string;
  especialidad: string;
  fecha: string;
  hora: string;
  token: string;
  hostUrl: string;
}) => {
  const confirmationUrl = `${params.hostUrl}/turnos/confirmar?token=${params.token}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu Turno</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 40px 35px;
      color: #334155;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 24px;
      color: #0f172a;
    }
    .details-card {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      border: 1px solid #e2e8f0;
    }
    .detail-item {
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }
    .detail-label {
      font-weight: 600;
      color: #64748b;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .detail-value {
      color: #1e293b;
      font-weight: 500;
    }
    .button-container {
      text-align: center;
      margin: 35px 0;
    }
    .button {
      background-color: #0284c7;
      color: #ffffff !important;
      padding: 16px 32px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px;
      text-align: center;
      font-size: 13px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
    .important-note {
      font-size: 14px;
      color: #ef4444;
      background-color: #fef2f2;
      padding: 15px;
      border-radius: 8px;
      margin-top: 25px;
      border-left: 4px solid #ef4444;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reserva de Turno</h1>
    </div>
    <div class="content">
      <div class="greeting">¡Hola ${params.nombrePaciente}!</div>
      <p>Hemos recibido tu solicitud de turno. Para confirmar tu asistencia, por favor revisa los detalles a continuación y haz clic en el botón de confirmación.</p>
      
      <div class="details-card">
        <div class="detail-item">
          <span class="detail-label">Profesional</span>
          <span class="detail-value">${params.nombreProfesional}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Especialidad</span>
          <span class="detail-value">${params.especialidad}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${params.fecha}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Hora</span>
          <span class="detail-value">${params.hora} hs</span>
        </div>
      </div>
      
      <div class="button-container">
        <a href="${confirmationUrl}" class="button">Confirmar mi Turno</a>
      </div>

      <div class="important-note">
        <strong>Importante:</strong> Tienes 30 minutos para confirmar tu turno. Pasado ese tiempo, el espacio será liberado para otros pacientes.
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ClinicalApp. Todos los derechos reservados.</p>
      <p>Si no realizaste esta solicitud, puedes ignorar este correo.</p>
    </div>
  </div>
</body>
</html>
  `;
};
