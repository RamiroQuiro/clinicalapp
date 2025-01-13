import {useState,useCallback} from 'react'

const useBusquedaFiltros = (arr, opcionesFiltrado) => {
  const [search, setSearch] = useState("");
  const [encontrado, setEncontrado] = useState(arr);

  const busquedaFiltros = useCallback(
    (arr, search) => {
      if (!search) return arr; // Si no hay búsqueda, devolvemos el array original
      if(search=='00') return arr
      return arr?.filter((item) => {
        if(opcionesFiltrado.length==0){
          if(item.toUpperCase().includes(search.toUpperCase())){
            return item
          }

        }
        return opcionesFiltrado.some((campo) => {
          const valorCampo = item[campo]; // Accedemos al valor del campo

          if (typeof valorCampo === "string") {
            // Si es un string, comparamos en mayúsculas
            return valorCampo.toUpperCase().includes(search.toUpperCase());
          }

          if (typeof valorCampo === "number") {
            // Si es un número, comparamos como string
            return String(valorCampo).includes(search);
          }

          // Si es otro tipo de dato o null/undefined, lo ignoramos
          return false;
        });
      });
    },
    [opcionesFiltrado]
  );

  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value;
      setSearch(value);
      setEncontrado(busquedaFiltros(arr, value));
    },
    [arr, busquedaFiltros]
  );

  return { search, encontrado, handleSearch, setSearch };
};

export default useBusquedaFiltros