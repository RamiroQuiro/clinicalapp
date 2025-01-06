// Importamos las funciones necesarias de React
import { useState, useCallback } from 'react';

// Definimos nuestro hook personalizado
const useBusquedaFiltros = (arr) => {
  // Inicializamos el estado de 'search' y 'encontrado'
  const [search, setSearch] = useState('');
  const [encontrado, setEncontrado] = useState(arr);
  // Definimos la función de búsqueda
  const busquedaFiltros = useCallback(
    (arr, search) => {
      // Filtramos el array basándonos en la búsqueda
      const encontrado = arr?.filter((leg) => {
        // Comprobamos si cada campo coincide con la búsqueda
        let busquedaNombre = leg.nombre?.toUpperCase().includes(search?.toUpperCase());
        
        let apellido = leg.apellido?.toUpperCase().includes(search?.toUpperCase());
        let dni = String(leg.dni)?.includes(search);
        
        // Si alguno de los campos coincide y el elemento está activo, lo retornamos
        if (busquedaNombre ||  dni || apellido) {
          // if (leg.activo == true) {
            return leg;
          // }
        }
      });

      // Retornamos los elementos encontrados
      return encontrado;
    },
    []  // Dependencias de useCallback
  );

  // Definimos la función que maneja la búsqueda
  const handleSearch = useCallback(
    (e) => {
      // Actualizamos el estado de 'search'
      setSearch(e.target.value);
  
      // Actualizamos el estado de 'encontrado' con los resultados de la búsqueda
      setEncontrado(busquedaFiltros(arr, e.target.value));
    },
    [arr, busquedaFiltros]  // Dependencias de useCallback
  );
  // Retornamos los estados y funciones que queremos exponer
  return { search, encontrado, handleSearch ,setSearch};


};

// Exportamos nuestro hook personalizado
export default useBusquedaFiltros;