import { useState } from 'react';

interface Props {
  centroId: string;
}

interface OpcionTurno {
  turnoId: string;
  userMedicoId: string;
  profesionalNombre: string;
  especialidad: string;
  hora: string;
}

export default function AutoCheckInForm({ centroId }: Props) {
  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [opciones, setOpciones] = useState<OpcionTurno[]>([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setOpciones([]);

    if (!dni.trim()) {
      setError('Por favor, ingrese un DNI.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/public/autocheckin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          centroMedicoId: centroId,
          turnoId: turnoSeleccionado || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.opciones) {
          setOpciones(data.opciones);
          setError('Tiene múltiples turnos hoy. Por favor, seleccione cuál recepcionar.');
          return;
        }
        throw new Error(data.message || 'Ocurrió un error en el servidor.');
      }

      setSuccessMessage(data.message + ' Será redirigido en 3 segundos...');

      // Redirigir al portal del paciente después de un momento
      setTimeout(() => {
        window.location.href = `/portal/${data.token}`;
      }, 3000);
    } catch (apiError: any) {
      setError(
        apiError.message ||
          'No se pudo realizar el check-in. Verifique el DNI o contacte a recepción.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow-sm p-8 border rounded-lg">
      <div>
        <label htmlFor="dni" className="block font-medium text-gray-700 text-sm">
          Documento Nacional de Identidad (DNI)
        </label>
        <input
          type="text"
          id="dni"
          value={dni}
          onChange={e => setDni(e.target.value)}
          placeholder="Ingrese su número de documento"
          disabled={isLoading}
          className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-blue-500 w-full sm:text-sm placeholder-gray-400"
        />
      </div>

      {opciones.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-gray-700 text-sm">Seleccione el turno a recepcionar:</p>
          {opciones.map(op => (
            <label key={op.turnoId} className="flex items-center gap-2">
              <input
                type="radio"
                name="turno"
                value={op.turnoId}
                checked={turnoSeleccionado === op.turnoId}
                onChange={e => setTurnoSeleccionado(e.target.value)}
                disabled={isLoading}
              />
              <span className="text-sm">
                {op.profesionalNombre} ({op.especialidad}) -{' '}
                {new Date(op.hora).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </label>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

      <button
        type="submit"
        disabled={isLoading || (opciones.length > 0 && !turnoSeleccionado)}
        className="flex justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 shadow-sm px-4 py-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm"
      >
        {isLoading ? 'Procesando...' : 'Registrar Llegada'}
      </button>
    </form>
  );
}
