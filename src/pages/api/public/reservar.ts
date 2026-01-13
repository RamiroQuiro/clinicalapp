import db from '@/db';
import { turnos, users } from '@/db/schema';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { addMinutes } from 'date-fns';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { centroId, profesionalId, fechaISO, paciente } = body;

        if (!centroId || !profesionalId || !fechaISO || !paciente) {
            return createResponse(400, 'Faltan datos requeridos (centroId, profesionalId, fechaISO, paciente)');
        }

        // 1. Validar campos mínimos del paciente
        if (!paciente.email || !paciente.nombre || !paciente.dni) {
            return createResponse(400, 'Los campos nombre, DNI y email son obligatorios');
        }

        const profesional = (await db.select({
            nombre: users.nombre,
            apellido: users.apellido,
            especialidad: users.especialidad,
        }).from(users).where(eq(users.id, profesionalId))).at(0);

        // 2. Preparar datos de la reserva
        const token = crypto.randomUUID();
        const expiracion = addMinutes(new Date(), 30); // 30 minutos para confirmar
        const turnoId = crypto.randomUUID();
        const fecha = new Date(fechaISO);

        // 3. Insertar turno en estado 'pendiente_validacion'
        const [newTurno] = await db.insert(turnos).values({
            id: turnoId,
            centroMedicoId: centroId,
            userMedicoId: profesionalId,
            fechaTurno: fecha,
            horaAtencion: fecha.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            }),
            estado: 'pendiente_validacion',
            origen: 'publico',
            tokenConfirmacion: token,
            fechaExpiracion: expiracion,
            datosPacienteTemporal: paciente,
        }).returning();

        console.log('tueno nuevo -> ', newTurno);
        const creandoResponse = {
            hora: newTurno.fechaTurno.toISOString(), // DEVOLVEMOS FECHA COMPLETA ISO
            disponible: false,
            centroMedicoId: centroId,
            userMedicoId: profesionalId,
            turnoInfo: {
                id: newTurno.id,
                datosPacienteTemporal: paciente,
                pacienteDocumento: paciente.dni,
                pacienteId: 'turno reservado publicamente',
                pacienteCelular: paciente.celular,
                pacienteNombre: paciente.nombre,
                pacienteApellido: paciente.apellido,
                fechaTurno: newTurno.fechaTurno.toISOString(),
                profesionalNombre: profesional?.nombre || '',
                profesionalApellido: profesional?.apellido || '',
                especialidadProfesional: profesional?.especialidad || '',
                motivoConsulta: 'Turno reservado publicamente',
                horaTurno: newTurno.fechaTurno.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }),
                duracion: 30,
                estado: 'pendiente_validacion',
            },
        };
        // 4. Log para facilitar pruebas (antes de configurar correo real)
        console.log(`[RESERVA PÚBLICA] Nueva reserva: ${turnoId}. Confirmar con token: ${token}`);
        emitEvent('turno-agendado', creandoResponse, { centroMedicoId: centroId });

        return createResponse(201, 'Hemos reservado tu turno. Revisa tu email para confirmarlo.', {
            turnoId,
            token,
        });
    } catch (error) {
        console.error('Error en /api/public/reservar:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
