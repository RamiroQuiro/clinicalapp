import db from '@/db';
import { licenciasProfesional, pacientes, turnos, users } from '@/db/schema';
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
  const profesionalId = url.searchParams.get('profesionalId');
  const profesionalIdsParam = url.searchParams.get('profesionalIds');
  const centroMedicoId = url.searchParams.get('centroMedicoId');

  // console.log('user locales', user, 'data obtenida', fechaQuery, profesionalId, centroMedicoId, profesionalIdsParam)



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

    if (profesionalId) {
      // --- Caso 1: Se solicita un profesional específico ---
      if (isRecepcionista) {
        // Un recepcionista puede ver la agenda de sus profesionales asociados.
        // La validación de permisos ya se hizo en el frontend, pero podemos añadir una capa extra si es necesario.
        profesionalesIds = [profesionalId];
      } else {
        // Un profesional solo puede ver su propia agenda
        if (profesionalId !== user.id) {
          return createResponse(403, 'Solo puede ver su propia agenda');
        }
        profesionalesIds = [profesionalId];
      }
    } else if (isRecepcionista && profesionalIdsParam) {
      // --- Caso 2: Recepcionista solicita la agenda de TODOS sus profesionales ---
      profesionalesIds = profesionalIdsParam.split(',');
    } else if (!isRecepcionista) {
      // --- Caso 3: Un profesional solicita su propia agenda (caso por defecto) ---
      profesionalesIds = [user.id];
    }

    // Si después de toda la lógica, no hay IDs, no hay nada que mostrar.
    // Esto puede pasar si un recepcionista no tiene profesionales asignados.
    if (profesionalesIds.length === 0) {
      return createResponse(200, 'No hay agendas para mostrar', []);
    }



    // 1. Calcular el día de la semana a partir de la fecha
    const fecha = toZonedTime(`${fechaQuery}T12:00:00`, APP_TIME_ZONE); // Usar mediodía para evitar problemas de timezone
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaNombre = diasSemana[fecha.getDay()];




    // 2. Obtener la configuración de la agenda y los horarios de TODOS los profesionales para ese día
    const [configuracionAgenda] = await db.select().from(agendaGeneralCentroMedico).where(eq(agendaGeneralCentroMedico.centroMedicoId, centroMedicoId));
    const DURACION_SLOT_MINUTOS = configuracionAgenda?.duracionTurnoPorDefecto || 30;

    const todosLosHorarios = await db.select().from(horariosTrabajo).where(and(
      inArray(horariosTrabajo.userMedicoId, profesionalesIds),
      eq(horariosTrabajo.diaSemana, diaSemanaNombre)
    ));

    // 3. Obtener TODOS los turnos del día para los profesionales solicitados
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
        centroMedicoId: turnos.centroMedicoId,
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

    const agendasPorProfesional: { [key: string]: any[] } = {};

    // 4. Iterar sobre cada profesional para construir su agenda individual
    for (const profId of profesionalesIds) {
      // console.log('Processing professional:', profId);

      // 🔍 VALIDACIÓN: Verificar si el profesional tiene licencia activa en esta fecha
      const licenciaActiva = await db.select()
        .from(licenciasProfesional)
        .where(
          and(
            eq(licenciasProfesional.userId, profId),
            eq(licenciasProfesional.centroMedicoId, centroMedicoId),
            eq(licenciasProfesional.estado, 'activa'),
            lte(licenciasProfesional.fechaInicio, fecha),
            gte(licenciasProfesional.fechaFin, fecha)
          )
        )
        .limit(1);

      // Si hay licencia activa, retornar slot bloqueado con info de licencia
      if (licenciaActiva.length > 0) {
        agendasPorProfesional[profId] = [{
          hora: inicioDelDia.toISOString(),
          disponible: false,
          userMedicoId: profId,
          centroMedicoId: centroMedicoId,
          turnoInfo: null,
          licenciaInfo: {
            id: licenciaActiva[0].id,
            tipo: licenciaActiva[0].tipo,
            motivo: licenciaActiva[0].motivo,
            fechaInicio: licenciaActiva[0].fechaInicio,
            fechaFin: licenciaActiva[0].fechaFin,
            estado: licenciaActiva[0].estado,
          }
        }];
        continue;
      }

      const horarioProfesional = todosLosHorarios.find(h => h.userMedicoId === profId);
      // console.log('Horario profesional:', horarioProfesional);

      const JORNADA_LABORAL = [];
      if (horarioProfesional && horarioProfesional.activo) {
        if (horarioProfesional.horaInicioManana && horarioProfesional.horaFinManana) {
          JORNADA_LABORAL.push({ inicio: horarioProfesional.horaInicioManana, fin: horarioProfesional.horaFinManana });
        }
        if (horarioProfesional.horaInicioTarde && horarioProfesional.horaFinTarde) {
          JORNADA_LABORAL.push({ inicio: horarioProfesional.horaInicioTarde, fin: horarioProfesional.horaFinTarde });
        }
      }
      // console.log('JORNADA_LABORAL for', profId, ':', JORNADA_LABORAL);

      if (JORNADA_LABORAL.length === 0) {
        agendasPorProfesional[profId] = [];
        continue;
      }

      const slotsDelDia = [];
      JORNADA_LABORAL.forEach(rango => {
        let currentSlotUtc = toZonedTime(`${fechaQuery}T${rango.inicio}:00`, APP_TIME_ZONE);
        const endSlotUtc = toZonedTime(`${fechaQuery}T${rango.fin}:00`, APP_TIME_ZONE);
        while (currentSlotUtc < endSlotUtc) {
          slotsDelDia.push(new Date(currentSlotUtc));
          currentSlotUtc = addMinutes(currentSlotUtc, DURACION_SLOT_MINUTOS);
        }
      });

      const turnosDelProfesionalActual = turnosDelDia.filter(turno => turno.userMedicoId === profId);
      // console.log('Turnos del profesional actual:', turnosDelProfesionalActual);

      const agendaCompleta = slotsDelDia.map(slotInicio => {
        const slotFin = new Date(slotInicio.getTime() + DURACION_SLOT_MINUTOS * 60000);
        const turnoOcupante = turnosDelProfesionalActual.find(turno => {
          const turnoInicio = new Date(turno.fechaTurno);
          const turnoFin = new Date(turnoInicio.getTime() + (turno.duracion || DURACION_SLOT_MINUTOS) * 60000);
          return slotInicio < turnoFin && slotFin > turnoInicio && turno.estado !== 'cancelado';
        });

        if (turnoOcupante) {
          return {
            hora: slotInicio.toISOString(),
            disponible: false,
            centroMedicoId: turnoOcupante.centroMedicoId,
            userMedicoId: profId,
            turnoInfo: {
              id: turnoOcupante.id,
              pacienteId: turnoOcupante.pacienteId,
              centroMedicoId: turnoOcupante.centroMedicoId,
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
            userMedicoId: profId,
            disponible: true,
            centroMedicoId: centroMedicoId,
            turnoInfo: null,
          };
        }
      });

      const turnosAsignadosEnSlots = agendaCompleta.reduce((acc, slot) => {
        if (slot.turnoInfo) acc.add(slot.turnoInfo.id);
        return acc;
      }, new Set());

      const turnosExtraNoAsignados = turnosDelProfesionalActual.filter(
        (turno) =>
          (turno.tipoDeTurno === 'espontaneo' || turno.tipoDeTurno === 'sobreturno') &&
          !turnosAsignadosEnSlots.has(turno.id)
      );

      const estruturaTurnosExtra = turnosExtraNoAsignados.map((turno) => ({
        hora: turno.fechaTurno.toISOString(),
        disponible: false,
        centroMedicoId: centroMedicoId,
        userMedicoId: turno.userMedicoId,
        turnoInfo: {
          id: turno.id,
          pacienteId: turno.pacienteId,
          centroMedicoId: turno.centroMedicoId,
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
      }));

      const agendaCompletisima = [...agendaCompleta, ...estruturaTurnosExtra];
      agendaCompletisima.sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

      agendasPorProfesional[profId] = agendaCompletisima;
    }

    const finalResponseArray = Object.entries(agendasPorProfesional).map(([profesionalId, agenda]) => ({
      profesionalId,
      agenda,
    }));

    return createResponse(200, 'Agendas obtenidas exitosamente', finalResponseArray);
  } catch (error) {
    console.error('Error al obtener la agenda del día:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};