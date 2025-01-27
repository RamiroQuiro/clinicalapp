import InputComponenteJsx from '@/pages/dashboard/dashboard/componente/InputComponenteJsx';
import { FileSearch, SquarePlus } from 'lucide-react';
import { useRef, useState } from 'react';

export default function FormularioBusquedaCie() {
  const [search, setSearch] = useState('');
  const [resultado, setResultado] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const timeoutId = useRef(null);

  // Manejador de búsqueda en tiempo real
  const handleSearch = async e => {
    const inputValue = e.target.value.trim();

    if (inputValue === '') {
      // Si el campo está vacío, limpiamos todo
      setResultado([]);
      setBuscando(false);
      setSearch('');
      return;
    }

    setSearch(inputValue);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current); // Limpiar cualquier búsqueda pendiente
    }

    if (inputValue.length >= 3) {
      setBuscando(true);
      timeoutId.current = setTimeout(async () => {
        await bucarCie11(inputValue); // Buscar después de 2 segundos
      }, 2000);
    }
  };

  // Buscar CIE-11 en el backend
  const bucarCie11 = async query => {
    try {
      const response = await fetch(`/api/cie11/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResultado(data);
      setBuscando(false);
    } catch (error) {
      console.error(error);
      setBuscando(false);
    }
  };

  // Renderizar resultados con manejo adicional
  const renderResultados = () => {
    if (resultado.length === 0) {
      return <span className="text-primary-400">No se encontraron resultados</span>;
    }

    return resultado.map((entity, i) => (
      <li
        key={i}
        className="w-full flex gap-1 items-start justify-between bg-primary-bg-componentes hover:bg-gray-300 hover:text-primary-textoTitle duration-300  rounded-lg py-1 px-3   shadow-sm cursor-pointer"
        onClick={() => console.log(`Seleccionaste: ${entity.title}`)} // Aquí podrías manejar una acción
      >
        <div className="flex-1 border-r">
          <h2>{entity.title}</h2>
        </div>
        <div className="border-r px-1">
          <p>Capítulo: {entity.chapter}</p>
        </div>
        <div className="px-1">
          <p>Código: {entity.code}</p>
        </div>
        <a href={entity.id} target="_blank" rel="noopener noreferrer">
          {entity.id}
        </a>
      </li>
    ));
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 relative">
      <div className="w-full flex items-center justify-between text-sm gap-2">
        <InputComponenteJsx
          placeholder="Buscar CIE-11"
          value={search}
          handleChange={handleSearch}
          name="busqueda"
          type="search"
          id="busqueda-cie11"
        />
        <button
          className="bg-primary-texto/50 hover:bg-primary-texto duration-300 p-1 rounded-lg"
          onClick={() => console.log('Agregar nuevo registro')} // Acción al hacer clic en el botón
        >
          <SquarePlus className="w-6 h-6 stroke-white" />
        </button>
      </div>

      {/* Resultados */}
      {search.length >= 3 && (
        <div
          tabIndex={0}
          className="absolute animate-aparecer top-[110%] max-h-fit left-0 w-full border rounded-lg p-3 bg-white text-sm text-primary-texto"
        >
          {buscando ? (
            <span className="text-primary-200 inline-flex font-semibold animate-pulse">
              <FileSearch /> Buscando...
            </span>
          ) : (
            <ul className="gap-2 flex flex-col">{renderResultados()}</ul>
          )}
        </div>
      )}
    </div>
  );
}
