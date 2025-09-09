import React, { useState, useMemo } from 'react';

const TablaGenericaV2 = ({ data, columns, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Logic for sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  // Logic for pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return sortedData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, sortedData, itemsPerPage]);

  const handleSort = (columnKey, sortable) => {
    if (!sortable) return;

    const newDirection =
      sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`py-3 px-6 ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                onClick={() => handleSort(column.key, column.sortable)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <span className="ml-1">
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? ' ▲' : ' ▼'
                      ) : (
                        ' ◇'
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentTableData.length > 0 ? (
            currentTableData.map((row, rowIndex) => (
              <tr
                key={rowIndex} // Consider using a unique ID from row data if available
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {columns.map((column) => (
                  <td key={column.key} className="py-4 px-6">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colSpan={columns.length} className="py-4 px-6 text-center">
                No hay datos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav className="flex justify-between items-center pt-4" aria-label="Table navigation">
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Mostrando{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {(currentPage - 1) * itemsPerPage + currentTableData.length}
            </span>{' '}
            de{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {sortedData.length}
            </span>
          </span>
          <ul className="inline-flex items-center -space-x-px">
            <li>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="block py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Anterior
              </button>
            </li>
            {[...Array(totalPages).keys()].map((page) => (
              <li key={page + 1}>
                <button
                  onClick={() => goToPage(page + 1)}
                  className={`py-2 px-3 leading-tight ${
                    currentPage === page + 1
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                      : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                  } border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="block py-2 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default TablaGenericaV2;