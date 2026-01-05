type AIProvider = 'gemini' | 'groq';

// Función principal que actúa como router
export const callAIModel = async (text: string, provider: AIProvider = 'groq') => {
  if (provider === 'gemini') {
    return await callGeminiModel(text);
  } else {
    return await callGroqModel(text);
  }
};

const commonPrompt = (text: string) => `
    Eres un asistente médico altamente preciso. Tu tarea es transcribir y estructurar la información de un dictado clínico a un formato JSON. NO RESUMAS NI ABREVIES la información, extrae el texto de la forma más literal posible.

    ### INSTRUCCIONES:
    1.  Analiza el "Texto a analizar" proporcionado.
    2.  Extrae la información y rellena los campos del "Formato JSON esperado".
    3.  Si un campo no se menciona en el texto, su valor debe ser 'null' (o un array vacío [] para listas).
    4.  Para los signos vitales, extrae el valor correspondiente. Ejemplos:
        - "presión 120/80" -> "tensionArterial": "120/80"
        - "temperatura de 37.5 grados" -> "temperatura": 37.5
        - "frecuencia cardíaca de 80" -> "frecuenciaCardiaca": 80
    5.  Para los diagnósticos, si se mencionan varios, crea un objeto para cada uno en la lista.
    6.  **Importante**: Revisa el texto cuidadosamente y asegúrate de rellenar TODOS los campos posibles del formato JSON. No omitas ninguno si la información está presente.

    ### Formato JSON esperado:
    {
      "motivoConsulta": "string | null",
      "sintomas": "string | null",
      "examenFisico": "string | null",
      "diagnosticos": [
        {
          "nombre": "string | null",
          "observaciones": "string | null",
          "codigoCIE": "string | null"
        }
      ],
      "medicamentos": [
        {
          "nombreGenerico": "string | null",
          "nombreComercial": "string | null",
          "dosis": "string | null",
          "frecuencia": "string | null"
        }
      ],
      "signosVitales": {
        "tensionArterial": "string | null",
        "frecuenciaCardiaca": "number | null",
        "frecuenciaRespiratoria": "number | null",
        "temperatura": "number | null",
        "saturacionOxigeno": "number | null"
      },
      "tratamiento": "string | null",
      "planSeguir": "string | null"
    }

    ### Texto a analizar:
    """${text}"""
    `;

// --- Implementación para Groq ---
const callGroqModel = async (text: string) => {
  const apiKey = import.meta.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('La GROQ_API_KEY no está configurada en el archivo .env');
  }
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const requestBody = {
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: 'Eres un asistente médico. Tu única función es devolver un objeto JSON basado en el texto del usuario. No incluyas texto adicional ni explicaciones, solo el JSON.',
      },
      { role: 'user', content: commonPrompt(text) },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error desde la API de Groq:', errorBody);
      throw new Error(`La solicitud a la API de Groq falló con el estado ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    return JSON.parse(rawText);
  } catch (error) {
    console.error('Error llamando al modelo de Groq:', error);
    throw error;
  }
};

// --- Implementación para Gemini ---
const callGeminiModel = async (text: string) => {
  const apiKey = import.meta.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('La GOOGLE_API_KEY no está configurada en el archivo .env');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  const requestBody = {
    contents: [{ parts: [{ text: commonPrompt(text) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };



  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error desde la API de Gemini:', errorBody);
      throw new Error(`La solicitud a la API de Gemini falló con el estado ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    return JSON.parse(rawText);
  } catch (error) {
    console.error('Error llamando al modelo de Gemini:', error);
    throw error;
  }
};
