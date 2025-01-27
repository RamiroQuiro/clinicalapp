import InputComponenteJsx from '@/pages/dashboard/dashboard/componente/InputComponenteJsx';
import { FileSearch, SquarePlus } from 'lucide-react';
import { useRef, useState } from 'react';

export default function FormularioBusquedaCie() {
  const [search, setSearch] = useState('');
  const [resultado, setResultado] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const timeoutId = useRef(null);


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
      setResultado(data);
      setBuscando(false);
    } catch (error) {
      setBuscando(false);
      console.log(error);
    }
  };
const handleSelectDiagnositco = entity => {
  setSearch(entity.title)
  setResultado([]); // Limpiar resultados
  setBuscando(false); // Detener la animación de búsqueda (si aplica)
}


  const handleSearch = async e => {
    if (e.target.value === '') {
      setResultado([]); // Limpiar resultados
      setBuscando(false); // Detener la animación de búsqueda (si aplica)
      setSearch(''); // Limpiar el estado del search
      return; // Terminar ejecución
    }

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


const hanldeSelectDiagnositco=(codeEntity)=>{
document.getElementById('codigoCIE').value=codeEntity.cie11
document.getElementById('diagnostico').value=codeEntity.title

  setSearch('')
  setResultado([])
  
}

  return (
    <div className="w-full flex items-center justify-between gap-2 relative">
      <div className="w-full flex items-center justify-between text-sm gap-2">
        <InputComponenteJsx
          placeholder="Busqueda"
          value={search}
          handleChange={handleSearch}
          name=""
          type="search"
          id=""
        />
        <button className="bg-primary-texto/50 hover:bg-primary-texto duration-300 p-1 rounded-lg ">
          <SquarePlus className="w-6 h-6 stroke-white" />
        </button>
      </div>
      {/* resultados */}

      {search.length >= 3 && (
        <>
          {buscando && (
            <div
              tabIndex={0}
              className="absolute animate-aparecer top-[110%] max-h-fit left-0 w-full border rounded-lg p-3 bg-white text-sm text-primary-texto"
            >
              <span className="text-primary-200 inline-flex font-semibold animate-pulse ">
                <FileSearch /> Buscando...
              </span>
            </div>
          )}
          {resultado.length > 0 && (
            <div
              tabIndex={0}
              className="gap-2 flex flex-col absolute animate-aparecer top-[115%] left-0 w-full border overflow-y-scroll rounded-lg p-0.5  bg-white text-sm text-primary-texto"
            >
              {resultado.status == 500 && <span className="text-primary-400">Error al buscar</span>}
              {resultado.length == 0 ? (
                <span className="text-primary-400">No se encontraron resultados</span>
              ) : (
                resultado.length > 1 &&
                resultado?.map((entity, i) => (
                  <li
                  onClick={()=>hanldeSelectDiagnositco(entity)} 
                    className="w-full flex gap-1 items-start justify-between bg-primary-bg-componentes hover:bg-gray-300 hover:text-primary-textoTitle duration-300  rounded-lg py-1 px-3   shadow-sm cursor-pointer"
                    key={entity.id}
                  >
                    <div className="flex-1 border-r">
                      <h2>{entity.title}</h2>
                    </div>
                    <div className="border-r px-1">
                      <p>capitulo{entity.chapter}</p>
                    </div>
                    <div className="border-r px-1">
                      <p>{entity.cie11}</p>
                    </div>
                  </li>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
