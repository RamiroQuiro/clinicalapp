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
    .select({
      id: diagnostico.id,
      diagnostico: diagnostico.diagnostico,
      observaciones: diagnostico.observaciones,
      codigoCIE: diagnostico.codigoCIE,
      createdAt: diagnostico.created_at,
      updatedAt: diagnostico.updated_at,
    })
    .from(diagnostico)
    .where(eq(diagnostico.atencionId, atencionId));

  const [tratamientoAtencion] = await db
    .select({
      id: tratamiento.id,
      fechaInicio: tratamiento.fechaInicio,
      fechaFin: tratamiento.fechaFin,
      tratamiento: tratamiento.tratamiento,
      descripcion: tratamiento.descripcion,
    })
    .from(tratamiento)
    .where(eq(tratamiento.atencionesId, atencionId));

  const medicamentosAtencion = await db
    .select({
      id: medicamento.id,
      nombreGenerico: medicamento.nombreGenerico,
      nombreComercial: medicamento.nombreComercial,
      dosis: medicamento.dosis,
      frecuencia: medicamento.frecuencia,
      createdAt: medicamento.created_at,
      updatedAt: medicamento.updated_at,
    })
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
        id: pacientes.id,
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
    .select({
      id: antecedentes.id,
      antecedente: antecedentes.antecedente,
      pacienteId: antecedentes.pacienteId,
      observaciones: antecedentes.observaciones,
      estado: antecedentes.estado,
      tipo: antecedentes.tipo,
      fechaDiagnostico: antecedentes.fechaDiagnostico,
      userId: antecedentes.userId,
    })
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

  return {
    error: false,
    message: 'Atención en curso',
    data: {
      atencion: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        tratamiento: tratamientoAtencion || {
          fechaInicio: '',
          fechaFin: '',
          tratamiento: '',
        },
        medicamentos: medicamentosAtencion,
        signosVitales: signosVitalesAtencion || {
          tensionArterial: 0,
          frecuenciaCardiaca: 0,
          frecuenciaRespiratoria: 0,
          temperatura: 0,
          saturacionOxigeno: 0,
          glucosa: 0,
          peso: 0,
          talla: 0,
          imc: 0,
        },
      },
      paciente: pacienteData,
      antecedentes: antecedentesData,
      signosVitalesHistorial: signosVitalesData,
    },
  };
}
