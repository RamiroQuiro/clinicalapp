import db from '@/db';
import { pacientes, turnos } from '@/db/schema';
import { emitEvent } from '@/lib/sse/sse';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { turnoId, consultorio } = await request.json();

    if (!turnoId || !consultorio) {
      return new Response('Faltan datos (turnoId, consultorio)', { status: 400 });
    }

    // Buscar el nombre del paciente y el centro médico para el evento
    const result = await db
      .select({
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        centroMedicoId: turnos.centroMedicoId,
        estado: turnos.estado,
      })
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
      .where(eq(turnos.id, turnoId));

    if (result.length === 0 || !result[0].centroMedicoId) {
      return new Response('Turno no encontrado o sin centro médico asignado', { status: 404 });
    }

    const nombreCompleto = `${result[0].nombre} ${result[0].apellido}`;
    const centroMedicoId = result[0].centroMedicoId;

    // Emitir el evento que el portal del paciente y el turnero están escuchando
    emitEvent(
      'paciente-llamado',
      {
        turnoId: turnoId, // Incluir turnoId para verificación en portal
        nombrePaciente: nombreCompleto,
        consultorio: consultorio,
        estado: 'demorado', // Incluir estado para actualizar UI
        timestamp: new Date().toISOString(),
      },
      { centroMedicoId: centroMedicoId }
    );

    console.log(`[API /llamar] Evento 'paciente-llamado' emitido para ${nombreCompleto}`);

    return new Response('Evento de llamado emitido con éxito', { status: 200 });

  } catch (error) {
    console.error('[API /llamar] Error:', error);
    return new Response('Error en el servidor', { status: 500 });
  }
};
