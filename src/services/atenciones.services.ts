// src/services/atenciones.service.ts

import db from '@/db';
import {
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  pacientes,
  signosVitales,
  tratamiento,
  users,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { desc, eq } from 'drizzle-orm';

export async function getDatosNuevaAtencion(pacienteId: string, atencionId: string) {
  // 1. Buscar la atención por ID
  const [atencionData] = await db.select().from(atenciones).where(eq(atenciones.id, atencionId));

  if (!atencionData) {
    return {
      error: true,
      message: 'Atención no encontrada',
      data: null,
    };
  }
  const [signosVitalesAtencion] = await db
    .select({
      temperatura: signosVitales.temperatura,
      pulso: signosVitales.pulso,
      frecuenciaCardiaca: signosVitales.frecuenciaCardiaca,
      frecuenciaRespiratoria: signosVitales.frecuenciaRespiratoria,
      tensionArterial: signosVitales.tensionArterial,
      saturacionOxigeno: signosVitales.saturacionOxigeno,
      glucosa: signosVitales.glucosa,
      peso: signosVitales.peso,
      talla: signosVitales.talla,
      imc: signosVitales.imc,
    })
    .from(signosVitales)
    .where(eq(signosVitales.atencionId, atencionId))
    .orderBy(desc(signosVitales.created_at));

  const diagnosticosAtencion = await db
    .select()
    .from(diagnostico)
    .where(eq(diagnostico.atencionId, atencionId));
  const [tratamientoAtencion] = await db
    .select({
      fechaInicio: tratamiento.fechaInicio,
      fechaFin: tratamiento.fechaFin,
      tratamiento: tratamiento.tratamiento,
      descripcion: tratamiento.descripcion,
    })
    .from(tratamiento)
    .where(eq(tratamiento.atencionesId, atencionId));
  console.log('este es el tratamiento de la tencion', tratamientoAtencion);

  const medicamentosAtencion = await db
    .select()
    .from(medicamento)
    .where(eq(medicamento.atencionId, atencionId));
  // 2. Si está cerrada → devolver info mínima y aviso

  if (atencionData.estado === 'cerrada') {
    return {
      error: false,
      message: 'La atención ya está cerrada',
      data: {
        atencion: atencionData,
      },
    };
  }

  // 3. Si está en curso → traer datos completos
  const pacienteData = (
    await db
      .select({
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
        sexo: pacientes.sexo,
        celular: historiaClinica.celular,
        email: historiaClinica.email,
        provincia: historiaClinica.provincia,
        fNacimiento: pacientes.fNacimiento,
        nObraSocial: historiaClinica.nObraSocial,
        obraSocial: historiaClinica.obraSocial,
        ciudad: historiaClinica.ciudad,
        grupoSanguineo: historiaClinica.grupoSanguineo,
        estatura: historiaClinica.estatura,
        historiaClinicaId: historiaClinica.id,
        domicilio: pacientes.domicilio,
      })
      .from(pacientes)
      .leftJoin(historiaClinica, eq(historiaClinica.pacienteId, pacientes.id))
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

  // Signos vitales (últimos 4 registros)
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
    const historial = fecthSignosVitalesData.map(sv => ({
      valor: parseFloat(sv[tipo]),
      fecha: sv.created_at,
    }));
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

  return {
    error: false,
    message: 'Atención en curso',
    data: {
      atencion: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        tratamiento: tratamientoAtencion?.tratamiento || {
          fechaInicio: '',
          fechaFin: '',
          tratamiento: '',
        },
        medicamentos: medicamentosAtencion,
        signosVitales: signosVitalesAtencion,
      },
      paciente: pacienteData,
      antecedentes: antecedentesData,
      signosVitalesHistorial: signosVitalesData,
      historialVisitas: historialVisitaData,
    },
  };
}
