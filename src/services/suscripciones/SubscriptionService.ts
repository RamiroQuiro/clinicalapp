import db from '@/db';
import { planes, suscripciones } from '@/db/schema';
import { and, desc, eq, gt, or } from 'drizzle-orm';
import type { ISubscriptionManager } from './ISubscriptionManager';

export class SubscriptionService implements ISubscriptionManager {

    /**
     * Obtiene el plan activo actual del centro médico.
     * Prioriza suscripciones 'activas' o 'prueba' que no hayan vencido.
     */
    async getPlanActual(centroMedicoId: string) {
        // Buscamos la suscripción más reciente que esté activa o en prueba
        // y cuya fecha de fin no haya pasado (o sea null/indefinido)
        const now = new Date();

        const [suscripcion] = await db
            .select({
                plan: planes
            })
            .from(suscripciones)
            .innerJoin(planes, eq(suscripciones.planId, planes.id))
            .where(and(
                eq(suscripciones.centroMedicoId, centroMedicoId),
                or(eq(suscripciones.estado, 'activa'), eq(suscripciones.estado, 'prueba')),
                or(gt(suscripciones.fechaFin, now), eq(suscripciones.fechaFin, null as any)) // null as any por tema de tipos de Drizzle a veces
            ))
            .orderBy(desc(suscripciones.created_at))
            .limit(1);

        return suscripcion?.plan || null;
    }

    /**
     * Verifica si un feature booleano está habilitado en el plan.
     */
    async hasFeature(centroMedicoId: string, featureKey: string): Promise<boolean> {
        const plan = await this.getPlanActual(centroMedicoId);

        // Si no hay plan, asumimos sin acceso (o plan gratuito base muy limitado si existiera)
        if (!plan) return false;

        const limites = plan.limites as Record<string, any>;

        // Verificamos si la key existe y es true
        return !!limites[featureKey];
    }

    /**
     * Comprueba límites numéricos (ej: maxProfesionales).
     * Retorna { allowed: true } si está dentro del límite.
     */
    async checkLimit(centroMedicoId: string, resourceKey: string, currentCount: number): Promise<{ allowed: boolean; limit: number | string }> {
        const plan = await this.getPlanActual(centroMedicoId);

        if (!plan) {
            return { allowed: false, limit: 0 }; // Sin plan no hay servicio
        }

        const limites = plan.limites as Record<string, any>;
        const limite = limites[resourceKey];

        // Si el límite no está definido, o es 'ilimitado'/-1, permitimos
        if (limite === undefined || limite === -1 || limite === 'unlimited') {
            return { allowed: true, limit: 'Ilimitado' };
        }

        // Chequeo numérico estricto
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
