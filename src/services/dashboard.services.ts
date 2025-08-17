import db from '@/db';
import {
  atenciones,
  doctoresPacientes,
  fichaPaciente,
  historiaClinica,
  pacientes,
} from '@/db/schema';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';

export async function getDashboardData(userId: string) {
  // Total de pacientes asociados al doctor
  const pacientesData = await db
    .select({ total: count() })
    .from(doctoresPacientes)
    .where(eq(doctoresPacientes.userId, userId));

  // Atenciones del mes actual
  const atencionesMes = await db
    .select({ total: count() })
    .from(atenciones)
    .where(
      and(
        eq(atenciones.userIdMedico, userId),
        sql`strftime('%m', ${atenciones.created_at}) = strftime('%m', 'now')`,
        sql`strftime('%Y', ${atenciones.created_at}) = strftime('%Y', 'now')`
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
  const promedioDuracion = await db
    .select({
      promedio: sql<number>`
        AVG((julianday(${atenciones.finAtencion}) - julianday(${atenciones.inicioAtencion})) * 24 * 60)
      `,
    })
    .from(atenciones)
    .where(eq(atenciones.userIdMedico, userId));

  // Atenciones del día, clasificadas por turno
  const inicioDia = sql`strftime('%s', 'now', 'start of day')`;
  const finDia = sql`strftime('%s', 'now', 'start of day', '+1 day')`;

  const atencionesHoy = await db
    .select({
      id: atenciones.id,
      pacienteId: atenciones.pacienteId,
      fecha: atenciones.fecha,
      motivoInicial: atenciones.motivoInicial,
      turno: sql`
        CASE 
          WHEN CAST(strftime('%H', ${atenciones.fecha}, 'unixepoch') AS INTEGER) < 13 
          THEN 'Mañana'
          ELSE 'Tarde'
        END
      `.as('turno'),
    })
    .from(atenciones)
    .where(
      and(
        eq(atenciones.userIdMedico, userId),
        gte(atenciones.fecha, inicioDia),
        lte(atenciones.fecha, finDia)
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
      obraSocial: fichaPaciente.obraSocial,
    })
    .from(atenciones)
    .innerJoin(historiaClinica, eq(historiaClinica.id, atenciones.historiaClinicaId))
    .innerJoin(pacientes, eq(pacientes.id, historiaClinica.pacienteId))
    .leftJoin(fichaPaciente, eq(fichaPaciente.pacienteId, pacientes.id))
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
