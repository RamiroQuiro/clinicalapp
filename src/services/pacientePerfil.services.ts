// services/pacientes.service.ts
import db from '@/db';
import {
  archivosAdjuntos,
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  notasMedicas,
  pacientes,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { desc, eq } from 'drizzle-orm';

function generateColor(index: number) {
  const colors = ['#A5CDFE38', '#DCECFF45', '#FCE3D54C', '#FFD2B2BD', '#E25B3250'];
  return colors[index % colors.length];
}

export async function getPacienteData(pacienteId: string, userId: string) {
  try {
    // Ejecutar consultas en paralelo
    const [
      pacienteDataRaw,
      medicamentosData,
      historialVisitas,
      arrayAntecedente,
      arrayArchivosAdjuntos,
      arrayNotasMedicas,
    ] = await Promise.all([
      // datos del paciente
      db
        .select({
          nombre: pacientes.nombre,
          apellido: pacientes.apellido,
          dni: pacientes.dni,
          sexo: pacientes.sexo,
          celular: historiaClinica.celular,
          email: historiaClinica.email,
          fNacimiento: pacientes.fNacimiento,
          obraSocial: historiaClinica.obraSocial,
          nObraSocial: historiaClinica.nObraSocial,
          ciudad: historiaClinica.ciudad,
          provincia: historiaClinica.provincia,
          grupoSanguineo: historiaClinica.grupoSanguineo,
          estatura: historiaClinica.estatura,
          domicilio: pacientes.domicilio,
        })
        .from(pacientes)
        .innerJoin(historiaClinica, eq(historiaClinica.pacienteId, pacienteId))
        .where(eq(pacientes.id, pacienteId)),

      // medicamentos
      db
        .select()
        .from(medicamento)
        .where(eq(medicamento.pacienteId, pacienteId))
        .orderBy(desc(medicamento.created_at)),

      // historial de visitas
      db
        .select({
          id: atenciones.id,
          fecha: atenciones.created_at,
          motivo: atenciones.motivoConsulta,
        })
        .from(atenciones)
        .innerJoin(diagnostico, eq(diagnostico.atencionId, atenciones.id))
        .where(eq(atenciones.pacienteId, pacienteId))
        .groupBy(atenciones.id)
        .orderBy(desc(atenciones.created_at)),

      // antecedentes
      db.select().from(antecedentes).where(eq(antecedentes.pacienteId, pacienteId)),

      // archivos adjuntos
      db
        .select()
        .from(archivosAdjuntos)
        .where(eq(archivosAdjuntos.pacienteId, pacienteId))
        .orderBy(desc(archivosAdjuntos.created_at)),

      // notas médicas
      db
        .select()
        .from(notasMedicas)
        .where(eq(notasMedicas.pacienteId, pacienteId))
        .orderBy(desc(notasMedicas.created_at)),
    ]);

    const pacienteData = pacienteDataRaw.at(0);
    console.log('paciente en el getData ', pacienteData);
    if (!pacienteData) {
      throw new Error('Paciente no encontrado');
    }

    // Colores para visitas
    const colorMap = historialVisitas.reduce<Record<string, string>>((map, atencion, index) => {
      map[atencion.id] = generateColor(index);
      return map;
    }, {});

    return {
      pacienteData,
      medicamentosData,
      historialVisitas,
      arrayAntecedente,
      arrayArchivosAdjuntos,
      arrayNotasMedicas,
      colorMap,
    };
  } catch (error) {
    console.error('Error en getPacienteData:', error);
    throw new Error('Ocurrió un error al procesar la solicitud');
  }
}
