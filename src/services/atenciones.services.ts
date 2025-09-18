import db from '@/db';
import {
  archivosAdjuntos,
  atencionAmendments,
  atenciones,
  derivaciones,
  diagnostico,
  historiaClinica,
  medicamento,
  notasMedicas,
  pacientes,
  signosVitales,
  users,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { ordenesEstudio } from '@/db/schema/ordenesEstudio';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { and, desc, eq } from 'drizzle-orm';

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

  // Busca los datos del medico que atendio
  const medicoPromise = db
    .select({
      id: users.id,
      nombre: users.nombre,
      apellido: users.apellido,
      email: users.email,
      celular: users.celular,
      mp: users.mp,
    })
    .from(users)
    .where(eq(users.id, atencionData.userIdMedico));

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
      presionSiscolica: signosVitales.presionSiscolica,
      presionDiastolica: signosVitales.presionDiastolica,
      perimetroAbdominal: signosVitales.perimetroAbdominal,
      perimetroCefalico: signosVitales.perimetroCefalico,
      saturacionOxigeno: signosVitales.saturacionOxigeno,
      glucosa: signosVitales.glucosa,
      peso: signosVitales.peso,
      talla: signosVitales.talla,
      imc: signosVitales.imc,
      frecuenciaCardiaca: signosVitales.frecuenciaCardiaca,
      frecuenciaRespiratoria: signosVitales.frecuenciaRespiratoria,
      dolor: signosVitales.dolor,
      fechaRegistro: signosVitales.fechaRegistro,
    })
    .from(signosVitales)
    .where(eq(signosVitales.atencionId, atencionId));

  // buscamos las solicitdes
  const estudiosSolicitadosPromise = db
    .select()
    .from(ordenesEstudio)
    .where(eq(ordenesEstudio.atencionId, atencionId));

  const derivacionesPromise = db
    .select()
    .from(derivaciones)
    .where(eq(derivaciones.atencionId, atencionId));

  // Busca las enmiendas de la atención.
  const enmiendasPromise = db
    .select()
    .from(atencionAmendments)
    .where(eq(atencionAmendments.atencionId, atencionId))
    .orderBy(desc(atencionAmendments.created_at));

  // 3. Si la atención está finalizada, ejecutamos solo las promesas esenciales.
  if (atencionData.estado === 'finalizada') {
    const [
      pacienteResult,
      diagnosticosAtencion,
      medicamentosAtencion,
      notasAtencion,
      archivosAtencion,
      signosVitalesAtencion,
      enmiendasAtencion,
      medicoAtencion,
      estudiosSolicitadosAtencion,
      derivacionesAtencion,
    ] = await Promise.all([
      pacientePromise,
      diagnosticosPromise,
      medicamentosPromise,
      notasPromise,
      archivosPromise,
      signosVitalesPromise,
      enmiendasPromise,
      medicoPromise,
      estudiosSolicitadosPromise,
      derivacionesPromise,
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
          medico: medicoAtencion[0],
          diagnosticos: diagnosticosAtencion,
          medicamentos: medicamentosAtencion,
          archivosAdjuntos: archivosAtencion,
          signosVitales: signosVitalesAtencion[0] || null,
          notas: notasAtencion,
          enmiendas: enmiendasAtencion,
          estudiosSolicitados: estudiosSolicitadosAtencion,
          derivaciones: derivacionesAtencion,
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

  // buscamos la preferencias del medico para la atencion

  const preferenciasPromise = db
    .select()
    .from(preferenciaPerfilUser)
    .where(
      and(
        eq(preferenciaPerfilUser.userId, atencionData.userIdMedico),
        eq(preferenciaPerfilUser.estado, 'activo')
      )
    );

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
    preferenciasPerfilUserData,
    estudiosSolicitadosAtencion,
    derivacionesAtencion,
  ] = await Promise.all([
    pacientePromise,
    diagnosticosPromise,
    medicamentosPromise,
    notasPromise,
    archivosPromise,
    signosVitalesPromise,
    antecedentesPromise,
    signosHistorialPromise,
    preferenciasPromise,
    estudiosSolicitadosPromise,
    derivacionesPromise,
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
    'presiónArterial',
    'presiónDiastolica',
    'perimetroAbdominal',
    'perimetroCefalico',
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
      preferenciasPerfilUser: preferenciasPerfilUserData[0] || {},
    },
  };
}
