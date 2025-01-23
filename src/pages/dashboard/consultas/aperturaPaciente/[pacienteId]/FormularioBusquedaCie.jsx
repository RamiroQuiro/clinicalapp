import InputComponenteJsx from '@/pages/dashboard/dashboard/componente/InputComponenteJsx';
import { FileSearch, SquarePlus } from 'lucide-react';
import { useRef, useState } from 'react';

export default function FormularioBusquedaCie() {
  const [search, setSearch] = useState('');
  const [resultado, setResultado] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const timeoutId = useRef(null);

  const handleSearch = async e => {
    setSearch(e.target.value);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (e.target.value.length >= 3) {
      setBuscando(true);
      timeoutId.current = setTimeout(async () => {
        const data = await bucarCie11(e.target.value);
      }, 2000);
    }
    console.log(search);
  };

  //   funcion para buscar los cie 11
  const bucarCie11 = async query => {
    try {
      const fetching = await fetch(`/api/cie11/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await fetching.json();
      console.log(data);
      setResultado(data);
      setBuscando(false);
    } catch (error) {
      setBuscando(false);
      console.log(error);
    }
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 relative">
      <div className="w-full flex items-center justify-between text-sm gap-2">
        <InputComponenteJsx
          placeholder="Busqueda"
          value={search}
          handleChange={handleSearch}
          name=""
          type="text"
          id=""
        />
        <button className="bg-primary-texto/50 hover:bg-primary-texto duration-300 p-1 rounded-lg ">
          <SquarePlus className="w-6 h-6 stroke-white" />
        </button>
      </div>
      {buscando && (
        <div
          tabIndex={0}
          className="absolute animate-aparecer top-[110%] left-0 w-full border rounded-lg p-3 bg-white text-sm text-primary-texto"
        >
          <span className="text-green-700 inline-flex font-semibold animate-pulse ">
            <FileSearch /> Buscando...
          </span>
        </div>
      )}
      {resultado.length > 0 ||
        (resultado.status == 500 && (
          <div
            tabIndex={0}
            className="absolute animate-aparecer top-[110%] left-0 w-full border rounded-lg p-3 bg-white text-sm text-primary-texto"
          >
            <span className="text-primary-400">
              {' '}
              {resultado.status == 500 && 'Error al buscar'}
            </span>
          </div>
        ))}
    </div>
  );
}
