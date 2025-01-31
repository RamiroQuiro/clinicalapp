import { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { pacientes } from '../../../db/schema';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const dni = url.searchParams.get('dni');

  if (!dni) {
    return new Response(JSON.stringify({ exists: false }), {
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    // Buscar el paciente por DNI
    const paciente = await db
      .select()
      .from(pacientes)
      .where(eq(pacientes.dni, parseInt(dni, 10)))
      .get();
    console.log(paciente);
    if (paciente) {
      // Si el paciente existe, devolver sus datos
      return new Response(
        JSON.stringify({
          exists: true,
          paciente: {
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            domicilio: paciente.domicilio,
            fNacimiento: paciente.fNacimiento,
            sexo: paciente.sexo,
          },
        }),
        {
          headers: { 'content-type': 'application/json' },
        }
      );
    } else {
      // Si el paciente no existe, devolver exists: false
      return new Response(JSON.stringify({ exists: false }), {
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ exists: false }), {
      headers: { 'content-type': 'application/json' },
    });
  }
};
