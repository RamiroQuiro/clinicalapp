import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import db from "../../../../db";
import { signosVitales } from "../../../../db/schema/signosVitales";

type MotivoConsultaType = {
  id: string;
  motivo: string;
  pacienteId: string;
  hcId?: string;
  userId: string;
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  console.log("este es el enpoint", data);
  const hcId = data.get("hcId");
  const peso= data.get('peso')
  const imc=data.get('imc')
  const temperatura=data.get('temperatura')
  const tensionArterial=data.get('tensionArterial')
  try {
    const isExtis = (await db.select().from(signosVitales).where(eq(signosVitales.historiaClinicaId, hcId))).at(0);
    console.log('exite hc?',isExtis)
    if (!isExtis) {
      return new Response(
        JSON.stringify({
          status: 400,
          mg: "Error al crear el motivo de consulta",
        })
      );
    }
const updateHC=await db.update(signosVitales).set({
    peso:peso,
    imc,
    temperatura,
    tensionArterial
}).where(eq(signosVitales.historiaClinicaId,hcId))
    console.log(updateHC)
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "signos guardador correctamente",
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        mg: "Error al crear el motivo de consulta",
      })
    );
  }
};
