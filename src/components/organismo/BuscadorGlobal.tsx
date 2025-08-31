import { CalendarPlus, Search, Stethoscope, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Tipos de datos
interface PacienteResult {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
}

export default function BuscadorGlobal() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PacienteResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Efecto para buscar pacientes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pacientes/buscar?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Error en la respuesta de la API');
        const data: PacienteResult[] = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Error al buscar pacientes:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  // Efecto para cerrar el dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);

  return (
    <div
      className="relative md:flex md:w-1/2 w-full items-center md:justify-center"
      ref={searchContainerRef}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        id="global-search-input" // ID para el foco global
        type="search"
        placeholder="Buscar paciente..."
        className="w-full bg-gray-100/80 border border-transparent rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-100/50 focus:border-primary-100"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
      />

      {isFocused && query.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-gray-500">Buscando...</p>}
          {!loading && results.length === 0 && query.length > 1 && (
            <p className="p-4 text-sm text-gray-500">
              No se encontraron resultados para "{query}".
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map(paciente => (
                <li key={paciente.id} className="border-b border-gray-100 last:border-b-0">
                  <div className="p-3">
                    <p className="font-semibold text-gray-800">
                      {paciente.nombre} {paciente.apellido}
                    </p>
                    <p className="text-sm text-gray-600">DNI: {paciente.dni}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={`/dashboard/consultas/aperturaPaciente/${paciente.id}`}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        <CalendarPlus size={14} />
                        <span>Dar Turno</span>
                      </a>
                      <a
                        href={`/api/atencion/nueva?pacienteId=${paciente.id}`}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                      >
                        <Stethoscope size={14} />
                        <span>Atender</span>
                      </a>
                      <a
                        href={`/dashboard/pacientes/${paciente.id}`}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                      >
                        <User size={14} />
                        <span>Perfil</span>
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
