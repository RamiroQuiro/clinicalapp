import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
// import { fetchProfesionalesDelCentro } from '@/services/recepcionista.services';

export const GET: APIRoute = async ({ locals }) => {
  const { user } = locals;

  if (!user || !user.centroMedicoId) {
    return createResponse(401, 'No autorizado o no se encontró el centro médico.', true);
  }

  try {
    // const profesionales = await fetchProfesionalesDelCentro(user.centroMedicoId);
    return createResponse(200, 'Profesionales obtenidos con éxito', false);
  } catch (error: any) {
    console.error('Error en el endpoint /api/recepcion/profesionales:', error);
    return createResponse(500, error.message || 'Error interno del servidor', true);
  }
};