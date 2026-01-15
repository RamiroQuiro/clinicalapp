import { createClient } from '@libsql/client';
import {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
} from 'baileys';
import crypto from 'crypto';
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './src/db/schema/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- ALMACÉN EN MEMORIA PARA CONFIRMACIONES ---
const pendingConfirmations = new Map();

// --- UTILIDADES DE CIFRADO ---
process.on('uncaughtException', err => {
  console.error('[Baileys-Smart] Error no capturado:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Baileys-Smart] Promesa no capturada en:', promise, 'razon:', reason);
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32';
if (!process.env.ENCRYPTION_KEY) {
  console.warn(
    '[Crypto] ADVERTENCIA: No se detecto ENCRYPTION_KEY en .env. Usando clave por defecto.'
  );
} else {
  console.log('[Crypto] Clave de cifrado cargada correctamente.');
}
const ALGORITHM = 'aes-256-cbc';

function getKey() {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  return Buffer.from(key);
}

function decrypt(encryptedText) {
  try {
    const key = getKey();
    console.log(
      `[Crypto-Debug] Intentando descifrar. Longitud llave: ${ENCRYPTION_KEY.length}. Key-Hint: ${ENCRYPTION_KEY.substring(0, 3)}...${ENCRYPTION_KEY.substring(ENCRYPTION_KEY.length - 3)}`
    );

    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText;
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('[Crypto] Error descifrando:', e.message);
    return null;
  }
}

// --- CONFIGURACION DB ---
const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});
const db = drizzle(client);

// --- WRAPPER PARA REINTENTOS DE DB ---
async function withRetry(operation, description = 'Operation', maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (e) {
      lastError = e;
      if (e.message.includes('EAI_AGAIN') || e.message.includes('fetch failed')) {
        console.warn(
          `[DB] Reintentando ${description} (${i + 1}/${maxRetries}) por error de red...`
        );
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// --- LIMPIEZA INICIAL ---
async function initialCleanup() {
  try {
    console.log('[Baileys-Smart] Limpiando estados fantasmas en la DB...');
    await withRetry(
      () => db.update(schema.whatsappSessions).set({ status: 'disconnected', qrCode: null }),
      'Cleanup'
    );
    console.log('[Baileys-Smart] Limpieza completada.');
  } catch (e) {
    console.error('[Baileys-Smart] ERROR CRITICO EN LIMPIEZA:', e.message);
  }
}

initialCleanup();

// --- PROMPT POR DEFECTO CON INSTRUCCIONES ESPECIALES ---
const HARDCODED_PROMPT = `Eres un asistente virtual de una clínica médica. Tu objetivo es asistir a los pacientes de forma profesional, amable y concisa.
REGLAS DE ATENCION:
1. Saluda cordialmente.
2. Si el paciente busca un turno, menciónale los profesionales disponibles y sus especialidades.
3. Si el paciente pregunta por disponibilidad, consulta la sección "DISPONIBILIDAD HOY" que te proporcionaré.
4. Ofrece un horario específico y disponible. No des rangos de horarios.
5. **REGLA CRÍTICA**: Cuando hayas identificado claramente la intención de agendar un turno y hayas propuesto un profesional y una fecha/hora específicas, DEBES terminar tu respuesta con una etiqueta especial. La etiqueta debe tener el siguiente formato EXACTO:
   [CONFIRMACION_TURNO_REQUERIDA]
   Profesional ID: {ID del profesional}
   Fecha y Hora: {Fecha y hora en formato YYYY-MM-DD HH:mm}
   Nombre Paciente: {Nombre del paciente si lo mencionó}
   [/CONFIRMACION_TURNO_REQUERIDA]
   Por ejemplo: "Perfecto, tenemos un turno disponible con el Dr. Juan Pérez (ID: user_xxxx) para hoy a las 15:30. [CONFIRMACION_TURNO_REQUERIDA]Profesional ID: user_xxxx\nFecha y Hora: 2025-11-13 15:30\nNombre Paciente: Ramiro[/CONFIRMACION_TURNO_REQUERIDA]"
6. Si el paciente pide un día que no es hoy, indícale que por el momento solo puedes mostrar disponibilidad para el día de hoy, pero que puede dejar sus datos para que lo llamen.
7. No brindes consejos médicos ni diagnósticos.`;

// --- UTILIDADES PARA EXTRAER DETALLES DE TURNO ---
function extractTurnoDetails(text) {
  const match = text.match(
    /\[CONFIRMACION_TURNO_REQUERIDA\]\s*Profesional ID:\s*(.*?)\s*Fecha y Hora:\s*(.*?)\s*Nombre Paciente:\s*(.*?)\s*\[\/CONFIRMACION_TURNO_REQUERIDA\]/
  );

  if (!match) return null;

  return {
    profesionalId: match[1].trim(),
    fechaHora: match[2].trim(),
    nombrePaciente: match[3].trim(),
    responseText: text.replace(match[0], '').trim(), // Devuelve el texto sin la etiqueta
  };
}

// --- UTILIDADES PARA EXTRAER DATOS DE PACIENTE ---
function extractPatientData(text) {
  const datos = {
    dni: null,
    nombre: null,
    obraSocial: null,
    telefono: null
  };

  // Extraer DNI
  const dniMatch = text.match(/(?:dni|documento|número de documento|n° documento)[:\s]*[\s#]*([0-9]{7,9})/i);
  if (dniMatch) datos.dni = dniMatch[1].trim();

  // Extraer nombre completo
  const nombreMatch = text.match(/(?:nombre|mi nombre es|soy|llamo|me llamo)[:\s]*\s*([a-zA-ZáéíóúñÁÉÍÓÚÑ\s]{2,50})/i);
  if (nombreMatch) datos.nombre = nombreMatch[1].trim();

  // Extraer obra social
  const obraMatch = text.match(/(?:obra social|obra|seguro|cobertura)[:\s]*\s*([a-zA-Z0-9\s]{2,50})/i);
  if (obraMatch) datos.obraSocial = obraMatch[1].trim();

  return datos;
}

// --- VERIFICAR SI HAY DATOS SUFICIENTES ---
function hasRequiredPatientData(datos) {
  return datos.dni && datos.nombre && datos.obraSocial;
}

// --- UTILIDADES DE DISPONIBILIDAD (USANDO MISMAS APIS QUE WEB) ---
async function getClinicAvailability(centroId) {
  try {
    const hoy = new Date();
    const fechaStr = hoy.toISOString().split('T')[0]; // YYYY-MM-DD

    // Obtener profesionales usando la misma API que la web
    const profesionalesResponse = await fetch(
      `http://localhost:4322/api/public/profesionales?centroId=${centroId}`
    );
    if (!profesionalesResponse.ok) {
      throw new Error('Error obteniendo profesionales');
    }
    const profesionalesData = await profesionalesResponse.json();
    const profesionales = profesionalesData.data || [];

    if (profesionales.length === 0) {
      return 'No hay profesionales disponibles para reserva online en este momento.';
    }

    let info = 'DISPONIBILIDAD PARA HOY:\n\n';

    // Para cada profesional, obtener su disponibilidad
    for (const profesional of profesionales) {
      try {
        const disponibilidadResponse = await fetch(
          `http://localhost:4322/api/public/disponibilidad?centroId=${centroId}&profesionalId=${profesional.id}&fecha=${fechaStr}`
        );

        if (disponibilidadResponse.ok) {
          const disponibilidadData = await disponibilidadResponse.json();
          const slots = disponibilidadData.data || [];

          info += `- ${profesional.abreviatura} ${profesional.nombre} ${profesional.apellido} (ID: ${profesional.id})\n`;
          info += `   Especialidad: ${profesional.especialidad || 'Médico General'}\n`;

          if (slots.length > 0) {
            // Convertir slots ISO a formato de hora legible
            const horariosLegibles = slots.slice(0, 5).map(slotISO => {
              const date = new Date(slotISO);
              return date.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              });
            });

            info += `  ✅ Disponible: ${horariosLegibles.join(', ')}`;
            if (slots.length > 5) {
              info += ` y ${slots.length - 5} más...`;
            }
            info += '\n';
          } else {
            info += `  ❌ Sin turnos disponibles hoy\n`;
          }
          info += '\n';
        }
      } catch (error) {
        console.error(
          `[Availability] Error obteniendo disponibilidad para ${profesional.id}:`,
          error.message
        );
        info += `- ${profesional.nombre} ${profesional.apellido}: Error consultando disponibilidad\n\n`;
      }
    }

    return info;
  } catch (e) {
    console.error('[Availability] Error:', e.message);
    return 'Error consultando disponibilidad. Por favor, intente más tarde.';
  }
}

// --- GESTIÓN DE CLIENTES BAILEYS ---
const clients = new Map();

async function getOrCreateBaileysClient(centroMedicoId) {
  const id = String(centroMedicoId);
  if (clients.has(id)) {
    console.log(`[Baileys-Smart] El cliente ${id} ya existe. Estado: ${clients.get(id).state}`);
    return clients.get(id);
  }

  console.log(`[Baileys-Smart] Iniciando nuevo cliente Baileys para centro: ${id}`);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(__dirname, `.baileys_auth_${id}`)
    );

    const { version } = await fetchLatestBaileysVersion();
    console.log(`[Baileys-Smart] Usando WhatsApp Web v${version}`);

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      retryRequestDelayMs: 3000,
      keepAliveIntervalMs: 30000,
    });

    // Manejo de eventos
    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(`[Baileys-Smart] QR generado para centro: ${id}`);
        try {
          await withRetry(
            () =>
              db
                .update(schema.whatsappSessions)
                .set({ qrCode: qr, status: 'qr_pending', updated_at: new Date() })
                .where(eq(schema.whatsappSessions.centroMedicoId, id)),
            'Update QR'
          );
        } catch (e) {
          console.error('[Baileys-Smart] Error actualizando QR en DB:', e.message);
        }
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          `[Baileys-Smart] Conexión cerrada para centro ${id}. Reconnect: ${shouldReconnect}`
        );

        if (shouldReconnect) {
          clients.delete(id);
          setTimeout(() => getOrCreateBaileysClient(centroMedicoId), 5000);
        } else {
          await withRetry(
            () =>
              db
                .update(schema.whatsappSessions)
                .set({ status: 'disconnected', qrCode: null, updated_at: new Date() })
                .where(eq(schema.whatsappSessions.centroMedicoId, id)),
            'Update Disconnected'
          );
        }
      }

      if (connection === 'open') {
        console.log(`[Baileys-Smart] Cliente conectado para centro: ${id}`);
        try {
          await withRetry(
            () =>
              db
                .update(schema.whatsappSessions)
                .set({
                  status: 'connected',
                  qrCode: null,
                  fechaUltimaConexion: new Date(),
                  updated_at: new Date(),
                })
                .where(eq(schema.whatsappSessions.centroMedicoId, id)),
            'Update Connected'
          );
        } catch (e) {
          console.error('[Baileys-Smart] Error actualizando connected en DB:', e.message);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      const message = messages[0];
      if (!message.message || message.key.fromMe) return;

      // Ignorar SOLO grupos reales y broadcasts
      // @lid y @newsletter pueden ser contactos individuales válidos
      console.log(`[Baileys-Smart] 🔍 Analizando JID: ${message.key.remoteJid}`);
      console.log(`[Baileys-Smart] 👤 Participant: ${message.key.participant || 'null'}`);

      if (
        message.key.remoteJid.includes('@g.us') ||  // Grupos (siempre bloquear)
        message.key.remoteJid.includes('@broadcast') ||  // Broadcasts (siempre bloquear)
        (message.key.remoteJid.includes('@newsletter') && message.key.participant) || // Newsletter SOLO si tiene participant = grupo
        (message.key.remoteJid.includes('@lid') && message.key.participant) // Lista SOLO si tiene participant = grupo
      ) {
        console.log(
          `[Baileys-Smart] ❌ BLOQUEADO - Grupo/Broadcast real: ${message.key.remoteJid}`
        );
        return;
      }

      // Ignorar mensajes de status
      if (message.message?.statusMessage) {
        console.log(
          `[Baileys-Smart] ❌ BLOQUEADO - Status: ${message.key.remoteJid}`
        );
        return;
      }

      console.log(`[Baileys-Smart] ✅ MENSAJE RECIBIDO: ${message.key.remoteJid}`);
      try {
        const msgContent =
          message.message.conversation || message.message.extendedTextMessage?.text || '';

        console.log(`[Baileys-Smart] 📝 Contenido: "${msgContent}"`);
        console.log(`[Baileys-Smart] 🏷️ Tipo: ${Object.keys(message.message || {})}`);
        console.log(`[Baileys-Smart] 👤 PushName: ${message.pushName || 'sin nombre'}`);
        console.log(`[Baileys-Smart] 📏 Longitud: ${msgContent?.length || 0}`);

        // Ignorar mensajes vacíos o muy cortos
        if (!msgContent || msgContent.trim().length < 2) {
          console.log(
            `[Baileys-Smart] ❌ BLOQUEADO - Vacío/Corto: "${msgContent}" (longitud: ${msgContent?.length || 0})`
          );
          return;
        }

        // Anti-loop: Ignorar si el mensaje parece ser una respuesta automática
        const isAutoResponse =
          msgContent.includes('¡Gracias! Su solicitud ha sido registrada') ||
          msgContent.includes('Hemos notado que ya tiene una solicitud') ||
          msgContent.includes("Responda 'SI' para confirmar") ||
          msgContent.includes('Con gusto te asisto') ||
          msgContent.includes('Hola! Con gusto te asisto') ||
          msgContent.includes('Su solicitud ha sido registrada');

        if (isAutoResponse) {
          console.log(
            `[Baileys-Smart] ❌ BLOQUEADO - Auto Response: "${msgContent.substring(0, 50)}..."`
          );
          return;
        }

        // MANEJO DE CONFIRMACIÓN DE TURNO
        if (
          pendingConfirmations.has(message.key.remoteJid) &&
          msgContent.toLowerCase().trim() === 'si'
        ) {
          const details = pendingConfirmations.get(message.key.remoteJid);
          console.log(`[Baileys-Smart] Usuario confirmando turno. Detalles:`, details);

          // Extraer datos del paciente de mensajes anteriores
          const conversacion = await withRetry(
            () =>
              db
                .select()
                .from(schema.whatsappMensajes)
                .where(
                  and(
                    eq(schema.whatsappMensajes.conversacionId, details.conversacionId),
                    eq(schema.whatsappMensajes.direccion, 'incoming')
                  )
                )
                .orderBy(schema.whatsappMensajes.timestamp)
                .limit(10),
            'Get Conversation History'
          );

          let datosPaciente = {
            dni: null,
            nombre: details.nombrePaciente || message.pushName,
            obraSocial: null,
            telefono: message.key.remoteJid
          };

          // Buscar datos en los mensajes anteriores
          for (const msg of conversacion.reverse()) {
            const datosExtraidos = extractPatientData(msg.contenido);
            if (datosExtraidos.dni) datosPaciente.dni = datosExtraidos.dni;
            if (datosExtraidos.nombre) datosPaciente.nombre = datosExtraidos.nombre;
            if (datosExtraidos.obraSocial) datosPaciente.obraSocial = datosExtraidos.obraSocial;
          }

          console.log(`[Baileys-Smart] Datos extraídos:`, datosPaciente);

          // Verificar si tenemos todos los datos necesarios
          if (!hasRequiredPatientData(datosPaciente)) {
            console.log(`[Baileys-Smart] Faltan datos del paciente`);

            const faltantes = [];
            if (!datosPaciente.dni) faltantes.push('DNI');
            if (!datosPaciente.nombre) faltantes.push('nombre completo');
            if (!datosPaciente.obraSocial) faltantes.push('obra social');

            await safeSendMessage(
              sock,
              message.key.remoteJid,
              `Para confirmar su turno, necesito algunos datos adicionales:\n\n❌ *Faltante:* ${faltantes.join(', ')}\n\nPor favor, envíe:\n• Su DNI (7-8 dígitos)\n• Su nombre completo\n• Su obra social\n\nEjemplo: "DNI: 12345678, Nombre: Juan Pérez, Obra Social: Osde"`
            );
            return;
          }

          // Si tenemos todos los datos, crear el turno
          const newTurno = {
            id: crypto.randomUUID(),
            pacienteId: null, // Se creará paciente temporal
            otorgaUserId: null,
            userMedicoId: details.profesionalId,
            fechaTurno: new Date(details.fechaHora),
            duracion: 30, // Duración por defecto
            atencionId: null,
            centroMedicoId: id,
            tipoDeTurno: 'programado',
            tipoConsulta: 'whatsapp',
            motivoConsulta: 'Reserva por WhatsApp',
            motivoInicial: 'Solicitud de turno',
            datosPacienteTemporal: JSON.stringify(datosPaciente), // Guardar datos en JSON
            tokenConfirmacion: crypto.randomUUID(),
            fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            origen: 'publico',
            estado: 'pendiente_validacion', // Esperando validación
          };

          await withRetry(
            () => db.insert(schema.turnos).values(newTurno),
            'Insertar Turno'
          );

          pendingConfirmations.delete(message.key.remoteJid);

          const replyMsg = `✅ *TURNO RESERVADO*\n\n📅 *Fecha y Hora:* ${new Date(details.fechaHora).toLocaleString('es-AR')}\n👨‍⚕️ *Profesional:* ${details.profesionalId}\n👤 *Paciente:* ${datosPaciente.nombre}\n🆔 *DNI:* ${datosPaciente.dni}\n🏥 *Obra Social:* ${datosPaciente.obraSocial}\n\nSu turno queda pendiente de confirmación. Nos comunicaremos con usted para validar los datos.`;

          await safeSendMessage(sock, message.key.remoteJid, replyMsg);

          // Notificar al frontend via SSE
          fetch(`http://localhost:4322/api/whatsapp/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:4322' },
            body: JSON.stringify({
              tipo: 'nuevo_turno_whatsapp',
              centroMedicoId: id,
              payload: newTurno,
            }),
          }).catch(() => { });

          console.log(`[Baileys-Smart] Turno creado para ${message.key.remoteJid} y notificado.`);
          return;
        }

        // Guardar conversación/mensaje
        let conversacion = await withRetry(
          () =>
            db
              .select()
              .from(schema.whatsappConversaciones)
              .where(
                and(
                  eq(schema.whatsappConversaciones.centroMedicoId, id),
                  eq(schema.whatsappConversaciones.numeroTelefono, message.key.remoteJid)
                )
              )
              .limit(1),
          'Get Conversation'
        );

        let convId;
        if (conversacion.length === 0) {
          convId = crypto.randomUUID();
          await withRetry(
            () =>
              db.insert(schema.whatsappConversaciones).values({
                id: convId,
                centroMedicoId: id,
                numeroTelefono: message.key.remoteJid,
                nombrePaciente: message.pushName || 'Paciente',
                ultimoMensaje: msgContent.substring(0, 200),
                updated_at: new Date(),
              }),
            'Insert Conversation'
          );

          conversacion = await withRetry(
            () =>
              db
                .select()
                .from(schema.whatsappConversaciones)
                .where(eq(schema.whatsappConversaciones.id, convId))
                .limit(1),
            'Get New Conversation'
          );
        } else {
          convId = conversacion[0].id;
          await withRetry(
            () =>
              db
                .update(schema.whatsappConversaciones)
                .set({
                  ultimoMensaje: msgContent.substring(0, 200),
                  updated_at: new Date(),
                })
                .where(eq(schema.whatsappConversaciones.id, convId)),
            'Update Conversation'
          );
        }

        // Guardar mensaje
        await withRetry(
          () =>
            db.insert(schema.whatsappMensajes).values({
              id: crypto.randomUUID(),
              conversacionId: conversacion[0]?.id || convId,
              direccion: 'incoming',
              contenido: msgContent,
              messageType: 'conversation',
              timestamp: new Date(message.messageTimestamp * 1000),
            }),
          'Insert Message'
        );

        // (ANTI-SPAM) Verificar si ya hay una solicitud pendiente
        const existingRequest = await withRetry(
          () =>
            db
              .select()
              .from(schema.whatsappSolicitudes)
              .where(
                and(
                  eq(schema.whatsappSolicitudes.numeroTelefono, message.key.remoteJid),
                  eq(schema.whatsappSolicitudes.estado, 'pendiente')
                )
              )
              .limit(1),
          'Check Existing Request'
        );

        if (existingRequest.length > 0) {
          console.log(
            `[Baileys-Smart] ${message.key.remoteJid} ya tiene ${existingRequest.length} solicitudes pendientes. Solicitud ID: ${existingRequest[0].id}`
          );

          await safeSendMessage(
            sock,
            message.key.remoteJid,
            'Hemos notado que ya tiene una solicitud de turno pendiente de aprobación. Nuestro equipo de recepción se pondrá en contacto con usted a la brevedad.'
          );

          return;
        }

        // Notificar a Astro para que emita el SSE
        fetch(`http://localhost:4322/api/whatsapp/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:4322',
          },
          body: JSON.stringify({
            tipo: 'nuevo_mensaje',
            centroMedicoId: id,
            payload: {
              from: message.key.remoteJid,
              body: msgContent,
              nombre: message.pushName || 'Paciente',
            },
          }),
        }).catch(() => { });

        // Intentar respuesta automática con IA
        await tryAIResponse(id, { from: message.key.remoteJid, body: msgContent }, sock);
      } catch (e) {
        console.error('[Baileys-Smart] Error procesando mensaje:', e.message);
      }
    });

    clients.set(id, sock);
    return sock;
  } catch (error) {
    console.error(`[Baileys-Smart] Error creando cliente para centro ${id}:`, error.message);
    throw error;
  }
}

// --- SAFE SEND WRAPPER PARA BAILEYS (SIMPLIFICADO) ---
async function safeSendMessage(sock, number, message, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Baileys-Smart-SafeSend] Intento ${attempt}: Enviando a ${number}`);

      if (sock.user && sock.ws) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));

        const result = await sock.sendMessage(number, { text: message });
        console.log(`[Baileys-Smart-SafeSend] ✅ Enviado exitosamente (intento ${attempt})`);
        return result;
      } else {
        throw new Error('Socket no está completamente conectado');
      }
    } catch (error) {
      console.error(`[Baileys-Smart-SafeSend] ❌ Intento ${attempt} fallado: ${error.message}`);

      if (attempt === maxRetries) {
        console.error(`[Baileys-Smart-SafeSend] 🚫 Todos los intentos fallaron para ${number}`);
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt * 2));
    }
  }
}

// --- IA RESPONSE CON DETECCIÓN DE TURNO ---
async function tryAIResponse(centroId, message, sock) {
  try {
    const session = await withRetry(
      () =>
        db
          .select()
          .from(schema.whatsappSessions)
          .where(eq(schema.whatsappSessions.centroMedicoId, centroId))
          .limit(1),
      'Get Session Context'
    );
    if (session.length === 0 || !session[0].aiActive) return;

    console.log(`[Baileys-Smart-AI] Procesando respuesta para centro ${centroId}...`);

    const credentials = await withRetry(
      () =>
        db
          .select()
          .from(schema.aiCredentials)
          .where(
            and(
              eq(schema.aiCredentials.centroMedicoId, centroId),
              eq(schema.aiCredentials.isActive, true)
            )
          )
          .limit(1),
      'Get AI Credentials'
    );

    if (credentials.length === 0) {
      console.warn(`[Baileys-Smart-AI] No hay credenciales activas para el centro ${centroId}`);
      return;
    }

    const config = credentials[0];
    console.log(`[Baileys-Smart-AI] Config: ${config.provider}, Modelo: ${config.model}`);
    const apiKey = decrypt(config.apiKeyEncrypted);

    const profesionales = await withRetry(
      () =>
        db
          .select({
            id: schema.users.id,
            nombre: schema.users.nombre,
            apellido: schema.users.apellido,
            especialidad: schema.users.especialidad,
          })
          .from(schema.users)
          .innerJoin(
            schema.usersCentrosMedicos,
            eq(schema.users.id, schema.usersCentrosMedicos.userId)
          )
          .where(
            and(
              eq(schema.usersCentrosMedicos.centroMedicoId, centroId),
              eq(schema.usersCentrosMedicos.rolEnCentro, 'profesional'),
              eq(schema.usersCentrosMedicos.activo, true)
            )
          ),
      'Get Professionals'
    );

    const listaProfesionales = profesionales
      .map(
        p =>
          `- ${p.nombre} ${p.apellido} (ID: ${p.id}, Especialidad: ${p.especialidad || 'General'})`
      )
      .join('\n');

    const disponibilidadHoy = await getClinicAvailability(centroId);

    const systemPrompt =
      HARDCODED_PROMPT +
      `\n\nPROFESIONALES DISPONIBLES EN LA CLINICA:\n${listaProfesionales}` +
      `\n\n${disponibilidadHoy}`;

    let aiResponseText = '';

    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario dice: ${message.body}` }] }],
        }),
      });
      const data = await resp.json();
      if (data.error) {
        console.error(
          `[Baileys-Smart-AI-Gemini] Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      }
      aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (config.provider === 'openai') {
      const url = 'https://api.openai.com/v1/chat/completions';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message.body },
          ],
        }),
      });
      const data = await resp.json();
      if (data.error) {
        console.error(
          `[Baileys-Smart-AI-OpenAI] Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      }
      aiResponseText = data.choices?.[0]?.message?.content;
    } else if (config.provider === 'groq') {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message.body },
          ],
        }),
      });
      const data = await resp.json();
      if (data.error)
        console.error(
          `[Baileys-Smart-AI-Groq] Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      aiResponseText = data.choices?.[0]?.message?.content;
    } else if (config.provider === 'deepseek') {
      const url = 'https://api.deepseek.com/chat/completions';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message.body },
          ],
        }),
      });
      const data = await resp.json();
      if (data.error)
        console.error(
          `[Baileys-Smart-AI-DeepSeek] Error: ${data.error.message || JSON.stringify(data.error)}`
        );
      aiResponseText = data.choices?.[0]?.message?.content;
    }

    if (aiResponseText) {
      const turnoDetails = extractTurnoDetails(aiResponseText);

      if (turnoDetails) {
        console.log(`[Baileys-Smart-Flow] IA detectó una solicitud de turno. Pidiendo confirmación a ${message.from}`);

        // Guardar en memoria para esperar el "SI"
        pendingConfirmations.set(message.from, {
          ...turnoDetails,
          mensajeOriginal: message.body,
          conversacionId: convId, // Guardar ID de conversación
        });

        // Enviar el mensaje de la IA + la pregunta de confirmación
        await safeSendMessage(sock, message.from, turnoDetails.responseText);
        await safeSendMessage(
          sock,
          message.from,
          "Responda 'SI' para confirmar su solicitud. De lo contrario, puede ignorar este mensaje."
        );
      } else {
        console.log(
          `[Baileys-Smart-AI] Enviando respuesta estándar a ${message.from}: ${aiResponseText.substring(0, 50)}...`
        );
        await safeSendMessage(sock, message.from, aiResponseText);
        console.log(`[Baileys-Smart-AI] Respuesta estándar enviada con éxito.`);
      }
    } else {
      console.warn(`[Baileys-Smart-AI] No se generó texto de respuesta.`);
    }
  } catch (err) {
    console.error('[Baileys-Smart-AI] Error:', err.message);
  }
}

// --- SERVIDOR HTTP ---
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/init' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { centroMedicoId } = JSON.parse(body);
        if (!centroMedicoId) throw new Error('centroMedicoId requerido');

        await getOrCreateBaileysClient(centroMedicoId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'success',
            msg: 'Baileys Smart session initialization triggered',
          })
        );
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', msg: e.message }));
      }
    });
  } else if (url.pathname === '/disconnect' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { centroMedicoId } = JSON.parse(body);
        const id = String(centroMedicoId);
        const client = clients.get(id);

        if (client) {
          console.log(`[Baileys-Smart] Desconectando cliente centro: ${id}`);
          try {
            client.ws.close();
          } catch (e) {
            console.warn(`[Baileys-Smart] Error cerrando conexión: ${e.message}`);
          }
          clients.delete(id);
        }

        await db
          .update(schema.whatsappSessions)
          .set({ status: 'disconnected', qrCode: null, updated_at: new Date() })
          .where(eq(schema.whatsappSessions.centroMedicoId, id));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', msg: 'Disconnected successfully' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', msg: e.message }));
      }
    });
  } else if (url.pathname === '/status' && req.method === 'GET') {
    const centroMedicoId = url.searchParams.get('centroMedicoId');
    const client = clients.get(centroMedicoId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'success',
        connected: !!client,
        clientStatus: client ? 'active' : 'inactive',
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 5003; // Puerto diferente para el smart
server.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `[Baileys-Smart-Server] Corriendo en http://localhost:${PORT}`);
  console.log(
    `[Baileys-Smart-Server] Usando Baileys con flujo inteligente de confirmación de turnos`
  );
});
