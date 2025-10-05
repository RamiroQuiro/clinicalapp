import { useState } from 'react';

export default function AutoCheckInForm() {
  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!dni.trim()) {
      setError('Por favor, ingrese un DNI.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/autocheckin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error en el servidor.');
      }

      console.log('[DEBUG] Respuesta exitosa de la API:', data);
      console.log('[DEBUG] Token recibido:', data.token);

      setSuccessMessage(data.message + ' Será redirigido en 3 segundos...');

      // Redirigir al portal del paciente después de un momento
      console.log('[DEBUG] Programando redirección...');
      setTimeout(() => {
        console.log(`[DEBUG] ¡Redirigiendo ahora a /portal/${data.token}!`);
        window.location.href = `/portal/${data.token}`;
      }, 3000);

    } catch (apiError: any) {
      setError(apiError.message || 'No se pudo realizar el check-in. Verifique el DNI o contacte a recepción.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 border rounded-lg shadow-sm">
      <div>
        <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
          Documento Nacional de Identidad (DNI)
        </label>
        <input
          type="text"
          id="dni"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Ingrese su número de documento"
          disabled={isLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Procesando...' : 'Registrar Llegada'}
      </button>
    </form>
  );
}
