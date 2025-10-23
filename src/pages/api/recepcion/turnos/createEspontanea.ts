import db from '@/db';
import { pacientes, turnos, users, usersCentrosMedicos } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';



export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const {
    pacienteId,
    fechaTurno,
    duracion,
    horaTurno,
    motivoConsulta,
    medicoId,
    tipoDeTurno,
    estado,
    pacienteNombre,
  } = await request.json();
  console.log('este es la data que viene del formulario -> ', {
    pacienteId,
    fechaTurno,
    duracion,
    horaTurno,
    medicoId,
    tipoDeTurno,
    estado,
    pacienteNombre,
  });
  const { user } = locals;
  if (!pacienteId || !fechaTurno || !duracion || !horaTurno || !medicoId) {
    return createResponse(400, 'Faltan campos obligatorios para crear el turno.');
  }

  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }

  const { session } = await lucia.validateSession(sessionId);
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  const [userCentro] = await db
    .select()
    .from(usersCentrosMedicos)
    .where(eq(usersCentrosMedicos.userId, user.id));

  if (!userCentro) {
    return createResponse(403, 'El usuario no tiene un centro médico activo asignado.');
  }
  const centroMedicoId = userCentro.centroMedicoId;

  const isPaciente = await db.select().from(pacientes).where(eq(pacientes.id, pacienteId));
  if (!isPaciente.length) {
    return createResponse(404, 'Paciente no encontrado');
  }

  try {
    const turnoId = nanoIDNormalizador('Turno', 15);
    // console.log('iiciando la insercion de nuevo turno en el db.... ⌛', {
    //   turnoId,
    //   pacienteId,
    //   otorgaUserId: user?.id,
    //   userMedicoId: medicoId,
    //   fechaTurno: new Date(fechaTurno),
    //   horaTurno,
    //   duracion,
    //   motivoConsulta,
    //   estado,
    //   tipoDeTurno,
    //   centroMedicoId: user?.centroMedicoId,
    //   pacienteNombre,
    // });

    const [newTurno] = await db
      .insert(turnos)
      .values({
        id: turnoId,
        pacienteId: pacienteId,
        otorgaUserId: user?.id,
        userMedicoId: medicoId,
        fechaTurno: new Date(fechaTurno),
        horaAtencion: horaTurno,
        horaLlegadaPaciente: new Date(fechaTurno),
        duracion: duracion,
        motivoConsulta: motivoConsulta,
        estado: estado || 'sala_de_espera',
        tipoDeTurno: tipoDeTurno || 'espontaneo',
        centroMedicoId: user?.centroMedicoId,
      })
      .returning();
    console.log('buscando los datos del profesional.... ⌛');
    const [dataProfesional] = await db
      .select()
      .from(users)
      .where(eq(users.id, newTurno.userMedicoId));
    console.log('creando el log de audit.... ⌛');
    await logAuditEvent({
      userId: user.id,
      centroMedicoId: centroMedicoId,
      actionType: 'CREATE',
      tableName: 'turnos',
      recordId: newTurno.id,
      newValue: newTurno,
      description: `Se creó un nuevo turno (${newTurno.tipoDeTurno}) para el paciente ${pacienteNombre || isPaciente[0].nombre
        }`,
    });
    console.log('creando la respuesta del turno.... ⌛');
    const creandoResponse = {
      hora: newTurno.fechaTurno.toISOString(),
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
        motivoConsulta: newTurno.motivoConsulta,
        horaTurno: newTurno.horaAtencion,
        duracion: newTurno.duracion,
        estado: newTurno.estado,
        tipoDeTurno: newTurno.tipoDeTurno,
      },
    };

    if (newTurno.estado === 'sala_de_espera') {
      emitEvent('paciente-en-espera', creandoResponse, { centroMedicoId: centroMedicoId });
    }
    emitEvent('turno-agendado', creandoResponse, { centroMedicoId: centroMedicoId });

    return createResponse(200, 'Turno creado con éxito', creandoResponse);
  } catch (error: any) {
    console.error('Error al crear el turno:', error);
    if (
      error.message.includes('UNIQUE constraint failed: turnos.fechaTurno, turnos.userMedicoId')
    ) {
      return createResponse(
        409,
        'Ya existe un turno para este profesional en la fecha y hora seleccionadas.'
      );
    }
    return createResponse(500, 'Error interno del servidor al crear el turno.');
  }
};
