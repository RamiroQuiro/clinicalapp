import db from '@/db';
import { turnos } from '@/db/schema';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const CONFIRMATION_TURNO_SECRET = import.meta.env.CONFIRMATION_TURNO_SECRET;

export const GET: APIRoute = async ({ params, redirect }) => {
    const { token } = params;

    if (!token) {
        return redirect('/confirmar-turno/error?mensaje=Token no proporcionado');
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, CONFIRMATION_TURNO_SECRET) as { turnoId: string; exp: number };

        // Check if token expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return redirect('/confirmar-turno/error?mensaje=El link de confirmación ha expirado');
        }

        // Get turno
        const [turno] = await db
            .select()
            .from(turnos)
            .where(eq(turnos.id, decoded.turnoId));

        if (!turno) {
            return redirect('/confirmar-turno/error?mensaje=Turno no encontrado');
        }

        // Check if already confirmed
        if (turno.estado === 'confirmado') {
            return redirect('/confirmar-turno/ya-confirmado');
        }

        // Check if can be confirmed (must be pendiente)
        if (turno.estado !== 'pendiente') {
            return redirect(`/confirmar-turno/error?mensaje=Turno en estado ${turno.estado}, no se puede confirmar`);
        }

        // Update to confirmado
        await db
            .update(turnos)
            .set({ estado: 'confirmado' })
            .where(eq(turnos.id, decoded.turnoId));

        // Redirect to success page
        return redirect('/confirmar-turno/exito');

    } catch (error: any) {
        console.error('Error confirmando turno:', error);

        if (error.name === 'JsonWebTokenError') {
            return redirect('/confirmar-turno/error?mensaje=Token inválido');
        }

        return redirect('/confirmar-turno/error?mensaje=Error al confirmar turno');
    }
};
