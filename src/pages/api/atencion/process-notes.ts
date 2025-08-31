import type { APIRoute } from 'astro';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY no está definida en las variables de entorno.');
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'No se proporcionó texto para procesar.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Eres un asistente médico experto en extraer información estructurada de notas clínicas. 
    Analiza el siguiente texto dictado por un médico y extrae la siguiente información en formato JSON. 
    Si algún campo no se encuentra en el texto, su valor debe ser null. 
    Para los medicamentos, si no se especifica la dosis, frecuencia o duración, usa null.

    Formato JSON esperado:
    {
      "diagnostico": {
        "nombre": "string | null",
        "observaciones": "string | null",
        "codigoCIE": "string | null"
      },
      "medicamentos": [
        {
          "nombreGenerico": "string",
          "nombreComercial": "string | null",
          "dosis": "string | null",
          "frecuencia": "string | null"
        }
      ],
      "plan_a_seguir": "string | null"
    }

    Texto a analizar:
    """${text}"""
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Intentar parsear el JSON. A veces Gemini puede añadir texto extra.
    let jsonResponse;
    try {
      // Buscar el primer y último corchete para asegurar que se parsea solo el JSON
      const jsonStartIndex = rawText.indexOf('{');
      const jsonEndIndex = rawText.lastIndexOf('}');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const jsonString = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
        jsonResponse = JSON.parse(jsonString);
      } else {
        throw new Error('No se encontró un objeto JSON válido en la respuesta de la IA.');
      }
    } catch (parseError) {
      console.error('Error al parsear la respuesta JSON de la IA:', parseError);
      console.error('Respuesta cruda de la IA:', rawText);
      return new Response(JSON.stringify({ error: 'Error al procesar la respuesta de la IA.', raw: rawText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(jsonResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el endpoint de IA:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor al procesar la IA.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};