import db from '@/db';
import {
  archivosAdjuntos,
  atenciones,
  diagnostico,
  historiaClinica,
  medicamento,
  notasMedicas,
  pacientes,
  signosVitales,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { desc, eq } from 'drizzle-orm';

export async function getDatosNuevaAtencion(pacienteId: string, atencionId: string) {
  // 1. Buscamos la atención para verificar su estado. Esta es la única consulta inicial.
  const [atencionData] = await db.select().from(atenciones).where(eq(atenciones.id, atencionId));

  if (!atencionData) {
    return {
      error: true,
      message: 'Atención no encontrada',
      data: null,
    };
  }

  // 2. Definimos las promesas para los datos que siempre se necesitan.
  // (No se ejecutan hasta que se usa Promise.all)

  // Busca los datos del paciente y su historia clínica.
  const pacientePromise = db
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
    .where(eq(pacientes.id, pacienteId));

  // Busca los diagnósticos asociados a la atención.
  const diagnosticosPromise = db
    .select()
    .from(diagnostico)
    .where(eq(diagnostico.atencionId, atencionId));

  // Busca los medicamentos recetados en la atención.
  const medicamentosPromise = db
    .select()
    .from(medicamento)
    .where(eq(medicamento.atencionId, atencionId));

  // Busca las notas médicas de la atención.
  const notasPromise = db
    .select()
    .from(notasMedicas)
    .where(eq(notasMedicas.atencionId, atencionId));

  // Busca los archivos adjuntos a la atención.
  const archivosPromise = db
    .select()
    .from(archivosAdjuntos)
    .where(eq(archivosAdjuntos.atencionId, atencionId));

  // Busca los últimos signos vitales registrados para la atención.
  const signosVitalesPromise = db
    .select({
      temperatura: signosVitales.temperatura,
      pulso: signosVitales.pulso,
      respiracion: signosVitales.respiracion,
      presionArterial: signosVitales.presionArterial,
      saturacionOxigeno: signosVitales.saturacionOxigeno,
      glucosa: signosVitales.glucosa,
      peso: signosVitales.peso,
      talla: signosVitales.talla,
      imc: signosVitales.imc,
      frecuenciaCardiaca: signosVitales.frecuenciaCardiaca,
      frecuenciaRespiratoria: signosVitales.frecuenciaRespiratoria,
      tensionArterial: signosVitales.tensionArterial || null,
      dolor: signosVitales.dolor,
      fechaRegistro: signosVitales.fechaRegistro,
    })
    .from(signosVitales)
    .where(eq(signosVitales.atencionId, atencionId));

  // 3. Si la atención está finalizada, ejecutamos solo las promesas esenciales.
  if (atencionData.estado === 'finalizada') {
    const [
      pacienteResult,
      diagnosticosAtencion,
      medicamentosAtencion,
      notasAtencion,
      archivosAtencion,
      signosVitalesAtencion,
    ] = await Promise.all([
      pacientePromise,
      diagnosticosPromise,
      medicamentosPromise,
      notasPromise,
      archivosPromise,
      signosVitalesPromise,
    ]);

    const pacienteData = pacienteResult[0];
    if (!pacienteData) {
      return { error: true, message: 'Paciente no encontrado', data: null };
    }

    return {
      error: false,
      message: 'Atención finalizada',
      data: {
        atencion: {
          ...atencionData,
          diagnosticos: diagnosticosAtencion,
          medicamentos: medicamentosAtencion,
          archivosAdjuntos: archivosAtencion,
          signosVitales: signosVitalesAtencion[0] || null,
          notas: notasAtencion,
        },
        paciente: pacienteData,
        antecedentes: [],
        signosVitalesHistorial: [],
      },
    };
  }

  // 4. Si no está finalizada, definimos las promesas adicionales.

  // Busca todos los antecedentes del paciente.
  const antecedentesPromise = db
    .select()
    .from(antecedentes)
    .where(eq(antecedentes.pacienteId, pacienteId));

  // Busca el historial de signos vitales para los gráficos.
  const signosHistorialPromise = db
    .select()
    .from(signosVitales)
    .where(eq(signosVitales.pacienteId, pacienteId))
    .orderBy(desc(signosVitales.created_at))
    .limit(4);

  // 5. Ejecutamos TODAS las promesas juntas.
  const [
    pacienteResult,
    diagnosticosAtencion,
    medicamentosAtencion,
    notasAtencion,
    archivosAtencion,
    signosVitalesAtencion,
    antecedentesData,
    fecthSignosVitalesData,
  ] = await Promise.all([
    pacientePromise,
    diagnosticosPromise,
    medicamentosPromise,
    notasPromise,
    archivosPromise,
    signosVitalesPromise,
    antecedentesPromise,
    signosHistorialPromise,
  ]);

  const pacienteData = pacienteResult[0];
  if (!pacienteData) {
    return { error: true, message: 'Paciente no encontrado', data: null };
  }

  // 6. Procesamos los datos para los gráficos.
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

  // 7. Devolvemos la estructura de datos completa.
  return {
    error: false,
    message: 'Atención en curso',
    data: {
      atencion: {
        ...atencionData,
        diagnosticos: diagnosticosAtencion,
        medicamentos: medicamentosAtencion,
        archivosAdjuntos: archivosAtencion,
        signosVitales: signosVitalesAtencion[0] || null,
        notas: notasAtencion,
      },
      paciente: pacienteData,
      antecedentes: antecedentesData,
      signosVitalesHistorial: signosVitalesData,
    },
  };
}
