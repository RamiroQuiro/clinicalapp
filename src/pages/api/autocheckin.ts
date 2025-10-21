import db from '@/db';
import { pacientes, turnos } from '@/db/schema';
import { portalSessions } from '@/db/schema/portalSessions';
import { emitEvent } from '@/lib/sse/sse';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { and, eq, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { dni } = await request.json();

    if (!dni) {
      return new Response(JSON.stringify({ message: 'El campo DNI es obligatorio.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- LÓGICA DE BASE DE DATOS REAL ---
    console.log(`[API /autocheckin] Buscando turno para DNI: ${dni}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const turnosPendientes = await db
      .select()
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
      .where(
        and(
          eq(pacientes.dni, dni),
          gte(turnos.fechaTurno, today),
          lte(turnos.fechaTurno, tomorrow),
          eq(turnos.estado, 'pendiente') // O podría ser ['pendiente', 'confirmado']
        )
      );

    if (turnosPendientes.length === 0) {
      console.log(`[API /autocheckin] No se encontró turno pendiente para DNI: ${dni}`);
      return new Response(
        JSON.stringify({ message: 'No se encontró un turno pendiente para el DNI proporcionado.' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const turnoEncontrado = turnosPendientes[0].turnos;
    console.log(
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
    emitEvent('turno-actualizado', turnoActualizado, { centroMedicoId: turnoActualizado.centroMedicoId });
    console.log(
      `[API /autocheckin] Evento SSE 'turno-actualizado' emitido para turno ${turnoActualizado.id}`
    );

    // --- GENERAR TOKEN PARA EL PORTAL DEL PACIENTE ---
    const token = nanoid(32); // Genera un token seguro de 32 caracteres
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3); // El token es válido por 3 horas

    await db.insert(portalSessions).values({
      token: token,
      turnoId: turnoActualizado.id,
      expiresAt: expiresAt,
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
