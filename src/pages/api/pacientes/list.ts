import db from '@/db';
import { pacientes } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import type { User } from 'lucia';

export const GET: APIRoute = async ({ cookies, locals }) => {
    try {
        // 1. Autenticación
        const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return createResponse(401, 'No autorizado');
        }

        const { user } = locals as { user: User };
        const { session } = await lucia.validateSession(sessionId);

        if (!session || !user || !user.centroMedicoId) {
            return createResponse(401, 'No autorizado o sin centro médico asignado');
        }

        // 2. Obtener pacientes del centro médico
        const dataDB = await db
            .select({
                id: pacientes.id,
                nombre: pacientes.nombre,
                apellido: pacientes.apellido,
                sexo: pacientes.sexo,
                celular: pacientes.celular,
                dni: pacientes.dni,
                fNacimiento: pacientes.fNacimiento,
            })
            .from(pacientes)
            .where(eq(pacientes.centroMedicoId, user.centroMedicoId));

        const pacientesData = dataDB.map(paciente => {
            return {
                href: `/api/atencion/nueva?pacienteId=${paciente.id}`,
                id: paciente.id,
                nombreApellido: `${paciente.nombre} ${paciente.apellido}`,
                dni: paciente.dni,
                edad: calcularEdad(paciente.fNacimiento),
                sexo: paciente.sexo,
                celular: paciente.celular,
                // Eliminamos ...paciente para evitar duplicados y enviar solo lo necesario
            };
        });

        return createResponse(200, 'OK', pacientesData);

    } catch (error) {
        console.error('Error al listar pacientes:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};

function calcularEdad(fecha: Date | string | null): number | string {
    if (!fecha) return '-';
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}
