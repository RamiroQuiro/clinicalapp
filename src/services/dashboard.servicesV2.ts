import db from '@/db';
import { atenciones, historiaClinica, pacienteProfesional, pacientes } from '@/db/schema';
import { getInicioYFinDeMesActual } from '@/utils/timesUtils';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  try {
    // Add a try-catch block around the entire function
    // Total de pacientes asociados al doctor
    const pacientesData = await db
      .select({ total: count() })
      .from(pacienteProfesional)
      .where(eq(pacienteProfesional.userId, userId));

    const { inicio, fin } = getInicioYFinDeMesActual();
    // Atenciones del mes actual
    const atencionesMes = await db
      .select({ total: count() })
      .from(atenciones)
      .where(
        and(
          eq(atenciones.userIdMedico, userId),
          gte(atenciones.created_at, sql`strftime('%s', 'now', '-30 days')`)
        )
      );

    // Atenciones últimos 7 días agrupadas por día y motivo
    const atencionesUlt7dRaw = await db // Renamed to Raw
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

    // Promedio de duración de las atenciones en minutos
    const promedioDuracionRaw = await db // Renamed to Raw
      .select({
        promedio: sql<number>`
          AVG((julianday(${atenciones.finAtencion}) - julianday(${atenciones.inicioAtencion})) * 24 * 60)
        `,
      })
      .from(atenciones)
      .where(eq(atenciones.userIdMedico, userId));

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

    console.log('datos obtenidos', {
      pacientesData,
      atencionesMes,
      atencionesUlt7dRaw,
      motivos,
      promedioDuracionRaw,
      atencionesHoy,
      ultimasAtenciones,
    });

    return {
      pacientes: pacientesData[0]?.total ?? 0,
      atencionesMes: atencionesMes[0]?.total ?? 0,
      atencionesUlt7d: atencionesUlt7dRaw.reduce((sum, item) => sum + item.cantidad, 0), // Use Raw and ensure it's an array
      motivos: motivos || [], // Ensure it's an array
      promedioDuracion: promedioDuracionRaw[0]?.promedio // Use Raw
        ? Math.round(promedioDuracionRaw[0].promedio)
        : 0, // Ensure it's a number
      ultimasAtenciones: ultimasAtenciones || [], // Ensure it's an array
      atencionesHoy: atencionesHoy || [], // Ensure it's an array
    };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    // Return default empty/zero values on error

    return {
      pacientes: 0,
      atencionesMes: 0,
      atencionesUlt7d: 0,
      motivos: [],
      promedioDuracion: 0,
      ultimasAtenciones: [],
      atencionesHoy: [],
    };
  }
}
