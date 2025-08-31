import { callAIModel } from '@/services/ia.services';

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'No se proporcionó texto para procesar.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jsonResponse = await callAIModel(text);
    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el endpoint de IA:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor al procesar la IA.',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
