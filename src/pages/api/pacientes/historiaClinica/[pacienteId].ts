import { getPacienteData } from '@/services/pacientePerfil.services';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
  const { pacienteId } = params;
  const { session, user } = locals;
  // fatna validar la autehcitacion
  console.log('paciente id', pacienteId);
  console.log('user id', user.id);
  try {
    const data = await getPacienteData(pacienteId as string, user.id as string);
    console.log('data del paciente en el enpoint->', data);
    return createResponse(200, 'Paciente encontrado', data);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar', error);
  }
};
