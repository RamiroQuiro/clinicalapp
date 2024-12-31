import React, { useState } from "react";
import Tr from "./Tr";
import { useStore } from "@nanostores/react";
import { columnSelectTable, filtrosBusquedaPrestamos } from "../../context/store";

export default function TBody({ arrayBody, onClickFila, renderBotonActions }) {
  const $columnSelectTable = useStore(columnSelectTable);
  const $filtros = useStore(filtrosBusquedaPrestamos);
  const [sortSelect, setSortSelect] = useState($columnSelectTable.seleccion);

  const onClick = (href) => {
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
          .filter((element) => {
            if ($filtros.filtro === "todos") {
              return element;
            }
            if (element.estado === $filtros.filtro) {
              return element;
            }
            if ($filtros.filtro === "vencimientos") {
              let f1 = new Date(element.fechaVencimiento);
              let f2 = new Date($filtros.fecha);
              f1.setHours(0, 0, 0, 0);
              f2.setHours(0, 0, 0, 0);
              return f1.getTime() === f2.getTime();
            }
            return false;
          })
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
