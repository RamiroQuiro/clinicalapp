import db from '@/db';
import { atenciones, historiaClinica, pacienteProfesional, pacientes } from '@/db/schema';
import {
  getInicioYFinDeMesActual,
  getInicioYFinDeMesAnterior,
  getUltimosNDias,
} from '@/utils/timesUtils';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string, centroMedicoId: string) {
  // --- 1. RANGOS DE FECHAS ---
  const mesActual = getInicioYFinDeMesActual();
  const mesAnterior = getInicioYFinDeMesAnterior();
  const ultimos7dias = getUltimosNDias(7);

  const inicioMesActual = new Date(mesActual.inicio);
  const finMesActual = new Date(mesActual.fin);
  const inicioMesAnterior = new Date(mesAnterior.inicio * 1000);
  const finMesAnterior = new Date(mesAnterior.fin * 1000);
  const inicioUltimos7dias = new Date(ultimos7dias.desde);
  const finUltimos7dias = new Date(ultimos7dias.hasta);

  // --- 2. QUERIES EN PARALELO ---
  const [
    pacientesData,
    atencionesMes,
    atencionesMesPasado,
    nuevosPacientesMes,
    nuevosPacientesMesPasado,
    atencionesUlt7d,
    motivos,
    promedioDuracion,
    atencionesHoy,
  ] = await Promise.all([
    // 0️⃣ Total pacientes históricos
    db.select({ total: count() })
      .from(pacienteProfesional)
      .where(and(
        eq(pacienteProfesional.userId, userId),
        eq(pacienteProfesional.centroMedicoId, centroMedicoId)
      )),

    // 1️⃣ Atenciones del mes actual
    db.select({ total: count() })
      .from(atenciones)
      .where(and(
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId),
        gte(atenciones.fecha, inicioMesActual),
        lte(atenciones.fecha, finMesActual)
      )),

    // 2️⃣ Atenciones del mes pasado
    db.select({ total: count() })
      .from(atenciones)
      .where(and(
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId),
        gte(atenciones.fecha, inicioMesAnterior),
        lte(atenciones.fecha, finMesAnterior)
      )),

    // 3️⃣ Nuevos pacientes del mes actual
    db.select({ total: count() })
      .from(pacientes)
      .innerJoin(pacienteProfesional, eq(pacienteProfesional.pacienteId, pacientes.id))
      .where(and(
        eq(pacienteProfesional.userId, userId),
        eq(pacienteProfesional.centroMedicoId, centroMedicoId), // CORREGIDO
        gte(pacientes.created_at, inicioMesActual),
        lte(pacientes.created_at, finMesActual)
      )),

    // 4️⃣ Nuevos pacientes del mes pasado
    db.select({ total: count() })
      .from(pacientes)
      .innerJoin(pacienteProfesional, eq(pacienteProfesional.pacienteId, pacientes.id))
      .where(and(
        eq(pacienteProfesional.userId, userId),
        eq(pacienteProfesional.centroMedicoId, centroMedicoId), // CORREGIDO
        gte(pacientes.created_at, inicioMesAnterior),
        lte(pacientes.created_at, finMesAnterior)
      )),

    // 5️⃣ Atenciones últimos 7 días
    db.select({
      id: atenciones.id,
      pacienteId: atenciones.pacienteId,
      nombrePaciente: sql`(pacientes.nombre || ' ' || pacientes.apellido)`,
      fecha: atenciones.fecha,
      motivoInicial: atenciones.motivoInicial,
      inicioAtencion: atenciones.inicioAtencion,
      finAtencion: atenciones.finAtencion,
      obraSocial: historiaClinica.obraSocial,
      estado: atenciones.estado,
    })
      .from(atenciones)
      .innerJoin(pacientes, eq(pacientes.id, atenciones.pacienteId))
      .innerJoin(historiaClinica, eq(historiaClinica.pacienteId, atenciones.pacienteId))
      .where(and(
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId), // CORREGIDO
        gte(atenciones.fecha, inicioUltimos7dias), // CORREGIDO
        lte(atenciones.fecha, finUltimos7dias) // CORREGIDO
      ))
      .orderBy(desc(atenciones.fecha))
      .limit(20),

    // 6️⃣ Motivos más frecuentes
    db.select({
      motivoInicial: atenciones.motivoInicial,
      cantidad: count(),
    })
      .from(atenciones)
      .where(and( // CORREGIDO
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId)
      ))
      .groupBy(atenciones.motivoInicial)
      .orderBy(desc(count()))
      .limit(5),

    // 7️⃣ Promedio duración (en minutos)
    db.select({
      promedio: sql<number>`AVG(((${atenciones.finAtencion} - ${atenciones.inicioAtencion}) / 60.0))`,
    })
      .from(atenciones)
      .where(and( // CORREGIDO
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId)
      )),

    // 8️⃣ Atenciones del día (turno mañana/tarde)
    db.select({
      id: atenciones.id,
      pacienteId: atenciones.pacienteId,
      fecha: atenciones.fecha,
      motivoInicial: atenciones.motivoInicial,
      turno: sql<string>`
        CASE 
          WHEN CAST(strftime('%H', datetime(${atenciones.fecha}, 'unixepoch')) AS INTEGER) < 13 
          THEN 'Mañana' 
          ELSE 'Tarde' 
        END
      `,
    })
      .from(atenciones)
      .where(and(
        eq(atenciones.userIdMedico, userId),
        eq(atenciones.centroMedicoId, centroMedicoId), // CORREGIDO
        gte(atenciones.fecha, sql`strftime('%s', date('now', 'start of day'))`), // CORREGIDO
        lte(atenciones.fecha, sql`strftime('%s', date('now', '+1 day', 'start of day', '-1 second'))`) // CORREGIDO
      )),
  ]);

  // --- 3. PROCESAMIENTO ---
  const ultimasAtencionesProcesadas = atencionesUlt7d
    .map(a => ({
      ...a,
      fecha: a.fecha instanceof Date ? a.fecha.toISOString() : a.fecha,
    }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .slice(0, 10);

  // --- 4. RETORNO ---
  return {
    stats: [
      {
        id: 'consultasHoy',
        title: 'Consultas Hoy',
        value: atencionesHoy.length,
        atencionesHoy,
      },
      {
        id: 'totalPacientes',
        title: 'Pacientes',
        value: pacientesData[0]?.total ?? 0,
        pacienteMesActual: nuevosPacientesMes[0]?.total ?? 0,
        pacienteMesAnterior: nuevosPacientesMesPasado[0]?.total ?? 0,
      },
      {
        id: 'atencionesMes',
        title: 'Atenciones del Mes',
        value: atencionesMes[0]?.total ?? 0,
        atencionesMesPasado: atencionesMesPasado[0]?.total ?? 0,
      },
      {
        id: 'promedioDuracion',
        title: 'Promedio Duracion',
        value: promedioDuracion[0]?.promedio ?? 0,
        promedioDuracionMesAnterior: promedioDuracion[0]?.promedio ?? 0,
      },
    ],
    atencionesUlt7d,
    motivos,
    ultimasAtenciones: ultimasAtencionesProcesadas,
  };
}
