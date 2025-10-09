import db from '@/db';
import { pacientes, turnos, users } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const data = await request.json();

  if (!data.pacienteId || !data.fechaTurno || !data.duracion || !data.horaTurno) {
    return createResponse(400, 'Faltan campos obligatorios para crear el turno.');
  }

  const { user, session } = locals;
  console.log('iseruser locals  ', user);
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  const isPaciente = await db.select().from(pacientes).where(eq(pacientes.id, data.pacienteId));
  if (!isPaciente.length) {
    return createResponse(404, 'Paciente no encontrado');
  }

  try {
    const turnoId = nanoIDNormalizador('Turno', 15);

    const [newTurno] = await db
      .insert(turnos)
      .values({
        id: turnoId,
        tipoDeTurno: 'programado',
        centroMedicoId: user?.centroMedicoId,
        pacienteId: data.pacienteId,
        otorgaUserId: user?.id,
        userMedicoId: data.userMedicoId,
        fechaTurno: new Date(data.fechaTurno),
        horaAtencion: data.horaTurno,
        duracion: data.duracion,
        motivoConsulta: data.motivoConsulta,
        estado: 'pendiente', // Estado inicial
      })
      .returning();

    const [dataProfesional] = await db
      .select()
      .from(users)
      .where(eq(users.id, newTurno.userMedicoId));
    await logAuditEvent({
      userId: user.id,
      actionType: 'CREATE',
      tableName: 'turnos',
      centroMedicoId: user?.centroMedicoId,
      recordId: newTurno.id,
      newValue: newTurno,
      description: `Se creó un nuevo turno para el paciente ${data.pacienteNombre}`,
    });

    const creandoResponse = {
      hora: newTurno.horaAtencion,
      disponible: false,
      turnoInfo: {
        id: newTurno.id,
        pacienteDocumento: isPaciente[0].dni,
        pacienteId: newTurno.pacienteId,
        pacienteCelular: isPaciente[0].celular,
        pacienteNombre: isPaciente[0].nombre,
        pacienteApellido: isPaciente[0].apellido,
        fechaTurno: newTurno.fechaTurno,
        profesionalNombre: dataProfesional.nombre,
        profesionalApellido: dataProfesional.apellido,
        especialidadProfesional: dataProfesional.especialidad,
        motivoConsulta: data.motivoConsulta,
        horaTurno: newTurno.horaAtencion,
        duracion: newTurno.duracion,
        estado: newTurno.estado,
      },
    };

    emitEvent('turno-agendado', creandoResponse);
    return createResponse(200, 'Turno creado con éxito', creandoResponse);
  } catch (error: any) {
    console.error('Error al crear el turno:', error);
    return createResponse(500, 'Error interno del servidor al crear el turno.');
  }
};
