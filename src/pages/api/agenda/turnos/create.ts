import db from '@/db';
import { licenciasProfesional, pacientes, turnos, users } from '@/db/schema';
import { pacienteProfesional } from '@/db/schema/pacienteProfesional';
import { logAuditEvent } from '@/lib/audit';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, gte, lte } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const data = await request.json();
  console.log('data que viene del para crear turno con agenda formulario -> ', data);
  if (!data.pacienteId || !data.fechaTurno || !data.duracion || !data.horaTurno) {
    return createResponse(400, 'Faltan campos obligatorios para crear el turno.');
  }

  const { user, session } = locals;
  console.log('iseruser locals  ', user);
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  const fechaTurnoDate = new Date(data.fechaTurno);

  // Validar Licencia Profesional
  if (data.userMedicoId) {
    const licenciasActivas = await db
      .select()
      .from(licenciasProfesional)
      .where(
        and(
          eq(licenciasProfesional.userId, data.userMedicoId),
          eq(licenciasProfesional.estado, 'activa'),
          lte(licenciasProfesional.fechaInicio, fechaTurnoDate),
          gte(licenciasProfesional.fechaFin, fechaTurnoDate)
        )
      )
      .limit(1);

    if (licenciasActivas.length > 0) {
      return createResponse(400, 'El profesional se encuentra de licencia médica en la fecha seleccionada.');
    }
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
        estado: 'pendiente',
      })
      .returning();

    // --- Lógica para pacienteProfesional ---
    const { pacienteId, userMedicoId } = newTurno;
    const centroMedicoId = user?.centroMedicoId;

    // Verificar si la relación ya existe
    const existingRelationship = await db
      .select()
      .from(pacienteProfesional)
      .where(
        and(
          eq(pacienteProfesional.pacienteId, pacienteId),
          eq(pacienteProfesional.userId, userMedicoId),
          eq(pacienteProfesional.centroMedicoId, centroMedicoId)
        )
      );

    if (existingRelationship.length === 0) {
      // Si no existe, crear una nueva relación
      await db.insert(pacienteProfesional).values({
        id: nanoIDNormalizador('PacProf', 15),
        pacienteId: pacienteId,
        userId: userMedicoId,
        centroMedicoId: centroMedicoId,
        fechaAsignacion: new Date(),
        estado: 'activo',
      });
      console.log(`[API /agenda/turnos/create] Nueva relación paciente-profesional creada: Paciente ${pacienteId} con Profesional ${userMedicoId}`);
    } else {
      console.log(`[API /agenda/turnos/create] Relación paciente-profesional ya existe para Paciente ${pacienteId} con Profesional ${userMedicoId}`);
    }
    // --- Fin Lógica para pacienteProfesional ---

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
      hora: newTurno.fechaTurno.toISOString(), // DEVOLVEMOS FECHA COMPLETA ISO
      disponible: false,
      centroMedicoId: user?.centroMedicoId,
      userMedicoId: newTurno?.userMedicoId,
      turnoInfo: {
        id: newTurno.id,
        pacienteDocumento: isPaciente[0].dni,
        pacienteId: newTurno.pacienteId,
        pacienteCelular: isPaciente[0].celular,
        pacienteNombre: isPaciente[0].nombre,
        pacienteApellido: isPaciente[0].apellido,
        fechaTurno: newTurno.fechaTurno.toISOString(),
        profesionalNombre: dataProfesional.nombre,
        profesionalApellido: dataProfesional.apellido,
        especialidadProfesional: dataProfesional.especialidad,
        motivoConsulta: data.motivoConsulta,
        horaTurno: newTurno.horaAtencion,
        duracion: newTurno.duracion,
        estado: newTurno.estado,
      },
    };

    emitEvent('turno-agendado', creandoResponse, { centroMedicoId: user?.centroMedicoId });
    return createResponse(200, 'Turno creado con éxito', creandoResponse);
  } catch (error: any) {
    console.error('Error al crear el turno:', error);
    return createResponse(500, 'Error interno del servidor al crear el turno.');
  }
};
