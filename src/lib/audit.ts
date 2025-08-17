import { db } from '../db'; // Ajusta la ruta a tu instancia de Drizzle si es necesario
import { auditLog } from '../db/schema';

interface LogEntry {
  userId: string;
  actionType: string; // Ej: CREATE_PATIENT, VIEW_PATIENT_RECORD, LOGIN_SUCCESS
  tableName: string;  // Ej: 'pacientes', 'atenciones'
  recordId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  description?: string;
}

/**
 * Registra un evento de auditoría en la base de datos.
 * @param entry Objeto con los detalles del evento a registrar.
 */
export async function logAuditEvent(entry: LogEntry) {
  try {
    await db.insert(auditLog).values({
      // El ID se genera automáticamente con crypto.randomUUID() en el schema
      userId: entry.userId,
      actionType: entry.actionType,
      tableName: entry.tableName,
      recordId: entry.recordId,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      description: entry.description,
    });
  } catch (error) {
    console.error("Error al registrar el evento de auditoría:", error);
    // En un sistema de producción, considera un mecanismo de fallback o alerta
    // si la auditoría falla, ya que es un proceso crítico.
  }
}