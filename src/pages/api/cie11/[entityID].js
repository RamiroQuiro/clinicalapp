

export async function GET({ params }) {
const {entityID}=params
    try {
      // Verifica las credenciales antes de continuar
      if (!import.meta.env.WHO_CLIENT_ID || !import.meta.env.WHO_CLIENT_SECRET) {
        throw new Error('Las credenciales de la OMS no están configuradas en el entorno');
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

      const searchUrl = `https://id.who.int/icd/entity/${entityID}`;

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
const data=await searchResponse.json()
return new Response(JSON.stringify(data), {
  headers: { "content-type": "application/json" },
})

    }catch(error) {
      console.log(error)
    }
  }