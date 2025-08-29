import db from '@/db';
import { atenciones, historiaClinica, pacienteProfesional, pacientes } from '@/db/schema';
import {
  getInicioYFinDeMesActual,
  getInicioYFinDeMesAnterior,
  getUltimosNDias,
} from '@/utils/timesUtils';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  // --- 1. RANGOS DE FECHAS ---
  // Obtener timestamps
  const mesActualTimestamps = getInicioYFinDeMesActual(); // Devuelve ms
  const mesAnteriorTimestamps = getInicioYFinDeMesAnterior(); // Devuelve segundos
  const ultimos7diasTimestamps = getUltimosNDias(7);

  // Convertir a strings ISO para consistencia en las queries
  const inicioUltimos7dias = new Date(ultimos7diasTimestamps.desde);
  console.log('inicioUltimos7dias', inicioUltimos7dias);
  const finUltimos7dias = new Date(ultimos7diasTimestamps.hasta);
  console.log('finUltimos7dias', finUltimos7dias);
  const inicioMesActual = new Date(mesActualTimestamps.inicio);
  console.log('inicioMesActual', inicioMesActual);
  const finMesActual = new Date(mesActualTimestamps.fin);
  console.log('finMesActual', finMesActual);
  const inicioMesAnterior = new Date(mesAnteriorTimestamps.inicio * 1000);
  console.log('inicioMesAnterior', inicioMesAnterior);
  const finMesAnterior = new Date(mesAnteriorTimestamps.fin * 1000);
  console.log('finMesAnterior', finMesAnterior);

  // --- 2. EJECUCIÓN DE QUERIES EN PARALELO ---
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
    ultimasAtenciones,
  ] = await Promise.all([
    // Query 0: Total de pacientes (histórico)
    db
      .select({ total: count() })
      .from(pacienteProfesional)
      .where(eq(pacienteProfesional.userId, userId)),

    // Query 1: Atenciones del mes actual
    db
      .select({ total: count() })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, inicioMesActual),
          lte(atenciones.created_at, finMesActual)
        )
      ),

    // Query 2: Atenciones del mes pasado
    db
      .select({ total: count() })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, inicioMesAnterior),
          lte(atenciones.created_at, finMesAnterior)
        )
      ),

    // Query 3: Nuevos pacientes del mes actual
    db
      .select({ total: count() })
      .from(pacientes)
      .innerJoin(pacienteProfesional, eq(pacienteProfesional.pacienteId, pacientes.id))
      .where(
        and(
          eq(pacienteProfesional.userId, userId),
          gte(pacientes.created_at, inicioMesActual),
          lte(pacientes.created_at, finMesActual)
        )
      ),

    // Query 4: Nuevos pacientes del mes pasado
    db
      .select({ total: count() })
      .from(pacientes)
      .innerJoin(pacienteProfesional, eq(pacienteProfesional.pacienteId, pacientes.id))
      .where(
        and(
          eq(pacienteProfesional.userId, userId),
          gte(pacientes.created_at, inicioMesAnterior),
          lte(pacientes.created_at, finMesAnterior)
        )
      ),

    // Query 5: Atenciones últimos 7 días (periodo móvil)
    db
      .select({
        fecha: atenciones.fecha,
        motivoInicial: atenciones.motivoInicial,
        cantidad: count(),
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, inicioUltimos7dias),
          lte(atenciones.created_at, finUltimos7dias)
        )
      )
      .groupBy(sql`DATE(${atenciones.created_at})`, atenciones.motivoInicial),

    // Query 6: Motivos más frecuentes (histórico)
    db
      .select({
        motivoInicial: atenciones.motivoInicial,
        cantidad: count(),
      })
      .from(atenciones)
      .where(eq(atenciones.userIdMedico, userId))
      .groupBy(atenciones.motivoInicial)
      .orderBy(desc(count()))
      .limit(5),

    // Query 7: Promedio de duración de las atenciones en minutos (histórico)
    db
      .select({
        promedio: sql<number>`AVG((julianday(finAtencion) - julianday(inicioAtencion)) * 24 * 60)`,
      })
      .from(atenciones)
      .where(eq(atenciones.userIdMedico, userId)),

    // Query 8: Atenciones del día
    db
      .select({
        id: atenciones.id,
        pacienteId: atenciones.pacienteId,
        fecha: atenciones.created_at,
        motivoInicial: atenciones.motivoInicial,
        turno:
          sql<string>`CASE WHEN CAST(strftime('%H', ${atenciones.created_at}) AS INTEGER) < 13 THEN 'Mañana' ELSE 'Tarde' END`.as(
            'turno'
          ),
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, sql`strftime('%Y-%m-%dT00:00:00Z', 'now')`),
          lte(atenciones.created_at, sql`strftime('%Y-%m-%dT23:59:59Z', 'now')`)
        )
      ),

    // Query 9: Últimas 10 atenciones
    db
      .select({
        id: atenciones.id,
        fecha: atenciones.created_at,
        motivoInicial: atenciones.motivoInicial,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        obraSocial: historiaClinica.obraSocial,
      })
      .from(atenciones)
      .innerJoin(historiaClinica, eq(historiaClinica.id, atenciones.historiaClinicaId))
      .innerJoin(pacientes, eq(pacientes.id, historiaClinica.pacienteId))
      .where(eq(atenciones.userIdMedico, userId))
      .orderBy(desc(atenciones.created_at))
      .limit(10),
  ]);

  console.log('data dashboard', {
    pacientesData,
    atencionesMes,
    atencionesMesPasado,
    nuevosPacientesMes,
    nuevosPacientesMesPasado,
    atencionesUlt7d,
    motivos,
    promedioDuracion,
    atencionesHoy,
  });

  // --- 3. PROCESAMIENTO Y RETORNO DE DATOS ---
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
    ultimasAtenciones,
  };
}
