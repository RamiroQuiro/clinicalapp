// services/pacientes.service.ts
import db from '@/db';
import {
  archivosAdjuntos,
  atenciones,
  auditLog,
  diagnostico,
  historiaClinica,
  medicamento,
  pacientes,
  turnos,
  users,
} from '@/db/schema';
import { antecedentes } from '@/db/schema/atecedentes';
import { asc, desc, eq, sql } from 'drizzle-orm';

function generateColor(index: number) {
  const colors = ['#A5CDFE38', '#DCECFF45', '#FCE3D54C', '#FFD2B2BD', '#E25B3250'];
  return colors[index % colors.length];
}

export async function getPacienteData(pacienteId: string, userId: string) {
  try {
    // Ejecutar consultas en paralelo
    const [
      pacienteDataRaw,
      medicamentosData,
      historialVisitas,
      arrayDiagnosticos,
      arrayAntecedente,
      arrayArchivosAdjuntos,
      // arrayNotasMedicas,
      proximosTurnos,
    ] = await Promise.all([
      // datos del paciente
      db
        .select({
          nombre: pacientes.nombre,
          apellido: pacientes.apellido,
          dni: pacientes.dni,
          sexo: pacientes.sexo,
          celular: historiaClinica.celular,
          email: historiaClinica.email,
          fNacimiento: pacientes.fNacimiento,
          obraSocial: historiaClinica.obraSocial,
          nObraSocial: historiaClinica.nObraSocial,
          ciudad: historiaClinica.ciudad,
          provincia: historiaClinica.provincia,
          grupoSanguineo: historiaClinica.grupoSanguineo,
          estatura: historiaClinica.estatura,
          domicilio: pacientes.domicilio,
        })
        .from(pacientes)
        .innerJoin(historiaClinica, eq(historiaClinica.pacienteId, pacienteId))
        .where(eq(pacientes.id, pacienteId)),

      // medicamentos
      db
        .select()
        .from(medicamento)
        .where(eq(medicamento.pacienteId, pacienteId))
        .orderBy(desc(medicamento.created_at)),

      // historial de visitas
      db
        .select({
          id: atenciones.id,
          fecha: atenciones.created_at,
          motivoConsulta: atenciones.motivoConsulta,
          motivoInicial: atenciones.motivoInicial,
          profesional: sql`CONCAT(users.nombre, ' ', users.apellido)`,

          tratamientoId: atenciones.tratamientoId,
          tratamiento: atenciones.tratamientoId,
        })
        .from(atenciones)
        .innerJoin(users, eq(users.id, atenciones.userIdMedico))
        .where(eq(atenciones.pacienteId, pacienteId))
        .groupBy(atenciones.id)
        .orderBy(desc(atenciones.created_at))
        .limit(10),
      // diagnostico
      db.select().from(diagnostico).where(eq(diagnostico.pacienteId, pacienteId)).limit(10),
      // antecedentes
      db.select().from(antecedentes).where(eq(antecedentes.pacienteId, pacienteId)).limit(10),

      // archivos adjuntos
      db
        .select()
        .from(archivosAdjuntos)
        .where(eq(archivosAdjuntos.pacienteId, pacienteId))
        .orderBy(desc(archivosAdjuntos.created_at)),

      // // notas médicas
      // db
      //   .select({
      //     id: notasMedicas.id,
      //     title: notasMedicas.title,
      //     descripcion: notasMedicas.descripcion,
      //     fecha: notasMedicas.created_at,
      //     profesional: sql`CONCAT(users.nombre, ' ', users.apellido)`,
      //     atencionId: notasMedicas.atencionId,
      //   })
      //   .from(notasMedicas)
      //   .innerJoin(users, eq(users.id, notasMedicas.userMedicoId))
      //   .where(eq(notasMedicas.pacienteId, pacienteId))
      //   .orderBy(desc(notasMedicas.created_at)),

      // Próximos Turnos
      db
        .select({
          id: turnos.id,
          fecha: turnos.fechaTurno,
          hora: turnos.horaAtencion,
          motivoConsulta: turnos.motivoConsulta,
          profesional: sql`CONCAT(users.nombre, ' ', users.apellido)`,
          userMedicoId: turnos.userMedicoId,
        })
        .from(turnos)
        .innerJoin(users, eq(users.id, turnos.userMedicoId))
        .where(eq(turnos.pacienteId, pacienteId))
        // .where(gte(turnos.fechaTurno, new Date())) // Filtrar por fechas futuras
        .orderBy(asc(turnos.fechaTurno))
        .limit(5),
    ]);

    const pacienteData = pacienteDataRaw.at(0);
    // console.log('paciente en el getData ', pacienteData);
    if (!pacienteData) {
      throw new Error('Paciente no encontrado');
    }
    const auditoria = await db.insert(auditLog).values({
      tableName: 'pacientes',
      userId,
      actionType: 'VIEW',
      description: 'ver perfil del paciente',
    });

    // Colores para visitas
    const colorMap = historialVisitas.reduce<Record<string, string>>((map, atencion, index) => {
      map[atencion.id] = generateColor(index);
      return map;
    }, {});

    return {
      pacienteData,
      medicamentosData,
      historialVisitas,
      arrayDiagnosticos,
      arrayAntecedente,
      arrayArchivosAdjuntos,
      // arrayNotasMedicas,
      proximosTurnos,
      colorMap,
    };
  } catch (error) {
    console.error('Error en getPacienteData:', error);
    throw new Error('Ocurrió un error al procesar la solicitud');
  }
}
