import jwt from 'jsonwebtoken';

const CONFIRMATION_TURNO_SECRET = import.meta.env.CONFIRMATION_TURNO_SECRET;

export function generateTurnoToken(turnoId: string, expiresInDays: number = 7): string {
    return jwt.sign(
        { turnoId },
        CONFIRMATION_TURNO_SECRET,
        { expiresIn: `${expiresInDays}d` }
    );
}

export function verifyTurnoToken(token: string): { turnoId: string } | null {
    try {
        return jwt.verify(token, CONFIRMATION_TURNO_SECRET) as { turnoId: string };
    } catch {
        return null;
    }
}
