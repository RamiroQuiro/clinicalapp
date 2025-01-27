import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { columnSelectTable, filtroBusqueda } from '../../context/store';
import Tr from './Tr';

export default function TBody({ arrayBody, onClickFila, renderBotonActions }) {
  const $columnSelectTable = useStore(columnSelectTable);
  const $filtros = useStore(filtroBusqueda);
  const [sortSelect, setSortSelect] = useState($columnSelectTable.seleccion);
  const onClick = href => {
    document.location.href = href;
  };

  return (
    <tbody>
      {arrayBody?.length === 0 ? (
        <tr>
          <td
            colSpan={Object.keys(arrayBody[0] || {}).length + 1}
            className="border-b last:border-0 text-xs font-semibold bg-white"
          >
            No hay elementos para mostrar
          </td>
        </tr>
      ) : (
        arrayBody
          ?.sort((a, b) => a - b)
          .map((client, i) => (
            <Tr
              data={client}
              id={client.id}
              key={i}
              styleTr="hover:bg- duration-300 cursor-pointer border-b  odd:bg-gray-50"
              renderBotonActions={renderBotonActions} // Corregido
            />
          ))
      )}
    </tbody>
  );
}
