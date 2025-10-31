import db from '@/db';
import { pacientes, turnos, users, usersCentrosMedicos } from '@/db/schema';
import { agendaGeneralCentroMedico, horariosTrabajo } from '@/db/schema/agenda';
import APP_TIME_ZONE from '@/lib/timeZone';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';



export const GET: APIRoute = async ({ locals, request }) => {
  if (!locals.session) {
    return createResponse(401, 'No autorizado');
  }

  const { user } = locals;

  const url = new URL(request.url);
  const fechaQuery = url.searchParams.get('fecha');
  const userId = url.searchParams.get('profesionalId');
  const centroMedicoId = url.searchParams.get('centroMedicoId');

  console.log('user locales', user, 'data obtenida', fechaQuery, userId, centroMedicoId)

  if (!fechaQuery || !/^\d{4}-\d{2}-\d{2}$/.test(fechaQuery)) {
    return createResponse(400, 'Fecha no proporcionada o en formato incorrecto. Use YYYY-MM-DD.');
  }

  if (!centroMedicoId) {
    return createResponse(400, 'centroMedicoId no proporcionado');
  }

  // La JORNADA_LABORAL y DURACION_SLOT_MINUTOS ahora se obtendrán de la base de datos

  try {
    const isRecepcionista = user.rolEnCentro === 'recepcion';
    let profesionalesIds: string[] = [];

    if (isRecepcionista) {
      const relaciones = await db
        .select()
        .from(usersCentrosMedicos)
        .where(eq(usersCentrosMedicos.centroMedicoId, centroMedicoId));

      if (relaciones.length > 0) {
        profesionalesIds = relaciones.map(relacion => relacion.userId);
        if (userId) {
          if (!profesionalesIds.includes(userId)) {
            return createResponse(403, 'No tiene permisos para ver la agenda de este profesional');
          }
          profesionalesIds = [userId];
        }
      } else {
        if (userId) {
          const profesional = await db.select().from(users).where(and(eq(users.id, userId), eq(users.rol, 'profesional'))).limit(1);
          if (profesional.length === 0) return createResponse(404, 'Profesional no encontrado');
          profesionalesIds = [userId];
        } else {
          return createResponse(200, 'No hay profesionales asignados a este centro médico', { agenda: [] });
        }
      }
    } else {
      if (!userId || userId !== user.id) {
        return createResponse(403, 'Solo puede ver su propia agenda');
      }
      profesionalesIds = [userId];
    }

    if (profesionalesIds.length === 0) {
      return createResponse(200, 'No hay agendas para mostrar', { agenda: [], profesionalesIds: [], esRecepcion: isRecepcionista });
    }

    // --- INICIO DE LA NUEVA LÓGICA DINÁMICA ---

    // 1. Calcular el día de la semana a partir de la fecha
    const fecha = toZonedTime(`${fechaQuery}T12:00:00`, APP_TIME_ZONE); // Usar mediodía para evitar problemas de timezone
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaNombre = diasSemana[fecha.getDay()];

    // 2. Obtener la configuración de la agenda y el horario del profesional para ese día
    // (Asumimos que si hay varios profesionales, todos usan la misma config de duración de turno del centro)
    const profesionalIdParaHorario = profesionalesIds[0]; // Tomamos el primer (y a menudo único) profesional para buscar su horario

    const [configuracionAgenda] = await db.select().from(agendaGeneralCentroMedico).where(eq(agendaGeneralCentroMedico.centroMedicoId, centroMedicoId));
    const [horarioProfesional] = await db.select().from(horariosTrabajo).where(and(eq(horariosTrabajo.userMedicoId, profesionalIdParaHorario), eq(horariosTrabajo.diaSemana, diaSemanaNombre)));

    const DURACION_SLOT_MINUTOS = configuracionAgenda?.duracionTurnoPorDefecto || 30;
    console.log('horarios ->', horarioProfesional)
    // 3. Construir la JORNADA_LABORAL dinámicamente
    //     const JORNADA_LABORAL = [
    //   { inicio: 8, fin: 12 },
    //   { inicio: 18, fin: 22 },
    // ];
    const JORNADA_LABORAL = [];
    if (horarioProfesional && horarioProfesional.activo) {
      if (horarioProfesional.horaInicioManana && horarioProfesional.horaFinManana) {
        JORNADA_LABORAL.push({ inicio: Number(horarioProfesional.horaInicioManana.padStart(2, '0').split(':')[0]), fin: Number(horarioProfesional.horaFinManana.padStart(2, '0').split(':')[0]) });
      }
      if (horarioProfesional.horaInicioTarde && horarioProfesional.horaFinTarde) {
        JORNADA_LABORAL.push({ inicio: Number(horarioProfesional.horaInicioTarde.padStart(2, '0').split(':')[0]), fin: Number(horarioProfesional.horaFinTarde.padStart(2, '0').split(':')[0]) });
      }
    }
    console.log('JORNADA_LABORAL ->', JORNADA_LABORAL)
    // Si JORNADA_LABORAL está vacía, no hay turnos para generar
    if (JORNADA_LABORAL.length === 0) {
      return createResponse(200, 'El profesional no trabaja en la fecha seleccionada', []);
    }

    // --- FIN DE LA NUEVA LÓGICA DINÁMICA ---

    const inicioDelDia = toZonedTime(`${fechaQuery}T00:00:00`, APP_TIME_ZONE);
    const finDelDia = toZonedTime(`${fechaQuery}T23:59:59`, APP_TIME_ZONE);


    const turnosDelDia = await db
      .select({
        id: turnos.id,
        fechaTurno: turnos.fechaTurno,
        duracion: turnos.duracion,
        pacienteId: pacientes.id,
        pacienteNombre: pacientes.nombre,
        pacienteApellido: pacientes.apellido,
        pacienteDocumento: pacientes.dni,
        pacienteCelular: pacientes.celular,
        especialidadProfesional: users.especialidad,
        horaLlegadaPaciente: turnos.horaLlegadaPaciente,
        tipoDeTurno: turnos.tipoDeTurno,
        userMedicoId: users.id,
        profesionalNombre: users.nombre,
        profesionalApellido: users.apellido,
        estado: turnos.estado,
        horaTurno: turnos.horaAtencion,
        motivoConsulta: turnos.motivoConsulta,
      })
      .from(turnos)
      .leftJoin(pacientes, eq(turnos.pacienteId, pacientes.id))
      .leftJoin(users, eq(turnos.userMedicoId, users.id))
      .where(
        and(
          gte(turnos.fechaTurno, inicioDelDia),
          lte(turnos.fechaTurno, finDelDia),
          inArray(turnos.userMedicoId, profesionalesIds),
          eq(turnos.centroMedicoId, centroMedicoId)
        )
      );

    console.log('turnosDelDia', turnosDelDia)
    // Generar slots y construir agenda...
    const slotsDelDia = [];
    JORNADA_LABORAL.forEach(rango => {
      let currentSlotUtc = toZonedTime(
        `${fechaQuery}T${String(rango.inicio).padStart(2, '0')}:00:00`,
        APP_TIME_ZONE
      );

      const endSlotUtc = toZonedTime(
        `${fechaQuery}T${String(rango.fin).padStart(2, '0')}:00:00`,
        APP_TIME_ZONE
      );

      while (currentSlotUtc < endSlotUtc) {
        slotsDelDia.push(new Date(currentSlotUtc));
        currentSlotUtc = addMinutes(currentSlotUtc, DURACION_SLOT_MINUTOS);
      }
    });
    // console.log('turnos del dia->', turnosDelDia)

    const agendaCompleta = slotsDelDia.map(slotInicio => {
      const slotFin = new Date(slotInicio.getTime() + DURACION_SLOT_MINUTOS * 60000);
      const turnoOcupante = turnosDelDia.find(turno => {
        const turnoInicio = new Date(turno.fechaTurno);
        const turnoFin = new Date(
          turnoInicio.getTime() + (turno.duracion || DURACION_SLOT_MINUTOS) * 60000
        );
        return slotInicio < turnoFin && slotFin > turnoInicio && turno.estado !== 'cancelado';
      });

      if (turnoOcupante) {
        return {
          hora: slotInicio.toISOString(),
          disponible: false,
          userMedicoId: turnoOcupante.userMedicoId,
          turnoInfo: {
            id: turnoOcupante.id,
            pacienteId: turnoOcupante.pacienteId,
            pacienteCelular: turnoOcupante.pacienteCelular,
            pacienteNombre: turnoOcupante.pacienteNombre,
            horaLlegadaPaciente: turnoOcupante.horaLlegadaPaciente,

            pacienteApellido: turnoOcupante.pacienteApellido,
            pacienteDocumento: turnoOcupante.pacienteDocumento,
            userMedicoId: turnoOcupante.userMedicoId,
            profesionalNombre: turnoOcupante.profesionalNombre,
            especialidadProfesional: turnoOcupante.especialidadProfesional,
            tipoDeTurno: turnoOcupante.tipoDeTurno,
            profesionalApellido: turnoOcupante.profesionalApellido,
            motivoConsulta: turnoOcupante.motivoConsulta,
            horaTurno: turnoOcupante.horaTurno,
            duracion: turnoOcupante.duracion,
            estado: turnoOcupante.estado,
          },
        };
      } else {
        return {
          hora: slotInicio.toISOString(),
          userMedicoId: isRecepcionista && userId ? userId : profesionalesIds[0],
          disponible: true,
          turnoInfo: null,
        };
      }
    });

    // Identificar los turnos que ya fueron asignados a un slot para no duplicarlos.
    const turnosAsignadosEnSlots = agendaCompleta.reduce((acc, slot) => {
      if (slot.turnoInfo) {
        acc.add(slot.turnoInfo.id);
      }
      return acc;
    }, new Set());

    // Filtrar solo los turnos espontáneos o sobreturnos que NO han sido ya asignados.
    const turnosExtraNoAsignados = turnosDelDia.filter(
      (turno) =>
        (turno.tipoDeTurno === 'espontaneo' || turno.tipoDeTurno === 'sobreturno') &&
        !turnosAsignadosEnSlots.has(turno.id)
    );

    // Mapear esos turnos extra a la estructura de la agenda.
    const estruturaTurnosExtra = turnosExtraNoAsignados.map((turno) => {
      return {
        hora: turno.fechaTurno.toISOString(),
        disponible: false,
        userMedicoId: turno.userMedicoId,
        turnoInfo: {
          id: turno.id,
          pacienteId: turno.pacienteId,
          pacienteCelular: turno.pacienteCelular,
          pacienteNombre: turno.pacienteNombre,
          horaLlegadaPaciente: turno.horaLlegadaPaciente,
          pacienteApellido: turno.pacienteApellido,
          pacienteDocumento: turno.pacienteDocumento,
          userMedicoId: turno.userMedicoId,
          profesionalNombre: turno.profesionalNombre,
          especialidadProfesional: turno.especialidadProfesional,
          tipoDeTurno: turno.tipoDeTurno,
          profesionalApellido: turno.profesionalApellido,
          motivoConsulta: turno.motivoConsulta,
          horaTurno: turno.horaTurno,
          duracion: turno.duracion,
          estado: turno.estado,
        },
      };
    });

    // Combinar la agenda de slots con los turnos extra y ordenar cronológicamente.
    const agendaCompletisima = [...agendaCompleta, ...estruturaTurnosExtra];
    agendaCompletisima.sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

    return createResponse(200, 'Agenda del día obtenida exitosamente', agendaCompletisima);
  } catch (error) {
    console.error('Error al obtener la agenda del día:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};