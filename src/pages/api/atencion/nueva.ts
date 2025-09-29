import db from '@/db';
import { atenciones, turnos } from '@/db/schema';
import { nanoIDNormalizador } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  try {
    const newUrl = request.url;
    const urlParams = new URL(newUrl);
    const pacienteId = urlParams.searchParams.get('pacienteId');
    const turnoId = urlParams.searchParams.get('turnoId');
    const { session } = locals;

    if (!pacienteId || !session?.userId) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }
    let modificarTablaTurno;
    const horaInicio = new Date(getFechaEnMilisegundos());
    // 1. Crear la nueva atención
    const idAtencion = nanoIDNormalizador('aten_');
    const atencionNueva = await db
      .insert(atenciones)
      .values({
        id: idAtencion,
        pacienteId,
        userIdMedico: session.userId,
        estado: 'en_curso',
        fechaInicio: horaInicio,
      })
      .returning();
    if (turnoId) {
      modificarTablaTurno = await db
        .update(turnos)
        .set({ atencionId: idAtencion, estado: 'en_consulta' })
        .where(eq(turnos.id, turnoId))
        .returning();
    }

    console.log('atencion creada nueva', atencionNueva, 'turno modificado', modificarTablaTurno);

    // 2. Redirigir directo al dashboard del paciente con la atención activa
    return redirect(`/dashboard/consultas/aperturaPaciente/${pacienteId}/${idAtencion}`);
  } catch (err) {
    console.error('Error creando nueva atención:', err);
    return new Response(JSON.stringify({ error: 'Error interno al crear atención' }), {
      status: 500,
    });
  }
};
