import { useStore } from '@nanostores/react';
import { columnSelectTable } from '../../context/store';
import Tr from './Tr';

export default function TBody({ arrayBody, renderBotonActions }) {
  const $columnSelect = useStore(columnSelectTable);

  const sortData = data => {
    if (!$columnSelect.seleccion) return data;

    return [...data].sort((a, b) => {
      const aValue = $columnSelect.seleccion(a);
      const bValue = $columnSelect.seleccion(b);

      if (typeof aValue === 'string') {
        return $columnSelect.asc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return $columnSelect.asc ? aValue - bValue : bValue - aValue;
    });
  };

  const sortedData = sortData(arrayBody || []);

  return (
    <tbody>
      {!sortedData.length ? (
        <tr>
          <td
            colSpan={Object.keys(arrayBody[0] || {}).length + 1}
            className="border-b last:border-0 text-xs font-semibold bg-white text-center p-4"
          >
            No hay elementos para mostrar
          </td>
        </tr>
      ) : (
        sortedData.map((item, i) => (
          <Tr key={item.id || i} data={item} renderBotonActions={renderBotonActions} />
        ))
      )}
    </tbody>
  );
}
