import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { eq } from 'drizzle-orm';

const defaulPreferencias = {
  configuracionGeneral: {
    tema: 'claro',
    idioma: 'es',
    mostrarHistorialCompleto: true,
    notificaciones: {
      recordatorios: true,
      alertasCriticas: true,
    },
  },
  signosVitales: {
    mostrar: true,
    campos: [
      'peso',
      'talla',
      'temperatura',
      'perimetroCefalico',
      'presionSistolica',
      'presionDiastolica',
      'saturacionOxigeno',
      'frecuenciaRespiratoria',
      'perimetroAbdominal',
      'imc',
      'glucosa',
      'dolor',
    ],
  },
  consulta: {
    motivoInicial: true,
    sintomas: true,
    diagnostico: true,
    tratamientoFarmacologico: true,
    tratamientoNoFarmacologico: true,
    planASeguir: true,
    archivosAdjuntos: true,
    notasPrivadas: false,
  },
  reportes: {
    incluirDatosPaciente: true,
    incluirDatosMedico: true,
    incluirFirmaDigital: true,
  },
};

/**
 * Actualiza las preferencias de un perfil de usuario específico en la base de datos.
 */
export const actualizarPreferenciasUsuario = async (
  perfilId: string,
  nuevasPreferencias: object
) => {
  try {
    // Drizzle con mode: 'json' maneja automáticamente la serialización del objeto a JSON string.
    const updateResult = await db
      .update(preferenciaPerfilUser)
      .set({
        preferencias: nuevasPreferencias, // Pasamos el objeto JavaScript directamente
        updated_at: new Date(),
      })
      .where(eq(preferenciaPerfilUser.id, perfilId));

    if (updateResult.rowsAffected === 0) {
      console.warn(
        `[preferencias.utils] No se encontró el perfil de preferencias con ID: ${perfilId} para actualizar.`
      );
    } else {
      console.log(
        `[preferencias.utils] Preferencias actualizadas para el perfil con ID: ${perfilId}`
      );
    }
    return updateResult;
  } catch (error) {
    console.error(
      `[preferencias.utils] Error al actualizar preferencias para el perfil ${perfilId}:`,
      error
    );
    throw error; // Re-lanzar el error para que el llamador pueda manejarlo
  }
};
