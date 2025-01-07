import type { APIRoute } from "astro";
import db from "../../../../db";
import { eq } from "drizzle-orm";
import {
  atenciones,
  diagnostico,
  medicamento,
  pacientes,
  signosVitales,
} from "../../../../db/schema";
import { generateId } from "lucia";
import calcularIMC from "../../../../utils/calcularIMC";

export const POST: APIRoute = async ({ request }) => {
  const{data:{dataIds,tratamiento,motivoConsulta,signosVitales: dataSignosVitales,diagnosticos: dataDiagnosticos,medicamentos: dataMedicamentos,motivoInicial}} = await request.json();

  console.log(motivoInicial)
  try {
    
    const isExistPaciente=(await db.select().from(pacientes).where(eq(pacientes.id,dataIds.pacienteId))).at(0)

    if (!isExistPaciente) {
      return new Response(
        JSON.stringify({ status: 404, msg: "No existe el paciente" }),
        { status: 404 }
      );
    }

    // Validar datos esenciales
    if (!dataIds.userId || !dataIds.pacienteId || !dataIds.atencionId) {
      return new Response(
        JSON.stringify({ status: 400, msg: "Faltan datos obligatorios" }),
        { status: 400 }
      );
    }

    
    // Transacción
    const transaction = await db.transaction(async (tx) => {
      await tx.insert(atenciones).values({
        id: dataIds.atencionId,
        pacienteId: dataIds.pacienteId,
        userId: dataIds.userId,
        fecha: new Date().toISOString(),
        inicioAtencion:dataIds.inicioAtencion,
        tratamiento,
        motivoConsulta,
        motivoInicial
      });

      const idSignos = generateId(13);
      const imc=calcularIMC(dataSignosVitales.peso,isExistPaciente.estatura)
      dataSignosVitales.imc=imc 

      await tx.insert(signosVitales).values({
        id: idSignos,
        atencionId:dataIds.atencionId,
        pacienteId:dataIds.pacienteId,
        userId:dataIds.userId,
        imc:dataDiagnosticos.imc,
        ...dataSignosVitales,
      });

      await Promise.all(
        dataDiagnosticos.map((diag) =>
          tx.insert(diagnostico).values({
            id: generateId(12),
            diagnostico: diag.diagnostico,
            observaciones: diag.observaciones,
            pacienteId: dataIds.pacienteId,
            atencionId:dataIds.atencionId,
            userId: dataIds.userId,
          })
        )
      );

      await Promise.all(
        dataMedicamentos.map((med) =>
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

    return new Response(
      JSON.stringify({ status: 200, msg: "Atención cerrada con éxito" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cerrar atención:", error);
    return new Response(
      JSON.stringify({ status: 500, msg: "Error al cerrar atención: " + error.message }),
      { status: 500 }
    );
  }
};
