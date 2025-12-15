import db from '@/db';
import { planes, suscripciones } from '@/db/schema';
import { and, desc, eq, gt, or } from 'drizzle-orm';
import type { ISubscriptionManager } from './ISubscriptionManager';

export class SubscriptionService implements ISubscriptionManager {

    /**
     * Obtiene el plan activo actual del centro médico.
     * Prioriza suscripciones 'activas' o 'prueba' que no hayan vencido.
     * Soporta Grandfathering: si hay planSnapshot, usa eso.
     */
    async getPlanActual(centroMedicoId: string) {
        const now = new Date();

        const [result] = await db
            .select({
                plan: planes,
                suscripcion: suscripciones
            })
            .from(suscripciones)
            .innerJoin(planes, eq(suscripciones.planId, planes.id))
            .where(and(
                eq(suscripciones.centroMedicoId, centroMedicoId),
                or(eq(suscripciones.estado, 'activa'), eq(suscripciones.estado, 'prueba')),
                or(gt(suscripciones.fechaFin, now), eq(suscripciones.fechaFin, null as any))
            ))
            .orderBy(desc(suscripciones.created_at))
            .limit(1);

        if (!result) return null;

        // LÓGICA DE GRANDFATHERING:
        const limites = result.suscripcion.planSnapshot
            ? (result.suscripcion.planSnapshot as any)
            : result.plan.limites;

        return {
            ...result.plan,
            limites: limites
        };
    }

    /**
     * Verifica si un feature booleano está habilitado en el plan.
     */
    async hasFeature(centroMedicoId: string, featureKey: string): Promise<boolean> {
        const plan = await this.getPlanActual(centroMedicoId);

        if (!plan) return false;

        const limites = plan.limites as Record<string, any>;

        return !!limites[featureKey];
    }

    /**
     * Comprueba límites numéricos (ej: maxProfesionales).
     * Retorna { allowed: true } si está dentro del límite.
     */
    async checkLimit(centroMedicoId: string, resourceKey: string, currentCount: number): Promise<{ allowed: boolean; limit: number | string }> {
        const plan = await this.getPlanActual(centroMedicoId);

        if (!plan) {
            return { allowed: false, limit: 0 };
        }

        const limites = plan.limites as Record<string, any>;
        const limite = limites[resourceKey];

        // Ilimitado
        if (limite === undefined || limite === -1 || limite === 'unlimited') {
            return { allowed: true, limit: 'Ilimitado' };
        }

        // Chequeo numérico
        if (typeof limite === 'number') {
            return {
                allowed: currentCount < limite,
                limit: limite
            };
        }

        return { allowed: false, limit: 0 };
    }
}

export const subscriptionService = new SubscriptionService();
