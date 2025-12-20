import db from '@/db';
import { pacientes, turnos } from '@/db/schema';
import { emitEvent } from '@/lib/sse/sse';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { turnoId, consultorio = 'Consultorio 1' } = await request.json();

        if (!turnoId) {
            return new Response(JSON.stringify({ message: 'ID del turno es requerido.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log(`[API /llamar-paciente] Llamando a paciente con turno ID: ${turnoId}`);

        // Obtener información del turno con datos del paciente
        const [turnoInfo] = await db
            .select({
                id: turnos.id,
                estado: turnos.estado,
                pacienteNombre: pacientes.nombre,
                pacienteApellido: pacientes.apellido,
                userMedicoId: turnos.userMedicoId,
                centroMedicoId: turnos.centroMedicoId,
            })
            .from(turnos)
            .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
            .where(eq(turnos.id, turnoId));

        if (!turnoInfo) {
            return new Response(JSON.stringify({ message: 'Turno no encontrado.' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Actualizar estado del turno a 'demorado' (estado existente que indica que está siendo llamado)
        const [turnoActualizado] = await db
            .update(turnos)
            .set({
                estado: 'demorado', // Usamos 'demorado' como estado de "siendo llamado"
                updatedAt: new Date(),
            })
            .where(eq(turnos.id, turnoId))
            .returning();

        console.log(`[API /llamar-paciente] Turno ${turnoId} actualizado a 'demorado' (siendo llamado)`);

        // Emitir evento SSE general de actualización
        emitEvent('turno-actualizado', turnoActualizado, {
            centroMedicoId: turnoActualizado.centroMedicoId || undefined
        });

        // Emitir evento específico de llamado a paciente para el portal
        const nombreCompleto = `${turnoInfo.pacienteNombre || ''} ${turnoInfo.pacienteApellido || ''}`.trim();
        emitEvent('paciente-llamado', {
            turnoId: turnoId,
            nombrePaciente: nombreCompleto,
            consultorio: consultorio,
            estado: 'demorado', // Incluir estado para actualizar UI
            timestamp: new Date().toISOString(),
        }, {
            centroMedicoId: turnoActualizado.centroMedicoId || undefined
        });

        console.log(`[API /llamar-paciente] Evento SSE 'paciente-llamado' emitido para ${nombreCompleto}`);

        return new Response(
            JSON.stringify({
                message: 'Paciente llamado exitosamente.',
                turno: turnoActualizado,
                nombrePaciente: nombreCompleto,
                consultorio: consultorio,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('[API /llamar-paciente] Error:', error);
        return new Response(JSON.stringify({ message: 'Error en el servidor.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
