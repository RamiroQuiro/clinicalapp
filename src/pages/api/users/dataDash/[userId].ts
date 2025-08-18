import { getDashboardData } from '@/services/dashboard.services';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { userId } = params;
  try {
    const data = await getDashboardData(userId as string);
    console.log('exnpoint de dash para la data', data);
    return createResponse(200, 'exito', data);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al obtener datos del dashboard', error);
  }
};
