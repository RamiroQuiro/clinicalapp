import React, { useCallback, useEffect, useState } from 'react';

// Asumimos una estructura de tipo para el medicamento, se puede ajustar según la API
type Medicamento = {
  id: string;
  nombreGenerico: string;
  nombreComercial?: string;
  presentacion?: string;
  // Añadir otros campos que devuelva la API si son necesarios
};

type BuscadorVademecumProps = {
  onMedicamentoSelect: (medicamento: Medicamento) => void;
};

const BuscadorVademecum: React.FC<BuscadorVademecumProps> = ({ onMedicamentoSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Medicamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicamentos = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Buscando medicamentos para:', query);
      const response = await fetch(`/api/vademecum/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Error al buscar medicamentos');
      }
      const data = await response.json();
      if (data.code === 200) {
        setResults(data.data);
      } else {
        throw new Error(data.message || 'Error en la respuesta de la API');
      }
    } catch (err: any) {
      console.error('Error al buscar medicamentos:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMedicamentos(searchTerm);
    }, 500); // 500ms de debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchMedicamentos]);

  const handleSelect = (medicamento: Medicamento) => {
    setSearchTerm(''); // Limpiar el buscador
    setResults([]); // Limpiar resultados
    onMedicamentoSelect(medicamento); // Pasar el seleccionado al padre
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Buscar medicamento por nombre genérico o comercial..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
      />
      {isLoading && (
        <div className="absolute z-10 w-full p-2 mt-1 text-center bg-white border rounded-md shadow-lg">
          Buscando...
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full p-2 mt-1 text-center text-red-500 bg-white border rounded-md shadow-lg">
          {error}
        </div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map(medicamento => (
            <li
              key={medicamento.id}
              onClick={() => handleSelect(medicamento)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <div className="font-bold">
                {medicamento.nombreComercial || medicamento.nombreGenerico}
              </div>
              <div className="text-sm text-gray-600">{medicamento.nombreGenerico}</div>
              <div className="text-xs text-gray-500">{medicamento.presentacion}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuscadorVademecum;
