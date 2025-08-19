import db from '@/db';
import { atenciones } from '@/db/schema';
import { getFechaUnix } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async ({ request, locals, redirect }) => {
  try {
    const newUrl = request.url;
    const urlParams = new URL(newUrl);
    const pacienteId = urlParams.searchParams.get('pacienteId');
    const { session } = locals;

    if (!pacienteId || !session?.userId) {
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), { status: 400 });
    }

    const horaInicio = new Date(getFechaUnix() * 1000);
    // 1. Crear la nueva atención
    const idAtencion = 'aten_' + nanoid(15);
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

    console.log('atencion creada nueva', atencionNueva);

    // 2. Redirigir directo al dashboard del paciente con la atención activa
    return redirect(`/dashboard/consultas/aperturaPaciente/${pacienteId}/${idAtencion}`);
  } catch (err) {
    console.error('Error creando nueva atención:', err);
    return new Response(JSON.stringify({ error: 'Error interno al crear atención' }), {
      status: 500,
    });
  }
};
