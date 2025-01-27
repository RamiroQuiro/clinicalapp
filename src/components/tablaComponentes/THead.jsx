import { useStore } from '@nanostores/react';
import { columnSelectTable } from '../../context/store';
import Th from './Th';

export default function THead({ columnas }) {
  const $columnSelect = useStore(columnSelectTable);

  const handleSort = selector => {
    columnSelectTable.set({
      asc: selector === $columnSelect.seleccion ? !$columnSelect.asc : true,
      seleccion: selector,
    });
  };

  return (
    <thead className="bg-gray-100">
      <tr>
        {columnas?.map(columna => (
          <Th
            key={columna.id}
            onClick={() => handleSort(columna.selector)}
            styleTh={`cursor-pointer hover:bg-gray-200 transition-colors ${
              $columnSelect.seleccion === columna.selector ? 'bg-gray-200' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {columna.label}
              {$columnSelect.seleccion === columna.selector && (
                <span>{$columnSelect.asc ? '↑' : '↓'}</span>
              )}
            </div>
          </Th>
        ))}
      </tr>
    </thead>
  );
}
