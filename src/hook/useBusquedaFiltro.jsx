import { useCallback, useMemo, useState } from 'react';

const useBusquedaFiltros = (arr, opcionesFiltrado) => {
  const [search, setSearch] = useState('');

  const busquedaFiltros = useCallback(
    (items, term) => {
      if (!term) return items;
      if (term === '00') return items;

      return items?.filter(item => {
        if (opcionesFiltrado.length === 0) {
          return item.toUpperCase().includes(term.toUpperCase());
        }
        return opcionesFiltrado.some(campo => {
          const valorCampo = item[campo];
          if (typeof valorCampo === 'string') {
            return valorCampo.toUpperCase().includes(term.toUpperCase());
          }
          if (typeof valorCampo === 'number') {
            return String(valorCampo).includes(term);
          }
          return false;
        });
      });
    },
    [opcionesFiltrado]
  );

  const encontrado = useMemo(() => busquedaFiltros(arr, search), [arr, search, busquedaFiltros]);

  const handleSearch = useCallback(e => {
    setSearch(e.target.value);
  }, []);

  // Nuevo valor de retorno: indica si la búsqueda está activa y no se encontraron resultados.
  const noResultados = search?.length > 0 && encontrado?.length === 0;

  return { search, encontrado, handleSearch, setSearch, noResultados };
};

export default useBusquedaFiltros;
