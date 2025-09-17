import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { createResponse } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const defaultPreferencias = {
  configuracionGeneral: {
    tema: 'claro',
    idioma: 'es',
    mostrarHistorialCompleto: true,
    notificaciones: {
      recordatorios: true,
      alertasCriticas: true,
    },
  },
  signosVitales: {
    mostrar: true,
    campos: [
      'peso',
      'talla',
      'temperatura',
      'perimetroCefalico',
      'presionSistolica',
      'presionDiastolica',
      'saturacionOxigeno',
      'frecuenciaRespiratoria',
      'perimetroAbdominal',
      'imc',
      'glucosa',
      'dolor',
    ],
  },
  consulta: {
    motivoInicial: true,
    sintomas: true,
    diagnostico: true,
    tratamientoFarmacologico: true,
    tratamientoNoFarmacologico: true,
    planASeguir: true,
    archivosAdjuntos: true,
    notasPrivadas: false,
  },
  reportes: {
    incluirDatosPaciente: true,
    incluirDatosMedico: true,
    incluirFirmaDigital: true,
  },
};
// endpoints/preferenciasPerfil.ts (versión corregida)
export const GET: APIRoute = async ({ params, request, locals }) => {
  const { userId } = params;
  const { session } = locals;

  // Verificar si es un reset usando query parameters
  const url = new URL(request.url);
  const esReset = url.searchParams.get('reset') === 'true';
  const perfilId = url.searchParams.get('perfilId');

  try {
    if (esReset && perfilId) {
      // --- SECURITY CHECK ---
      if (session?.userId !== userId) {
        return createResponse(403, 'No autorizado');
      }

      const [perfilReseteado] = await db
        .update(preferenciaPerfilUser)
        .set({
          preferencias: defaultPreferencias,
          updated_at: new Date(getFechaEnMilisegundos()),
        })
        .where(
          and(eq(preferenciaPerfilUser.userId, userId), eq(preferenciaPerfilUser.id, perfilId))
        )
        .returning();

      if (!perfilReseteado) {
        return createResponse(404, 'Perfil no encontrado');
      }

      return createResponse(200, 'Preferencias reseteadas', perfilReseteado);
    }

    // Si no es reset, obtener todos los perfiles
    const preferenciasPerfilUserDB = await db
      .select()
      .from(preferenciaPerfilUser)
      .where(eq(preferenciaPerfilUser.userId, userId));

    return createResponse(200, 'Éxito', preferenciasPerfilUserDB);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al procesar la solicitud', error);
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { userId } = params;
  const { session } = locals;
  // --- SECURITY CHECK ---
  if (session?.userId !== userId) {
    return createResponse(403, 'No autorizado para crear un perfil para este usuario');
  }

  const data = await request.json();
  const { nombrePerfil, preferencias, especialidad, estado } = data;
  console.log('data', data);
  try {
    // Valida si ya existe un perfil con el mismo nombre para este usuario
    const [preferenciaPerfilDB] = await db
      .select()
      .from(preferenciaPerfilUser)
      .where(
        and(
          eq(preferenciaPerfilUser.userId, userId),
          eq(preferenciaPerfilUser.nombrePerfil, nombrePerfil)
        )
      );

    if (preferenciaPerfilDB) {
      return createResponse(400, 'El nombre de este perfil ya existe', preferenciaPerfilDB);
    }

    // Inserta el nuevo perfil
    const [preferenciaPerfilDBInsert] = await db
      .insert(preferenciaPerfilUser)
      .values({
        id: nanoid(), // Es buena práctica generar el ID en el servidor
        userId: userId,
        nombrePerfil: nombrePerfil,
        preferencias: preferencias,
        especialidad: especialidad,
        estado: estado,
        // created_at se inserta por defecto con SQL
      })
      .returning();

    console.log('Endpoint de preferenciasPerfil para la data', preferenciaPerfilDBInsert);
    return createResponse(200, 'Éxito', preferenciaPerfilDBInsert);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al crear el perfil', error);
  }
};
