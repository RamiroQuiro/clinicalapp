export const callAIModel = async (text: string) => {
  const apiKey = import.meta.env.GOOGLE_API_KEY;
  console.log('apiKey', apiKey);
  if (!apiKey) {
    console.error('La GEMINI_API_KEY no está configurada en el archivo .env');
    return 'Error: La clave de API para el servicio de IA no está configurada. Por favor, contacta al administrador.';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const fullPrompt = `Eres un asistente médico experto en extraer información estructurada de notas clínicas. 
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
      "signosVitales": {
        "frecuenciaCardiaca": "number | null",
        "frecuenciaRespiratoria": "number | null",
        "presionArterial": "string | null",
        "temperatura": "number | null",
        "satO2": "number | null"
      },
      "tratamiento": "string | null",
      "plan_a_seguir": "string | null",
      "sintomas": "string | null",
      "motivoConsulta": "string | null"
    }

    Texto a analizar:
    """${text}"""
    `;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error desde la API de Gemini:', errorBody);
      throw new Error(`La solicitud a la API falló con el estado ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    let jsonResponse;
    try {
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
      throw new Error('Error al procesar la respuesta de la IA.');
    }

    return jsonResponse;
  } catch (error) {
    console.error('Error llamando al modelo de IA:', error);
    return 'Error: No se pudo conectar con el servicio de IA. Verifica la clave de API y la conexión a internet.';
  }
};
