export interface ISubscriptionManager {
    /**
     * Verifica si un centro médico tiene acceso a una funcionalidad específica
     * basada en su plan actual.
     * @param centroMedicoId ID del centro médico
     * @param featureKey Clave de la funcionalidad (ej: 'iaEnabled', 'soporte')
     */
    hasFeature(centroMedicoId: string, featureKey: string): Promise<boolean>;

    /**
     * Verifica si un centro médico ha alcanzado el límite de un recurso.
     * @param centroMedicoId ID del centro médico
     * @param resourceKey Clave del recurso en los límites (ej: 'maxProfesionales')
     * @param currentCount Cantidad actual del recurso en uso
     */
    checkLimit(centroMedicoId: string, resourceKey: string, currentCount: number): Promise<{ allowed: boolean; limit: number | string }>;

    /**
     * Obtiene el plan activo de un centro médico.
     * @param centroMedicoId ID del centro médico
     */
    getPlanActual(centroMedicoId: string): Promise<any>;
}
