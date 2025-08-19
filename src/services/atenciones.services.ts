// src/services/atenciones.service.ts

import db from '@/db';
import {
  atenciones,
  fichaPaciente,
  pacientes,
  signosVitales,
  tratamiento,
  users,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { desc, eq } from 'drizzle-orm';

export async function getDatosNuevaAtencion(pacienteId: string, atencionId: string) {
  const [atencionData] = await db.select().from(atenciones).where(eq(atenciones.id, atencionId));

  console.log('atencionData ->', atencionData);
  // Traer datos básicos del paciente
  const pacienteData = (
    await db
      .select({
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        sexo: pacientes.sexo,
        celular: fichaPaciente.celular,
        email: fichaPaciente.email,
        provincia: fichaPaciente.provincia,
        fNacimiento: pacientes.fNacimiento,
        nObraSocial: fichaPaciente.nObraSocial,
        obraSocial: fichaPaciente.obraSocial,
        ciudad: fichaPaciente.ciudad,
        grupoSanguineo: fichaPaciente.grupoSanguineo,
        estatura: fichaPaciente.estatura,
        domicilio: pacientes.domicilio,
      })
      .from(pacientes)
      .leftJoin(fichaPaciente, eq(fichaPaciente.pacienteId, pacientes.id))
      .where(eq(pacientes.id, pacienteId))
  ).at(0);
  if (!pacienteData) {
    return {
      error: true,
      message: 'Paciente no encontrado',
      data: null,
    };
  }

  // Antecedentes
  const antecedentesData = await db
    .select()
    .from(antecedentes)
    .where(eq(antecedentes.pacienteId, pacienteId));

  // Signos vitales (últimos 4)
  const fecthSignosVitalesData = await db
    .select()
    .from(signosVitales)
    .where(eq(signosVitales.pacienteId, pacienteId))
    .orderBy(desc(signosVitales.created_at))
    .limit(4);
  const signosVitalesData = [
    'temperatura',
    'pulso',
    'frecuenciaCardiaca',
    'frecuenciaRespiratoria',
    'tensionArterial',
    'saturacionOxigeno',
    'glucosa',
    'peso',
    'talla',
    'imc',
  ].map(tipo => {
    const historial = fecthSignosVitalesData.map(sv => {
      return { valor: parseFloat(sv[tipo]), fecha: sv.created_at };
    });
    return { tipo, historial };
  });

  // Historial de visitas (últimas 4 atenciones)
  const historialVisitaData = await db
    .select({
      id: atenciones.id,
      userId: atenciones.userIdMedico,
      pacienteId: atenciones.pacienteId,
      motivoConsulta: atenciones.motivoConsulta,
      motivoInicial: atenciones.motivoInicial,
      fecha: atenciones.fecha,
      tratamientoId: atenciones.tratamientoId,
      estado: atenciones.estado,
      created_at: atenciones.created_at,
      inicioAtencion: atenciones.inicioAtencion,
      finAtencion: atenciones.finAtencion,
      duracionAtencion: atenciones.duracionAtencion,
      nombreDoctor: users.nombre,
      apellidoDoctor: users.apellido,
    })
    .from(atenciones)
    .innerJoin(users, eq(users.id, atenciones.userIdMedico))
    .innerJoin(tratamiento, eq(tratamiento.id, atenciones.tratamientoId))
    .where(eq(atenciones.pacienteId, pacienteId))
    .orderBy(desc(atenciones.created_at))
    .limit(4);

  return { pacienteData, signosVitalesData, antecedentesData, historialVisitaData };
}
