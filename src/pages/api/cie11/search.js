/**
 * Endpoint para buscar diagnósticos en la API de CIE-11 de la OMS
 * Este endpoint realiza dos pasos principales:
 * 1. Obtiene un token de acceso usando las credenciales de la OMS
 * 2. Usa ese token para buscar diagnósticos
 *
 * Para que funcione, necesitas en tu .env:
 * WHO_CLIENT_ID=tu_client_id
 * WHO_CLIENT_SECRET=tu_client_secret
 *

 */

export async function GET({ request }) {
  try {
    // Verifica las credenciales antes de continuar
    if (!import.meta.env.WHO_CLIENT_ID || !import.meta.env.WHO_CLIENT_SECRET) {
      throw new Error('Las credenciales de la OMS no están configuradas en el entorno');
    }

    // Extraer el término de búsqueda de la URL
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    console.log('Término de búsqueda:', query);

    // Validar que existe un término de búsqueda
    if (!query) {
      return new Response(JSON.stringify([]), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // PASO 1: Obtener token de acceso
    console.log('Obteniendo token de acceso...');
    const tokenResponse = await fetch('https://icdaccessmanagement.who.int/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Parámetros requeridos por la OMS para la autenticación
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: import.meta.env.WHO_CLIENT_ID,
        client_secret: import.meta.env.WHO_CLIENT_SECRET,
        scope: 'icdapi_access',
      }),
    });

    const tokenData = await tokenResponse.json();

    // Verificar si obtuvimos el token correctamente
    if (!tokenResponse.ok) {
      console.error('Error en la respuesta del token:', tokenData);
      throw new Error('Error obteniendo token de acceso');
    }

    console.log('Token obtenido exitosamente');
    const accessToken = tokenData.access_token;

    // PASO 2: Realizar la búsqueda
    // Construir URL de búsqueda con parámetros:
    // - q: término de búsqueda
    // - useFlexisearch: true para búsqueda más flexible
    // - flatResults: true para resultados simplificados
    // - releaseId: versión de CIE-11 a usar
    const searchUrl = `https://id.who.int/icd/release/11/2023-01/mms/search?q=${encodeURIComponent(query)}`;

    // Hacer la petición a la API de búsqueda
    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'API-Version': 'v2',
        'Accept-Language': 'es', // Resultados en español
        'Content-Type': 'application/json',
      },
    });

    // Verificar si la búsqueda fue exitosa
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Error en la respuesta de búsqueda:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        body: errorText,
      });
      throw new Error('Error en la búsqueda CIE');
    }

    // Procesar los resultados
    const searchData = await searchResponse.json();
    console.log('Resultados obtenidos:', searchData);

    // Función para limpiar las etiquetas HTML (como <em>)
    function cleanHTML(text) {
      return text.replace(/<[^>]*>/g, ''); // Elimina todas las etiquetas HTML
    }

    // Obtener el código del diagnóstico (en CIE-11, puede estar en diferentes campos)
    const obtenerCodigo = entity => {
      return entity.code || entity.stem || entity.theCode || 'No disponible';
    };

    // Transformar los resultados al formato requerido
    const results =
      searchData.destinationEntities?.map(entity => ({
        title: cleanHTML(entity.title), // Título del diagnóstico
        cie10: obtenerCodigo(entity),
        cie11: entity.theCode, // Código CIE-10 o CIE-11
        id: entity.id.split('/').pop(), // Extraemos el ID al final de la URL
        chapter: entity.chapter || 'Desconocido', // Capítulo (si está disponible)
      })) || [];

    // Retornar los resultados en formato JSON
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Manejo de errores
    console.error('Error detallado:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: 'Error en la búsqueda CIE',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
