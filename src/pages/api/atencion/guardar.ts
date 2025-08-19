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
      const fechaHoy = new Date(getFechaUnix() * 1000);
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
            estado: status,
          })
          .where(eq(atenciones.id, consultaData.id));
      } else {
        // Insertar nueva atención
        await tx.insert(atenciones).values({
          id: currentAtencionId,
          pacienteId,
          motivoConsulta,
          sintomas,
          observaciones,
          historiaClinicaId,
          estado: status,
          userIdMedico: user.id,
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

      console.log('empezando a ingresar los diagnósticos 🖋️', diagnosticos);
      // 3. Guardar/Actualizar Diagnósticos
      if (diagnosticos && diagnosticos.length > 0) {
        // Actualizamos los diagnósticos existentes o insertamos los nuevos
        for (const d of diagnosticos) {
          const existingDiagnostico = await tx
            .select()
            .from(diagnostico)
            .where(eq(diagnostico.atencionId, currentAtencionId))
            .limit(1);

          if (existingDiagnostico.length > 0) {
            // Actualizamos el registro existente
            await tx
              .update(diagnostico)
              .set({ observaciones: d.observaciones, updated_at: new Date(getFechaUnix() * 1000) })
              .where(eq(diagnostico.atencionId, currentAtencionId));
          } else {
            // Insertamos uno nuevo
            await tx.insert(diagnostico).values({
              id: nanoid(),
              atencionId: currentAtencionId,
              pacienteId,
              userMedicoId: user.id,
              historiaClinicaId,
              diagnostico: d.nombre,
              observaciones: d.observacion,
            });
          }
        }
      }
      console.log('Datos de la consulta: trtamiento data', tratamientoData);
      // 4. Guardar/Actualizar Tratamientos
      if (tratamientoData && tratamientoData.length > 0) {
        // Eliminamos los tratamientos existentes para esta atención
        await tx.delete(tratamiento).where(eq(tratamiento.atencionesId, currentAtencionId));

        // Insertamos los nuevos tratamientos
        await tx.insert(tratamiento).values(
          tratamientoData.map(t => ({
            id: nanoid(),
            atencionId: currentAtencionId,
            pacienteId,
            userId: user.id,
            tratamiento: t.tratamiento,
            fechaInicio: t.fechaInicio ? t.fechaInicio : null,
            fechaFin: t.fechaFin ? t.fechaFin : null,
          }))
        );
      }

      // 5. Guardar Medicamentos (asumiendo que se insertan nuevos cada vez)
      // Tu interfaz Consulta tiene 'medicamentos: string[]', pero tu componente
      // ConsultaActualPantalla.tsx no tiene un input para 'medicamentos' directamente.
      // Si 'medicamentos' se refiere a los tratamientos, entonces esta sección podría no ser necesaria
      // o necesitaría ser ajustada. Por ahora, la dejo como un placeholder.
      if (medicamentos && medicamentos.length > 0) {
        await tx.insert(medicamento).values(
          medicamentos.map(m => ({
            id: nanoid(),
            historiaClinicaId: historiaClinicaId,
            userMedicoId: user.id,
            atencionId: currentAtencionId,
            pacienteId,
            nombre: m,
            dosis: m.dosis,
            frecuencia: m.frecuencia,
            duracion: m.duracion,
            precio: m.precio,
            stock: m.stock,
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
