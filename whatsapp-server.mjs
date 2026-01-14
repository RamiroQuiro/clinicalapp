import { createClient } from '@libsql/client';
import crypto from 'crypto';
import 'dotenv/config';
import { and, between, eq, notInArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'whatsapp-web.js';
import * as schema from './src/db/schema/index.ts';

const { Client, LocalAuth } = pkg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- UTILIDADES DE CIFRADO ---
// --- MANEJO DE ERRORES GLOBALES ---
process.on('uncaughtException', err => {
  console.error('[Standalone-Error] Error no capturado:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Standalone-Error] Promesa no capturada en:', promise, 'razon:', reason);
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
    // Debug log para ver que llave estamos usando (solo longitud y pedacito para no filtrar)
    console.log(
      `[Crypto-Debug] Intentando descifrar. Longitud llave: ${ENCRYPTION_KEY.length}. Key-Hint: ${ENCRYPTION_KEY.substring(0, 3)}...${ENCRYPTION_KEY.substring(ENCRYPTION_KEY.length - 3)}`
    );

    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // No cifrada o formato viejo
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
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Delay exponencial
        continue;
      }
      throw e; // Otros errores no se reintentan
    }
  }
  throw lastError;
}

// --- LIMPIEZA INICIAL ---
async function initialCleanup() {
  try {
    console.log('[Standalone] Limpiando estados fantasmas en la DB...');
    await withRetry(
      () => db.update(schema.whatsappSessions).set({ status: 'disconnected', qrCode: null }),
      'Cleanup'
    );
    console.log('[Standalone] Limpieza completada.');
  } catch (e) {
    console.error('[Standalone] ERROR CRITICO EN LIMPIEZA:', e.message);
  }
}

initialCleanup();

// --- PROMPT POR DEFECTO ---
const HARDCODED_PROMPT = `Eres un asistente virtual de una clínica médica. Tu objetivo es asistir a los pacientes de forma profesional, amable y concisa.
REGLAS DE ATENCION:
1. Saluda cordialmente.
2. Si el paciente busca un turno, menciónale los profesionales disponibles y sus especialidades.
3. Si el paciente pregunta por disponibilidad, consulta la sección "DISPONIBILIDAD HOY" que te proporcionaré.
4. Indica los horarios libres y pide al paciente que elija uno.
5. Cuando el paciente elija un horario y profesional, indícale que un recepcionista le contactará por este mismo medio para confirmar y agendar formalmente.
6. Si el paciente pide un día que no es hoy, indícale que por el momento solo puedes mostrar disponibilidad para el día de hoy, pero que puede dejar sus datos para que lo llamen.
7. No brindes consejos médicos ni diagnósticos.`;

// --- UTILIDADES DE DISPONIBILIDAD ---
async function getClinicAvailability(centroId) {
  try {
    const hoy = new Date();
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaNombre = dias[hoy.getDay()];

    // 1. Obtener horarios de trabajo para hoy
    const horarios = await withRetry(
      () =>
        db
          .select({
            userMedicoId: schema.horariosTrabajo.userMedicoId,
            horaInicioManana: schema.horariosTrabajo.horaInicioManana,
            horaFinManana: schema.horariosTrabajo.horaFinManana,
            horaInicioTarde: schema.horariosTrabajo.horaInicioTarde,
            horaFinTarde: schema.horariosTrabajo.horaFinTarde,
          })
          .from(schema.horariosTrabajo)
          .innerJoin(
            schema.agendaGeneralCentroMedico,
            eq(
              schema.horariosTrabajo.agendaGeneralCentroMedicoId,
              schema.agendaGeneralCentroMedico.id
            )
          )
          .where(
            and(
              eq(schema.agendaGeneralCentroMedico.centroMedicoId, centroId),
              eq(schema.horariosTrabajo.diaSemana, diaNombre),
              eq(schema.horariosTrabajo.activo, true)
            )
          ),
      'Get Availability Schedules'
    );

    if (horarios.length === 0) return 'No hay profesionales con agenda configurada para hoy.';

    // 2. Obtener turnos ya ocupados para hoy
    const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
    const finHoy = new Date(hoy.setHours(23, 59, 59, 999));

    const ocupados = await withRetry(
      () =>
        db
          .select({
            userMedicoId: schema.turnos.userMedicoId,
            horaAtencion: schema.turnos.horaAtencion,
          })
          .from(schema.turnos)
          .where(
            and(
              eq(schema.turnos.centroMedicoId, centroId),
              between(schema.turnos.fechaTurno, inicioHoy, finHoy),
              notInArray(schema.turnos.estado, ['cancelado', 'ausente'])
            )
          ),
      'Get Today Occupied Slots'
    );

    let info = 'DISPONIBILIDAD PARA HOY:\n';

    for (const h of horarios) {
      const turnosDelMedico = ocupados
        .filter(o => o.userMedicoId === h.userMedicoId)
        .map(o => o.horaAtencion);
      info += `- Médico ID ${h.userMedicoId}: `;
      let slots = [];
      if (h.horaInicioManana && h.horaFinManana)
        slots.push(`${h.horaInicioManana} a ${h.horaFinManana}`);
      if (h.horaInicioTarde && h.horaFinTarde)
        slots.push(`${h.horaInicioTarde} a ${h.horaFinTarde}`);

      info += slots.length > 0 ? slots.join(' y ') : 'Sin horario hoy';
      if (turnosDelMedico.length > 0) {
        info += `. (Ocupados: ${turnosDelMedico.join(', ')})`;
      }
      info += '\n';
    }

    return info;
  } catch (e) {
    console.error('[Availability] Error:', e.message);
    return 'Error consultando disponibilidad.';
  }
}

// --- GESTIÓN DE CLIENTES ---
const clients = new Map();

async function getOrCreateClient(centroMedicoId) {
  const id = String(centroMedicoId);
  if (clients.has(id)) {
    console.log(
      `[Standalone] El cliente ${id} ya existe. Estado actual: ${clients.get(id).pupBrowser ? 'Iniciado' : 'Iniciando...'}`
    );
    return clients.get(id);
  }

  console.log(`[Standalone] Iniciando nuevo cliente para centro: ${id}`);

  const wclient = new Client({
    authStrategy: new LocalAuth({
      clientId: id,
      dataPath: path.join(__dirname, '.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--js-flags="--max-old-space-size=256"', // Limitar RAM por pestaña
      ],
    },
  });

  wclient.on('loading_screen', (percent, message) => {
    console.log(`[Standalone] Cargando (${id}): ${percent}% - ${message}`);
  });

  wclient.on('qr', async qr => {
    console.log(`[Standalone] QR generado para centro: ${id}`);
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
      console.error('[Standalone] Error actualizando QR en DB:', e.message);
    }
  });

  wclient.on('ready', async () => {
    console.log(`[Standalone] Cliente listo para centro: ${id}`);
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
        'Update Ready'
      );
    } catch (e) {
      console.error('[Standalone] Error actualizando READY en DB:', e.message);
    }
  });

  wclient.on('disconnected', reason => {
    console.log(`[Standalone] Cliente desconectado para centro ${id}:`, reason);
    clients.delete(id);
  });

  wclient.on('message', async message => {
    // IGNORAR mensajes que no sean de chats individuales
    if (
      message.from.includes('@newsletter') ||
      message.from.includes('@broadcast') ||
      message.from.includes('@g.us') ||
      message.type === 'status_v3'
    ) {
      return;
    }

    console.log(`[Standalone] Mensaje de ${message.from} para centro ${id}`);
    try {
      const contact = await message.getContact();

      // 1. Guardar conversacion/mensaje
      let conversacion = await withRetry(
        () =>
          db
            .select()
            .from(schema.whatsappConversaciones)
            .where(
              and(
                eq(schema.whatsappConversaciones.centroMedicoId, id),
                eq(schema.whatsappConversaciones.numeroTelefono, message.from)
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
              numeroTelefono: message.from,
              nombrePaciente: contact.pushname || 'Paciente',
              ultimoMensaje: message.body.substring(0, 200),
              updated_at: new Date(),
            }),
          'Insert Conversation'
        );
        // Re-fetch the conversation to get the newly inserted one for subsequent operations
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
                ultimoMensaje: message.body.substring(0, 200),
                updated_at: new Date(),
              })
              .where(eq(schema.whatsappConversaciones.id, convId)),
          'Update Conversation'
        );
      }

      // 2. Guardar mensaje
      await withRetry(
        () =>
          db.insert(schema.whatsappMensajes).values({
            id: crypto.randomUUID(),
            conversacionId: conversacion[0]?.id || convId, // Use convId if conversacion was just created
            direccion: 'incoming',
            contenido: message.body,
            messageType: message.type,
            timestamp: new Date(message.timestamp * 1000),
          }),
        'Insert Message'
      );
      // 3. Notificar a Astro para que emita el SSE (para el Dashboard)
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
            from: message.from,
            body: message.body,
            nombre: contact.pushname || 'Paciente',
          },
        }),
      }).catch(() => {}); // Si Astro esta apagado, no pasa nada

      // 4. Intentar respuesta automatica con IA si esta activa
      await tryAIResponse(id, message, wclient);
    } catch (e) {
      console.error('[Standalone] Error guardando mensaje:', e.message);
    }
  });

  async function tryAIResponse(centroId, message, wclient) {
    try {
      // 1. Verificar si la IA está activa para este centro
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

      console.log(`[AI] Procesando respuesta para centro ${centroId}...`);

      // 2. Obtener credenciales activas
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
        console.warn(`[AI] No hay credenciales activas para el centro ${centroId}`);
        return;
      }

      const config = credentials[0];
      console.log(`[AI] Config encontrada. Proveedor: ${config.provider}, Modelo: ${config.model}`);
      const apiKey = decrypt(config.apiKeyEncrypted);

      // 3. Obtener profesionales para darle contexto a la IA (filtrado por centro)
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

      console.log(`[AI] Profesionales encontrados: ${profesionales.length}`);
      const listaProfesionales = profesionales
        .map(
          p =>
            `- ${p.nombre} ${p.apellido} (ID: ${p.id}, Especialidad: ${p.especialidad || 'General'})`
        )
        .join('\n');

      // 4. Obtener disponibilidad de hoy
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
            `[AI-Gemini] Error API: ${data.error.message || JSON.stringify(data.error)}`
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
            `[AI-OpenAI] Error API: ${data.error.message || JSON.stringify(data.error)}`
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
          console.error(`[AI-Groq] Error API: ${data.error.message || JSON.stringify(data.error)}`);
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
            `[AI-DeepSeek] Error API: ${data.error.message || JSON.stringify(data.error)}`
          );
        aiResponseText = data.choices?.[0]?.message?.content;
      }

      if (aiResponseText) {
        console.log(
          `[AI] Enviando respuesta a ${message.from}: ${aiResponseText.substring(0, 50)}...`
        );
        await wclient.sendMessage(message.from, aiResponseText);
        console.log(`[AI] Respuesta enviada con éxito.`);
      } else {
        console.warn(`[AI] No se generó texto de respuesta.`);
      }
    } catch (err) {
      console.error('[AI] Error generado respuesta:', err.message);
    }
  }

  wclient.on('message_create', async message => {
    if (!message.fromMe) return; // Solo los que enviamos nosotros

    console.log(`[Standalone] Mensaje enviado (${id}) a ${message.to}`);
    try {
      let conversacion = await db
        .select()
        .from(schema.whatsappConversaciones)
        .where(
          and(
            eq(schema.whatsappConversaciones.centroMedicoId, id),
            eq(schema.whatsappConversaciones.numeroTelefono, message.to)
          )
        )
        .limit(1);

      if (conversacion.length > 0) {
        const convId = conversacion[0].id;
        await db.insert(schema.whatsappMensajes).values({
          id: crypto.randomUUID(),
          conversacionId: convId,
          direccion: 'outgoing',
          contenido: message.body,
          messageType: message.type,
          timestamp: new Date(message.timestamp * 1000),
        });

        await db
          .update(schema.whatsappConversaciones)
          .set({ ultimoMensaje: message.body.substring(0, 200), updated_at: new Date() })
          .where(eq(schema.whatsappConversaciones.id, convId));
      }
    } catch (e) {
      console.error('[Standalone] Error guardando mensaje saliente:', e.message);
    }
  });

  wclient.on('disconnected', async reason => {
    console.log(`[Standalone] Cliente desconectado centro ${id}: ${reason}`);
    try {
      await db
        .update(schema.whatsappSessions)
        .set({ status: 'disconnected', qrCode: null, updated_at: new Date() })
        .where(eq(schema.whatsappSessions.centroMedicoId, id));

      clients.delete(id);
      await wclient.destroy();
    } catch (e) {
      console.error('[Standalone] Error en desconexion:', e.message);
    }
  });

  wclient.on('auth_failure', msg => {
    console.error(`[Standalone] FALLO DE AUTENTICACION (${id}):`, msg);
  });

  wclient.on('authenticated', () => {
    console.log(`[Standalone] Autenticado (${id})`);
  });

  // Inicializar sin esperar (background)
  console.log(`[Standalone] Llamando a initialize() para centro: ${id}...`);
  wclient.initialize().catch(err => {
    console.error(`[Standalone] ERROR CRITICO INICIALIZANDO (${id}):`, err.message);
    clients.delete(id);
  });

  clients.set(id, wclient);
  return wclient;
}

// --- SERVIDOR HTTP SIMPLE ---
const server = http.createServer(async (req, res) => {
  // Enable CORS
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

        await getOrCreateClient(centroMedicoId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', msg: 'Session initialization triggered' }));
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
          console.log(`[Standalone] Desconectando cliente centro: ${id}`);
          try {
            await client.logout();
            await client.destroy();
          } catch (e) {
            console.warn(`[Standalone] Error al cerrar sesion (ignorado): ${e.message}`);
          }
          clients.delete(id);
        }

        // Siempre actualizar DB a disconnected
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

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `[WhatsApp-Server] Corriendo en http://localhost:${PORT}`);
  console.log(`[WhatsApp-Server] Usa este servidor para evitar bucles con Astro.`);
});
