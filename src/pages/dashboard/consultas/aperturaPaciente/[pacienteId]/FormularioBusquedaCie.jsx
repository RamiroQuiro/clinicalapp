import InputComponenteJsx from '@/pages/dashboard/dashboard/componente/InputComponenteJsx';
import { SquarePlus } from 'lucide-react';
import { useState } from 'react';

export default function FormularioBusquedaCie() {
  const [search, setSearch] = useState('');
  const [resultado, setResultado] = useState([]);

  const handleSearch = async e => {
    setSearch(e.target.value);
    if (e.target.value.length > 3) {
      try {
        const fetching = await fetch(`/api/cie11/search?q=${encodeURIComponent(e.target.value)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await fetching.json();
        console.log(data);
        setResultado(data);
      } catch (error) {}
    }
    console.log(search);
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
