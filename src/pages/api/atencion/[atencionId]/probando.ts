import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;
  return createResponse(200, 'hola');
};
