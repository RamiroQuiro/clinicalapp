import db from '@/db';
import { atenciones, historiaClinica, pacienteProfesional, pacientes } from '@/db/schema';
import { getInicioYFinDeMesActual } from '@/utils/timesUtils';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  // Total de pacientes asociados al doctor
  const pacientesData = await db
    .select({ total: count() })
    .from(pacienteProfesional)
    .where(eq(pacienteProfesional.userId, userId));

  const { inicio, fin } = getInicioYFinDeMesActual();
  console.log('inicio y fin del mes', inicio, fin);
  // Atenciones del mes actual
  const atencionesMes = await db
    .select({ total: count() })
    .from(atenciones)
    .where(
      and(
        eq(atenciones.userIdMedico, userId),
        gte(atenciones.created_at, new Date(inicio * 1000)),
        lte(atenciones.created_at, new Date(fin * 1000))
      )
    );

  // Atenciones últimos 7 días agrupadas por día y motivo
  const atencionesUlt7d = await db
    .select({
      fecha: sql<string>`DATE(${atenciones.created_at})`.as('fecha'),
      motivoInicial: atenciones.motivoInicial,
      cantidad: count(),
    })
    .from(atenciones)
    .where(
      and(
        eq(atenciones.userIdMedico, userId),
        gte(atenciones.created_at, sql`strftime('%s', 'now', '-30 days')`)
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
  const promedioDuracion = await db
    .select({
      promedio: sql<number>`
        AVG((julianday(${atenciones.finAtencion}) - julianday(${atenciones.inicioAtencion})) * 24 * 60)
      `,
    })
    .from(atenciones)
    .where(eq(atenciones.userIdMedico, userId));

  // Atenciones del día, clasificadas por turno
  const inicioDia = sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', 'start of day')`; // Use ISO format for comparison
  const finDia = sql`strftime('%Y-%m-%dT%H:%M:%fZ', 'now', 'start of day', '+1 day')`; // Use ISO format for comparison

  const atencionesHoy = await db
    .select({
      id: atenciones.id,
      pacienteId: atenciones.pacienteId,
      // Use inicioConsulta for the main date/time reference
      fecha: atenciones.created_at, // Use inicioConsulta as the primary date field
      motivoInicial: atenciones.motivoInicial,
      turno: sql`
        CASE
          WHEN CAST(strftime('%H', ${atenciones.created_at}) AS INTEGER) < 13
          THEN 'Mañana'
          ELSE 'Tarde'
        END
      `.as('turno'),
    })
    .from(atenciones)
    .where(
      and(
        eq(atenciones.userIdMedico, userId),
        // Compare ISO strings directly
        gte(atenciones.created_at, inicioDia),
        lte(atenciones.created_at, finDia)
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

  return {
    pacientes: pacientesData[0]?.total ?? 0,
    atencionesMes: atencionesMes[0]?.total ?? 0,
    atencionesUlt7d,
    motivos,
    promedioDuracion: promedioDuracion[0]?.promedio
      ? Math.round(promedioDuracion[0].promedio)
      : null,
    ultimasAtenciones,
    atencionesHoy,
  };
}
