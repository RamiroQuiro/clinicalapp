import {
  atenciones,
  diagnostico,
  medicamento,
  notasMedicas,
  signosVitales,
  turnos,
} from '@/db/schema'; // Importa las tablas necesarias
import type { APIRoute } from 'astro';

import db from '@/db';
import { logAuditEvent } from '@/lib/audit';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid'; // Para generar IDs únicos
// Helper para parsear números de forma segura
const safeParseFloat = (value: any) => {
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) ? null : num;
};

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
    console.log(
      'ingresando los datos de atencion para guardar, emepezando con la atencion',
      consultaData
    );
    const {
      turnoId,
      motivoInicial,
      pacienteId,
      historiaClinicaId,
      motivoConsulta,
      sintomas,
      signosVitales: svData,
      observaciones,
      medicamentos,
      diagnosticos,
      planSeguir,
      notas,
      tratamiento: tratamientoData,
      status,
      inicioAtencion,
      finAtencion,
      duracionAtencion,
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

    const [isConsultaFinalizada] = await db
      .select()
      .from(atenciones)
      .where(and(eq(atenciones.id, consultaData.id), eq(atenciones.estado, 'finalizada')));
    if (isConsultaFinalizada) {
      return createResponse(400, 'Consulta finalizada, crea una enmienda si es necesario');
    }

    console.log('ingresando los datos emepezando con la atencion', isConsultaFinalizada);

    let currentAtencionId = consultaData.id || nanoIDNormalizador('Aten'); // Genera un ID si no existe

    await db.transaction(async tx => {
      const fechaHoy = new Date(getFechaEnMilisegundos());
      let turnoActualizado;
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
            inicioAtencion: inicioAtencion ? new Date(inicioAtencion) : null,
            finAtencion: finAtencion ? new Date(finAtencion) : null,
            duracionAtencion: safeParseFloat(duracionAtencion),
            updated_at: fechaHoy,
            turnoId: turnoId ? turnoId : null,
            estado: status,
            ultimaModificacionPorId: user.id, //
          })
          .where(eq(atenciones.id, consultaData.id));

        [turnoActualizado] = await tx
          .update(turnos)
          .set({
            estado: status,
          })
          .where(eq(turnos.id, consultaData.turnoId))
          .returning();
      } else {
        // Insertar nueva atención
        await tx.insert(atenciones).values({
          id: currentAtencionId,
          pacienteId,
          motivoInicial,
          motivoConsulta,
          sintomas,
          ultimaModificacionPorId: user.id,
          observaciones,
          tratamiento: tratamientoData,
          planSeguir,
          turnoId: turnoId ? turnoId : null,
          historiaClinicaId,
          estado: status,
          userIdMedico: user.id,
          inicioAtencion: inicioAtencion ? new Date(inicioAtencion) : null,
          finAtencion: finAtencion ? new Date(finAtencion) : null,
          duracionAtencion: safeParseFloat(duracionAtencion),
          created_at: fechaHoy,
          updated_at: fechaHoy,
        });
      }

      console.log('empezando a ingresar los signos vitales 🖋️', svData);
      // 2. Guardar/Actualizar Signos Vitales (1 a 1 con atención)
      // Process svData to ensure all numerical fields are safely parsed
      const processedSvData = {
        tensionArterial: safeParseFloat(svData?.tensionArterial),
        frecuenciaCardiaca: safeParseFloat(svData?.frecuenciaCardiaca),
        frecuenciaRespiratoria: safeParseFloat(svData?.frecuenciaRespiratoria),
        temperatura: safeParseFloat(svData?.temperatura),
        saturacionOxigeno: safeParseFloat(svData?.saturacionOxigeno),
        peso: safeParseFloat(svData?.peso),
        talla: safeParseFloat(svData?.talla),
        imc: safeParseFloat(svData?.imc),
        glucosa: safeParseFloat(svData?.glucosa),
        // Add other numerical vital signs if any
      };

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
          .set({ ...processedSvData }) // MODIFIED to use processedSvData
          .where(eq(signosVitales.atencionId, currentAtencionId));
      } else {
        // Insertamos uno nuevo
        await tx.insert(signosVitales).values({
          id: nanoid(),
          atencionId: currentAtencionId,
          pacienteId,
          userId: user.id,
          ...processedSvData, // MODIFIED to use processedSvData
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
            estado: d.estado,
            historiaClinicaId,
            diagnostico: d.diagnostico, // Asegúrate que el frontend envíe 'diagnostico'
            observaciones: d.observaciones,
            codigoCIE: d.codigoCIE, // Y 'codigoCIE'
            ultimaModificacionPorId: user.id,
          }))
        );
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
            id: nanoIDNormalizador('Med'),
            historiaClinicaId: historiaClinicaId,
            nombreGenerico: m.nombreGenerico,
            nombreComercial: m.nombreComercial,
            dosis: safeParseFloat(m.dosis),
            frecuencia: safeParseFloat(m.frecuencia),
            atencionId: currentAtencionId,
            pacienteId,
            userMedicoId: user.id,
          }))
        );
      }

      // guardado de notas
      if (notas && notas.length > 0) {
        await tx.insert(notasMedicas).values(
          notas.map(n => ({
            id: n.id,
            atencionId: currentAtencionId,
            pacienteId,
            userMedicoId: user.id,
            title: n.title,
            descripcion: n.descripcion,
            created_at: n.created_at,
            estado: n.estado,
          }))
        );
      }

      // emitir evento de atencion guardada
      emitEvent('turno-actualizado', turnoActualizado);
    });
    const action: 'CREATE' | 'UPDATE' = consultaData.id ? 'UPDATE' : 'CREATE';
    // Auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: action,
      tableName: 'atenciones',
      recordId: currentAtencionId,
      description: `El usuario ${user.nombre}
      ${user.apellido} guardó la atención con ID
      ${currentAtencionId}. Estado: ${status}`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
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
