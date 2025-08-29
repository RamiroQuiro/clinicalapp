import db from '@/db';
import { atenciones, historiaClinica, pacienteProfesional, pacientes } from '@/db/schema';
import { getInicioYFinDeMesActual, getInicioYFinDeMesAnterior } from '@/utils/timesUtils';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  try {
    // Current Month Data
    const { inicio: inicioMesActual, fin: finMesActual } = getInicioYFinDeMesActual();

    // Previous Month Data
    const { inicio: inicioMesAnterior, fin: finMesAnterior } = getInicioYFinDeMesAnterior();

    // Total de pacientes asociados al doctor (actual)
    const pacientesData = await db
      .select({ total: count() })
      .from(pacienteProfesional)
      .where(eq(pacienteProfesional.userId, userId));

    // Total de pacientes asociados al doctor (mes anterior)
    const pacientesDataMesAnterior = await db
      .select({ total: count() })
      .from(pacienteProfesional)
      .where(
        and(
          eq(pacienteProfesional.userId, userId),
          lte(pacienteProfesional.created_at, sql`${finMesAnterior}`) // Assuming created_at is comparable to timestamp
        )
      );

    // Atenciones del mes actual
    const atencionesMes = await db
      .select({ total: count() })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, sql`${inicioMesActual}`),
          lte(atenciones.created_at, sql`${finMesActual}`)
        )
      );

    // Atenciones del mes anterior
    const atencionesMesAnterior = await db
      .select({ total: count() })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, sql`${inicioMesAnterior}`),
          lte(atenciones.created_at, sql`${finMesAnterior}`)
        )
      );

    // Atenciones últimos 7 días agrupadas por día y motivo (kept for now, but will be replaced by atencionesSemana)
    const atencionesUlt7dRaw = await db
      .select({
        fecha: sql<string>`DATE(${atenciones.created_at})`.as('fecha'),
        motivoInicial: atenciones.motivoInicial,
        cantidad: count(),
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, sql`strftime('%s', 'now', '-7 days')`)
        )
      )
      .groupBy(sql`DATE(${atenciones.created_at})`, atenciones.motivoInicial);

    // Motivos más frecuentes
    const motivos = await db
      .select({
        motivoInicial: atenciones.motivoInicial,
        cantidad: count(),
      })
      .from(atenciones)
      .where(eq(atenciones.userIdMedico, userId))
      .groupBy(atenciones.motivoInicial)
      .orderBy(desc(count()))
      .limit(5);

    // Promedio de duración de las atenciones en minutos (actual)
    const promedioDuracionRaw = await db
      .select({
        promedio: sql<number>`
          AVG((julianday(${atenciones.finAtencion}) - julianday(${atenciones.inicioAtencion})) * 24 * 60)
        `,
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.inicioAtencion, sql`${inicioMesActual}`),
          lte(atenciones.inicioAtencion, sql`${finMesActual}`)
        )
      );

    // Promedio de duración de las atenciones en minutos (mes anterior)
    const promedioDuracionMesAnteriorRaw = await db
      .select({
        promedio: sql<number>`
          AVG((julianday(${atenciones.finAtencion}) - julianday(${atenciones.inicioAtencion})) * 24 * 60)
        `,
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.inicioAtencion, sql`${inicioMesAnterior}`),
          lte(atenciones.inicioAtencion, sql`${finMesAnterior}`)
        )
      );

    // Atenciones del día, clasificadas por turno
    const inicioDia = sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', 'start of day')`;
    const finDia = sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', 'start of day', '+1 day')`;

    const atencionesHoy = await db
      .select({
        id: atenciones.id,
        pacienteId: atenciones.pacienteId,
        fecha: atenciones.inicioAtencion,
        motivoInicial: atenciones.motivoInicial,
        turno: sql`
          CASE
            WHEN CAST(strftime('%H', ${atenciones.inicioAtencion}) AS INTEGER) < 13
            THEN 'Mañana'
            ELSE 'Tarde'
          END
        `.as('turno'),
      })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.inicioAtencion, inicioDia),
          lte(atenciones.inicioAtencion, finDia)
        )
      );

    // Últimas 10 atenciones (con datos del paciente)
    const ultimasAtenciones = await db
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
      .limit(10);

    // Calculate changes
    const currentPacientes = pacientesData[0]?.total ?? 0;
    const prevPacientes = pacientesDataMesAnterior[0]?.total ?? 0;
    const pacientesCambio = prevPacientes === 0 ? (currentPacientes > 0 ? 100 : 0) : ((currentPacientes - prevPacientes) / prevPacientes) * 100;

    const currentAtencionesMes = atencionesMes[0]?.total ?? 0;
    const prevAtencionesMes = atencionesMesAnterior[0]?.total ?? 0;
    const atencionesCambio = prevAtencionesMes === 0 ? (currentAtencionesMes > 0 ? 100 : 0) : ((currentAtencionesMes - prevAtencionesMes) / prevAtencionesMes) * 100;

    const currentPromedioDuracion = promedioDuracionRaw[0]?.promedio ? Math.round(promedioDuracionRaw[0].promedio) : 0;
    const prevPromedioDuracion = promedioDuracionMesAnteriorRaw[0]?.promedio ? Math.round(promedioDuracionMesAnteriorRaw[0].promedio) : 0;
    const promedioDuracionCambio = prevPromedioDuracion === 0 ? (currentPromedioDuracion > 0 ? 100 : 0) : ((currentPromedioDuracion - prevPromedioDuracion) / prevPromedioDuracion) * 100;


    console.log('datos obtenidos', {
      pacientesData,
      atencionesMes,
      atencionesUlt7dRaw, // This will be replaced by atencionesSemana later
      motivos,
      promedioDuracionRaw,
      atencionesHoy,
      ultimasAtenciones,
      pacientesDataMesAnterior,
      atencionesMesAnterior,
      promedioDuracionMesAnteriorRaw,
    });

    return {
      pacientes: currentPacientes,
      pacientesCambio: parseFloat(pacientesCambio.toFixed(2)),
      atencionesMes: currentAtencionesMes,
      atencionesCambio: parseFloat(atencionesCambio.toFixed(2)),
      atencionesUlt7d: atencionesUlt7dRaw.reduce((sum, item) => sum + item.cantidad, 0), // This will be replaced by atencionesSemana later
      motivos: motivos || [],
      promedioDuracion: currentPromedioDuracion,
      promedioDuracionCambio: parseFloat(promedioDuracionCambio.toFixed(2)),
      ultimasAtenciones: ultimasAtenciones || [],
      atencionesHoy: atencionesHoy || [],
    };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return {
      pacientes: 0,
      pacientesCambio: 0,
      atencionesMes: 0,
      atencionesCambio: 0,
      atencionesUlt7d: 0,
      motivos: [],
      promedioDuracion: 0,
      promedioDuracionCambio: 0,
      ultimasAtenciones: [],
      atencionesHoy: [],
    };
  }
}
