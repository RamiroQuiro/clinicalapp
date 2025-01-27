import { filtroBusqueda } from '@/context/store';
import { useState } from 'react';
export default function FiltroPacientes() {
  const [search, setSearch] = useState('');

  const handleSearch = e => {
    setSearch(state => {
      filtroBusqueda.set({ filtro: e.target.value.toLowerCase() });
      return e.target.value.toLowerCase();
    });
  };

  return (
    <div
      className={`${'styleContenedor'} w-full flex  items relative flex-col items-start gap- duration-300 group -md border rounded-lg`}
    >
      <input
        onChange={handleSearch}
        placeholder={'Ingrese el nombre aqui...'}
        value={search}
        type="search"
        name="busquedaCliente"
        id="busquedaCliente"
        className=" w-full text-sm bg-white  rounded-lg group-hover:ring-2  border-gray-300  ring-primary-100/70 focus:ring-2  outline-none transition-colors duration-200 ease-in-out px-2 py-2"
      />
    </div>
  );
}
