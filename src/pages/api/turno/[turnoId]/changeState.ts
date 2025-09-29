import db from '@/db';
import { salaDeEspera, turnos } from '@/db/schema';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, locals, request }) => {
  const { turnoId } = params;

  try {
    const data = await request.json();
    const isTurno = await db.select().from(turnos).where(eq(turnos.id, turnoId));
    console.log('data ingresante', data);
    if (!isTurno.length) {
      return createResponse(404, 'Turno no encontrado');
    }

    const transaccionBd = await db.transaction(async () => {
      const [turnoUpdate] = await db
        .update(turnos)
        .set({
          estado: data.estado,
          horaLlegadaPaciente: data.horaLlegadaPaciente
            ? new Date(data.horaLlegadaPaciente)
            : undefined,
        })
        .where(eq(turnos.id, turnoId))
        .returning();

      const idSalaEspera = nanoIDNormalizador('salaEspera_');
      const insertarSalaEspera = await db.insert(salaDeEspera).values({
        id: idSalaEspera,
        pacienteId: turnoUpdate.pacienteId,
        apellidoPaciente: data.pacienteApellido,
        dniPaciente: data.pacienteDocumento,
        nombrePaciente: data.pacienteNombre,

        userMedicoId: turnoUpdate.userMedicoId,
        fecha: turnoUpdate.fechaTurno,
        horaAtencion: turnoUpdate.horaAtencion,
        motivoConsulta: turnoUpdate.motivoConsulta,
        horaLlegada: turnoUpdate.horaLlegadaPaciente,
        turnoId: turnoUpdate.id,
      });

      return turnoUpdate;
    });

    return createResponse(200, 'Turno actualizado exitosamente', transaccionBd);
  } catch (error) {
    console.log(error);
    return createResponse(200, 'Turno actualizado exitosamente', error);
  }
};
