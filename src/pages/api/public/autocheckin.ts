import db from '@/db';
import { pacientes, turnos, users } from '@/db/schema';
import { portalSessions } from '@/db/schema/portalSessions';
import { emitEvent } from '@/lib/sse/sse';
import { logger } from '@/utils/logger';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { and, eq, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { dni, centroMedicoId, turnoId } = await request.json();

    // Log para depurar qué llega exactamente
    // Log para depurar qué llega exactamente
    logger.log(`[API /autocheckin] Datos recibidos:`, {
      dni,
      centroMedicoId,
      tipoCentroId: typeof centroMedicoId,
      turnoId
    });

    // Limpiar centroId si viene con llaves o como objeto
    let centroIdLimpio = centroMedicoId;
    if (typeof centroMedicoId === 'string') {
      // Eliminar llaves si vienen como "{1}"
      centroIdLimpio = centroMedicoId.replace(/[{}]/g, '');
    } else if (typeof centroMedicoId === 'object' && centroMedicoId !== null) {
      // Si es un objeto, intentar extraer el valor
      centroIdLimpio = Object.values(centroMedicoId)[0];
    }

    logger.log(`[API /autocheckin] CentroId limpio: ${centroIdLimpio} (tipo: ${typeof centroIdLimpio})`);

    if (!dni || !centroIdLimpio) {
      return new Response(JSON.stringify({ message: 'DNI y centro médico son obligatorios.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- LÓGICA DE BASE DE DATOS REAL ---
    logger.log(`[API /autocheckin] Buscando turno para DNI: ${dni} (como número: ${Number(dni)}) en centro: ${centroIdLimpio}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    logger.log(`[API /autocheckin] Rango de fechas: ${today.toISOString()} - ${tomorrow.toISOString()}`);

    // Construir condiciones base
    const baseConditions = [
      eq(pacientes.dni, Number(dni)),
      gte(turnos.fechaTurno, today),
      lte(turnos.fechaTurno, tomorrow),
      eq(turnos.centroMedicoId, centroIdLimpio),
      eq(turnos.estado, 'pendiente')
    ];

    logger.log(`[API /autocheckin] Condiciones de búsqueda: DNI=${Number(dni)}, centro=${centroIdLimpio}, estado=pendiente`);

    // Si se especifica un turnoId, agregar filtro
    const conditions = turnoId
      ? [...baseConditions, eq(turnos.id, turnoId)]
      : baseConditions;

    // console.log(`[API /autocheckin] Ejecutando consulta...`);

    const turnosPendientes = await db
      .select({
        id: turnos.id,
        fechaTurno: turnos.fechaTurno,
        estado: turnos.estado,
        pacienteId: turnos.pacienteId,
        userMedicoId: turnos.userMedicoId,
        centroMedicoId: turnos.centroMedicoId,
        profesionalNombre: users.nombre,
        profesionalApellido: users.apellido,
        especialidad: users.especialidad,
      })
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
      .leftJoin(users, eq(turnos.userMedicoId, users.id))
      .where(and(...conditions));

    logger.log(`[API /autocheckin] Turnos encontrados: ${turnosPendientes.length}`);
    if (turnosPendientes.length > 0) {
      logger.log(`[API /autocheckin] Detalles:`, JSON.stringify(turnosPendientes, null, 2));
    }

    if (turnosPendientes.length === 0) {
      logger.log(`[API /autocheckin] No se encontró turno pendiente para DNI: ${dni} en centro: ${centroIdLimpio}`);
      return new Response(
        JSON.stringify({ message: `No se encontró un turno pendiente para el DNI proporcionado en el centro ${centroIdLimpio}.` }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Si hay múltiples turnos y no se especificó cuál, devolver opciones
    if (turnosPendientes.length > 1 && !turnoId) {
      const opciones = turnosPendientes.map(t => ({
        turnoId: t.id,
        userMedicoId: t.userMedicoId!,
        profesionalNombre: `${t.profesionalNombre || ''} ${t.profesionalApellido || ''}`.trim(),
        especialidad: t.especialidad || '',
        hora: t.fechaTurno.toISOString(),
      }));
      return new Response(
        JSON.stringify({ message: 'Múltiples turnos encontrados.', opciones }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const turnoEncontrado = turnosPendientes[0];
    logger.log(
      `[API /autocheckin] Turno encontrado: ${turnoEncontrado.id}. Actualizando a 'sala_de_espera'.`
    );

    const [turnoActualizado] = await db
      .update(turnos)
      .set({
        estado: 'sala_de_espera',
        horaLlegadaPaciente: new Date(getFechaEnMilisegundos()),
      })
      .where(eq(turnos.id, turnoEncontrado.id))
      .returning();

    // --- EMITIR EVENTO SSE ---
    // Notificamos a todos los clientes (recepción, médico) que el estado del turno cambió.
    emitEvent('turno-actualizado', turnoActualizado, { centroMedicoId: turnoActualizado.centroMedicoId! });
    logger.log(
      `[API /autocheckin] Evento SSE 'turno-actualizado' emitido para turno ${turnoActualizado.id}`
    );

    // --- GENERAR TOKEN PARA EL PORTAL DEL PACIENTE ---
    const token = nanoid(32); // Genera un token seguro de 32 caracteres
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 3); // El token es válido por 3 horas

    await db.insert(portalSessions).values({
      token,
      turnoId: String(turnoActualizado.id),
      expired_at: expiredAt,
    });
    console.log(`[API /autocheckin] Token de portal creado para turno ${turnoActualizado.id}`);

    return new Response(
      JSON.stringify({
        message: 'Check-in realizado con éxito.',
        token: token,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[API /autocheckin] Error:', error);
    return new Response(JSON.stringify({ message: 'Error en el servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};