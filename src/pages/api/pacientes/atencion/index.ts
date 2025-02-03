import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

import db from '@/db';
import {
  atenciones,
  diagnostico,
  fichaPaciente,
  medicamento,
  pacientes,
  signosVitales,
  users,
} from '@/db/schema';
import { lucia } from '@/lib/auth';
import { generateId } from 'lucia';
import calcularIMC from '../../../../utils/calcularIMC';

export const POST: APIRoute = async ({ request, cookies }) => {
  const {
    data: {
      dataIds,
      tratamiento,
      motivoConsulta,
      signosVitales: dataSignosVitales,
      diagnosticos: dataDiagnosticos,
      medicamentos: dataMedicamentos,
      motivoInicial,
    },
  } = await request.json();

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const isExistPaciente = (
      await db.select().from(pacientes).where(eq(pacientes.id, dataIds.pacienteId))
    ).at(0);

    if (!isExistPaciente) {
      return new Response(JSON.stringify({ status: 404, msg: 'No existe el paciente' }), {
        status: 404,
      });
    }

    // Validar datos esenciales
    if (!dataIds.userId || !dataIds.pacienteId || !dataIds.atencionId) {
      return new Response(JSON.stringify({ status: 400, msg: 'Faltan datos obligatorios' }), {
        status: 400,
      });
    }
    // Transacción
    const transaction = await db.transaction(async tx => {
      const duracionMilisegundos = new Date(dataIds.finAtencion) - new Date(dataIds.inicioAtencion);
      const duracionMinutos = Math.floor(duracionMilisegundos / 1000 / 60); // Duración en minutos

      // Ajustar la fecha a la zona horaria local (UTC-3)
      const fechaLocal = new Date();
      const fechaISO = new Date(
        fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000
      ).toISOString();

      await tx.insert(atenciones).values({
        id: dataIds.atencionId,
        pacienteId: dataIds.pacienteId,
        userId: dataIds.userId,
        fecha: fechaISO,
        inicioAtencion: new Date(dataIds.inicioAtencion).toISOString(),
        finAtencion: new Date(dataIds.finAtencion).toISOString(),
        duracionAtencion: duracionMinutos,
        tratamiento,
        motivoConsulta,
        motivoInicial,
      });

      const idSignos = generateId(13);
      const imc = calcularIMC(dataSignosVitales.peso, isExistPaciente.estatura);
      dataSignosVitales.imc = imc;

      await tx.insert(signosVitales).values({
        id: idSignos,
        atencionId: dataIds.atencionId,
        pacienteId: dataIds.pacienteId,
        userId: dataIds.userId,
        imc: dataDiagnosticos.imc,
        ...dataSignosVitales,
      });

      await Promise.all(
        dataDiagnosticos.map(diag =>
          tx.insert(diagnostico).values({
            id: generateId(12),
            diagnostico: diag.diagnostico,
            observaciones: diag.observaciones,
            codigoCIE: diag.codigoCIE,
            pacienteId: dataIds.pacienteId,
            atencionId: dataIds.atencionId,
            userId: dataIds.userId,
          })
        )
      );

      await Promise.all(
        dataMedicamentos.map(med =>
          tx.insert(medicamento).values({
            id: generateId(12),
            nombre: med.nombre,
            dosis: med.dosis,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
            pacienteId: dataIds.pacienteId,
            atencionId: dataIds.atencionId,
            userId: dataIds.userId,
          })
        )
      );
    });

    return new Response(JSON.stringify({ status: 200, msg: 'Atención cerrada con éxito' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error al cerrar atención:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al cerrar atención: ' + error.message,
      }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ request, cookies }) => {
  const atencionId = request.headers.get('X-Atencion-Id');
  if (!atencionId) {
    return new Response(JSON.stringify({ error: 'ID de paciente no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response('No autorizado', { status: 401 });
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    return new Response('No autorizado', { status: 401 });
  }
  const result = await db.transaction(async trx => {
    const atencionData = (
      await trx
        .select({
          id: atenciones.id,
          userId: atenciones.userId,
          pacienteId: atenciones.pacienteId,
          motivoConsulta: atenciones.motivoConsulta,
          motivoInicial: atenciones.motivoInicial,
          fecha: atenciones.fecha,
          tratamiento: atenciones.tratamiento,
          estado: atenciones.estado,
          created_at: atenciones.created_at,
          inicioAtencion: atenciones.inicioAtencion,
          finAtencion: atenciones.finAtencion,
          duracionAtencion: atenciones.duracionAtencion,
          nombreDoctor: users.nombre,
          apellidoDoctor: users.apellido,
        })
        .from(atenciones)
        .innerJoin(users, eq(users.id, atenciones.userId))
        .where(eq(atenciones.id, atencionId))
    ).at(0);
    if (!atencionData) {
      return new Response(
        JSON.stringify({
          status: 404,
          msg: 'no se encontro atencion',
        })
      );
    }
    const pacienteData = (
      await trx
        .select({
          nombre: pacientes.nombre,
          apellido: pacientes.apellido,
          dni: pacientes.dni,
          sexo: pacientes.sexo,
          celular: fichaPaciente.celular,
          email: fichaPaciente.email,
          provincia: fichaPaciente.provincia,
          nObraSocial: fichaPaciente.nObraSocial,
          obraSocial: fichaPaciente.obraSocial,
          ciudad: fichaPaciente.ciudad,
          grupoSanguineo: fichaPaciente.grupoSanguineo,
          estatura: fichaPaciente.estatura,
          domicilio: pacientes.domicilio,
        })
        .from(pacientes)
        .innerJoin(
          fichaPaciente,
          and(
            eq(fichaPaciente.pacienteId, pacientes.id),
            eq(fichaPaciente.userId, session?.userId) // Filtrar por el usuario (userId)
          )
        )
        .where(eq(pacientes.id, atencionData.pacienteId))
    ).at(0);
    const medicamentosAtencionData = await trx
      .select()
      .from(medicamento)
      .where(eq(medicamento.atencionId, atencionId));
    const diagnosticoAtencionData = await trx
      .select()
      .from(diagnostico)
      .where(eq(diagnostico.atencionId, atencionId));
    const signosVitalesAtencion = await trx
      .select()
      .from(signosVitales)
      .where(eq(signosVitales.atencionId, atencionId));
    return {
      atencionData,
      pacienteData,
      medicamentosAtencionData,
      diagnosticoAtencionData,
      signosVitalesAtencion,
    };
  });
  try {
    return new Response(
      JSON.stringify({
        status: 200,
        data: result,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: 'error al buscar los datos',
      })
    );
  }
};
