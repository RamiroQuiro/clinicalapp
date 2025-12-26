import db from '@/db';
import { licenciasProfesional, pacientes, turnos, users } from '@/db/schema';
import { agendaGeneralCentroMedico, horariosTrabajo } from '@/db/schema/agenda';
import APP_TIME_ZONE from '@/lib/timeZone';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { addMinutes } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
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

  // 1. VALIDACIONES BÁSICAS
  if (!fechaQuery || !/^\d{4}-\d{2}-\d{2}$/.test(fechaQuery)) {
    return createResponse(400, 'Fecha no proporcionada o en formato incorrecto. Use YYYY-MM-DD.');
  }
  if (!centroMedicoId) {
    return createResponse(400, 'centroMedicoId no proporcionado');
  }

  // 2. DEFINICIÓN DINÁMICA DE PERMISOS (EVITA "isRecepcionista")
  // Roles que pueden ver agendas de otros profesionales
  const ROLES_CON_VISTA_GLOBAL = ['admin', 'recepcion', 'supervisor']; // Agrega roles futuros aquí
  const ROLES_SOLO_VISTA_PROPIA = ['profesional', 'enfermeria']; // Roles restringidos

  // Determina permisos del usuario actual
  const puedeVerAgendasDeOtros = ROLES_CON_VISTA_GLOBAL.includes(user?.rol);
  const soloPuedeVerSuAgenda = ROLES_SOLO_VISTA_PROPIA.includes(user?.rol);
  const rolNoConfigurado = !puedeVerAgendasDeOtros && !soloPuedeVerSuAgenda;

  if (rolNoConfigurado) {
    console.warn(`Rol '${user.rol}' no configurado en lógica de agendas`);
    return createResponse(403, 'Su rol no tiene permisos configurados para ver agendas');
  }

  try {
    // 3. DETERMINAR QUÉ PROFESIONALES CONSULTAR
    let profesionalesIds: string[] = [];

    // CASO A: Se solicita un profesional específico (parámetro 'profesionalId')
    if (profesionalId) {
      if (puedeVerAgendasDeOtros) {
        // Admin/Recepcion puede ver cualquier profesional
        profesionalesIds = [profesionalId];
      } else if (soloPuedeVerSuAgenda) {
        // Profesional solo puede verse a sí mismo
        if (profesionalId !== user.id) {
          return createResponse(403, 'Solo puede ver su propia agenda');
        }
        profesionalesIds = [user.id];
      }
    }
    // CASO B: Usuario con vista global pide múltiples profesionales (parámetro 'profesionalIds')
    else if (puedeVerAgendasDeOtros && profesionalIdsParam) {
      profesionalesIds = profesionalIdsParam.split(',');
    }
    // CASO C: Usuario con vista global NO especifica profesionales → TRAER TODOS
    else if (puedeVerAgendasDeOtros && !profesionalId && !profesionalIdsParam) {
      // Consulta automática: todos los profesionales activos del centro
      const todosProfesionalesCentro = await db
        .select({ id: users.id })
        .from(users)
        .innerJoin(pacienteProfesional, eq(users.id, pacienteProfesional.userId))
        .where(
          and(
            eq(pacienteProfesional.centroMedicoId, centroMedicoId),
            eq(users.activo, true),
            inArray(users.rol, ['profesional', 'admin']) // Ajusta según tus roles médicos
          )
        );
      profesionalesIds = todosProfesionalesCentro.map(p => p.id);
    }
    // CASO D: Usuario solo puede ver su agenda (caso por defecto para profesionales)
    else if (soloPuedeVerSuAgenda) {
      profesionalesIds = [user.id];
    }

    // Si no hay IDs para consultar
    if (profesionalesIds.length === 0) {
      return createResponse(200, 'No hay agendas para mostrar', []);
    }

    // 4. LÓGICA PRINCIPAL (GENERACIÓN DE AGENDAS)
    // Usamos fromZonedTime para interpretar la fechaQuery como una fecha en Argentina (indep. del server)
    // fechaQuery viene como YYYY-MM-DD
    const inicioDelDia = fromZonedTime(`${fechaQuery}T00:00:00`, APP_TIME_ZONE);
    const finDelDia = fromZonedTime(`${fechaQuery}T23:59:59.999`, APP_TIME_ZONE);

    // Para obtener el día de la semana, usamos toZonedTime para visualizar la fecha en la zona horaria correcta
    // y pedimos el día UTC (ya que toZonedTime ajusta el timestamp para que UTC coincida con la zona)
    const fechaZoned = toZonedTime(inicioDelDia, APP_TIME_ZONE);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemanaNombre = diasSemana[fechaZoned.getUTCDay()];

    const [configuracionAgenda] = await db
      .select()
      .from(agendaGeneralCentroMedico)
      .where(eq(agendaGeneralCentroMedico.centroMedicoId, centroMedicoId));
    const DURACION_SLOT_MINUTOS = configuracionAgenda?.duracionTurnoPorDefecto || 30;

    const todosLosHorarios = await db
      .select()
      .from(horariosTrabajo)
      .where(
        and(
          inArray(horariosTrabajo.userMedicoId, profesionalesIds),
          eq(horariosTrabajo.diaSemana, diaSemanaNombre)
        )
      );

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

    // 5. ITERAR POR CADA PROFESIONAL (MANTIENE TU LÓGICA)
    for (const profId of profesionalesIds) {
      // Validación de licencia (igual que antes)
      const licenciaActiva = await db
        .select()
        .from(licenciasProfesional)
        .where(
          and(
            eq(licenciasProfesional.userId, profId),
            eq(licenciasProfesional.centroMedicoId, centroMedicoId),
            eq(licenciasProfesional.estado, 'activa'),
            lte(licenciasProfesional.fechaInicio, finDelDia),
            gte(licenciasProfesional.fechaFin, inicioDelDia)
          )
        )
        .limit(1);

      if (licenciaActiva.length > 0) {
        agendasPorProfesional[profId] = [
          {
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
            },
          },
        ];
        continue;
      }

      // Resto de tu lógica de generación de slots...
      const horarioProfesional = todosLosHorarios.find(h => h.userMedicoId === profId);
      const JORNADA_LABORAL = [];

      if (horarioProfesional && horarioProfesional.activo) {
        if (horarioProfesional.horaInicioManana && horarioProfesional.horaFinManana) {
          JORNADA_LABORAL.push({ inicio: horarioProfesional.horaInicioManana, fin: horarioProfesional.horaFinManana });
        }
        if (horarioProfesional.horaInicioTarde && horarioProfesional.horaFinTarde) {
          JORNADA_LABORAL.push({ inicio: horarioProfesional.horaInicioTarde, fin: horarioProfesional.horaFinTarde });
        }
      }

      if (JORNADA_LABORAL.length === 0) {
        agendasPorProfesional[profId] = [];
        continue;
      }

      const slotsDelDia = [];
      JORNADA_LABORAL.forEach(rango => {
        // Usamos fromZonedTime para asegurar que la hora de inicio se interprete en AR, no en local server
        let currentSlotUtc = fromZonedTime(`${fechaQuery}T${rango.inicio}:00`, APP_TIME_ZONE);
        const endSlotUtc = fromZonedTime(`${fechaQuery}T${rango.fin}:00`, APP_TIME_ZONE);

        while (currentSlotUtc < endSlotUtc) {
          slotsDelDia.push(new Date(currentSlotUtc));
          currentSlotUtc = addMinutes(currentSlotUtc, DURACION_SLOT_MINUTOS);
        }
      });

      const turnosDelProfesionalActual = turnosDelDia.filter(turno => turno.userMedicoId === profId);
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
        turno =>
          (turno.tipoDeTurno === 'espontaneo' || turno.tipoDeTurno === 'sobreturno') &&
          !turnosAsignadosEnSlots.has(turno.id)
      );

      const estruturaTurnosExtra = turnosExtraNoAsignados.map(turno => ({
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