import { atenciones, diagnostico, medicamento, signosVitales, tratamiento } from '@/db/schema'; // Importa las tablas necesarias
import type { APIRoute } from 'astro';

import db from '@/db';
import { getFechaUnix } from '@/utils/timesUtils';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid'; // Para generar IDs únicos

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals;

  if (!user || !session) {
    return new Response(
      JSON.stringify({
        message: 'No autorizado',
      }),
      { status: 401 }
    );
  }
  try {
    const consultaData: Consulta & { status: string; atencionId?: string } = await request.json();

    const {
      motivoInicial,
      pacienteId,
      historiaClinicaId,
      motivoConsulta,
      sintomas,
      signosVitales: svData,
      observaciones,
      medicamentos,
      diagnosticos,

      notas,
      tratamiento: tratamientoData,
      status,
      inicioConsulta, // ADDED
      finConsulta, // ADDED
      duracionConsulta, // ADDED
    } = consultaData;

    // Validaciones básicas
    if (!pacienteId || !motivoConsulta) {
      return new Response(
        JSON.stringify({
          message: 'Paciente ID y Motivo de Consulta son requeridos.',
        }),
        { status: 400 }
      );
    }

    let currentAtencionId = consultaData.id || nanoid(); // Genera un ID si no existe

    await db.transaction(async tx => {
      const fechaHoy = new Date(getFechaUnix());
      // 1. Guardar/Actualizar Atención principal
      // Aquí deberías decidir si es una inserción o una actualización.
      // Por simplicidad, asumiremos inserción por ahora, o que el id se maneja en el frontend.
      // Si id viene, es una actualización. Si no, es una inserción.
      console.log('ingresando los datos emepezando con la atencion', consultaData);
      if (consultaData.id) {
        // Actualizar atención existente
        await tx
          .update(atenciones)
          .set({
            motivoConsulta,
            sintomas,
            observaciones,
            motivoInicial,
            inicioAtencion: inicioConsulta, // ADDED
            finAtencion: finConsulta, // ADDED
            duracionAtencion: duracionConsulta, // ADDED
            updated_at: new Date(),
            estado: status,
            ultimaModificacionPorId: user.id, // ADDED
          })
          .where(eq(atenciones.id, consultaData.id));
      } else {
        // Insertar nueva atención
        await tx.insert(atenciones).values({
          id: currentAtencionId,
          pacienteId,
          motivoInicial,
          motivoConsulta,
          sintomas,
          observaciones,
          historiaClinicaId,
          estado: status,
          userIdMedico: user.id,
          inicioConsulta, // ADDED
          finConsulta, // ADDED
          duracionConsulta, // ADDED
        });
      }

      console.log('empezando a ingresar los signos vitales 🖋️', svData);
      // 2. Guardar/Actualizar Signos Vitales (1 a 1 con atención)
      const existingSV = await tx
        .select()
        .from(signosVitales)
        .where(eq(signosVitales.atencionId, currentAtencionId))
        .limit(1);
      console.log('existingSV', existingSV);
      if (existingSV.length > 0) {
        // Actualizamos el registro existente
        await tx
          .update(signosVitales)
          .set({ ...svData })
          .where(eq(signosVitales.atencionId, currentAtencionId));
      } else {
        // Insertamos uno nuevo
        await tx.insert(signosVitales).values({
          id: nanoid(),
          atencionId: currentAtencionId,
          pacienteId,
          userId: user.id,
          ...svData,
        });
      }

      await tx.delete(diagnostico).where(eq(diagnostico.atencionId, currentAtencionId));
      // 3. Guardar Diagnósticos (Delete and Re-insert)
      if (diagnosticos && diagnosticos.length > 0) {
        // Primero, eliminamos todos los diagnósticos existentes para esta atención

        // Luego, insertamos los nuevos diagnósticos que vienen del frontend
        await tx.insert(diagnostico).values(
          diagnosticos.map(d => ({
            id: nanoid(),
            atencionId: currentAtencionId,
            pacienteId,
            userMedicoId: user.id,
            historiaClinicaId,
            diagnostico: d.diagnostico, // Asegúrate que el frontend envíe 'diagnostico'
            observaciones: d.observaciones,
            codigoCIE: d.codigoCIE, // Y 'codigoCIE'
          }))
        );
      }
      console.log('Datos de la consulta: trtamiento data', tratamientoData);
      // 4. Guardar/Actualizar Tratamientos
      if (tratamientoData.tratamiento) {
        // Eliminamos los tratamientos existentes para esta atención
        await tx.delete(tratamiento).where(eq(tratamiento.atencionesId, currentAtencionId));

        // Insertamos los nuevos tratamientos
        await tx.insert(tratamiento).values({
          id: nanoid(),
          atencionesId: currentAtencionId,
          pacienteId,
          userMedicoId: user.id,
          tratamiento: tratamientoData.tratamiento,
        });
      } else {
        // Insertamos los nuevos tratamientos
        await tx.insert(tratamiento).values({
          id: nanoid(),
          atencionesId: currentAtencionId,
          pacienteId,
          userMedicoId: user.id,
          tratamiento: tratamientoData.tratamiento,
        });
      }

      // 5. Guardar Medicamentos (asumiendo que se insertan nuevos cada vez)
      // Tu interfaz Consulta tiene 'medicamentos: string[]', pero tu componente
      // ConsultaActualPantalla.tsx no tiene un input para 'medicamentos' directamente.
      console.log('Datos de la consulta: medicamentos', medicamentos);
      // Si 'medicamentos' se refiere a los tratamientos, entonces esta sección podría no ser necesaria
      // o necesitaría ser ajustada. Por ahora, la dejo como un placeholder.
      // Eliminamos los medicamentos existentes para esta atención
      await tx.delete(medicamento).where(eq(medicamento.atencionId, currentAtencionId));
      if (medicamentos && medicamentos.length > 0) {
        await tx.insert(medicamento).values(
          medicamentos.map(m => ({
            id: nanoid(),
            historiaClinicaId: historiaClinicaId,
            nombreGenerico: m.nombreGenerico,
            nombreComercial: m.nombreComercial,
            dosis: m.dosis,
            frecuencia: m.frecuencia,
            atencionId: currentAtencionId,
            pacienteId,
            userMedicoId: user.id,
          }))
        );
      }
    });

    return new Response(
      JSON.stringify({
        message: 'Consulta guardada con éxito',
        atencionId: currentAtencionId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al guardar la consulta:', error);

    // Mejor manejo de errores
    let errorMessage = 'Error interno del servidor al guardar la consulta';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Verificar si es un error de validación de número
    if (errorMessage.includes('Only finite numbers') || errorMessage.includes('Infinity or NaN')) {
      errorMessage =
        'Error: Se intentó guardar un valor numérico inválido. Por favor revisa los campos numéricos.';
    }

    return new Response(
      JSON.stringify({
        message: errorMessage,
        error: errorMessage,
      }),
      { status: 500 }
    );
  }
};
