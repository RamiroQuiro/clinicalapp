import db from '@/db';
import { auditLog } from '@/db/schema';

interface LogEventParams {
  userId: string;
  actionType:
  | 'CREATE'
  | 'VIEW'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'EXPORT';
  tableName: string;
  recordId?: string;
  oldValue?: any;
  newValue?: any;
  centroMedicoId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const logAuditEvent = async (params: LogEventParams) => {
  const {
    userId,
    actionType,
    tableName,
    recordId,
    oldValue,
    centroMedicoId,
    newValue,
    description,
    ipAddress,
    userAgent,
  } = params;

  try {
    await db.insert(auditLog).values({
      userId,
      actionType,
      centroMedicoId,
      tableName,
      recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      description,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // En un caso real, podríamos querer tener un sistema de alerta o un fallback
    // si la auditoría falla, pero por ahora solo lo logueamos en consola.
  }
};
