import React, { useState } from "react";
import Tr from "./Tr";
import { useStore } from "@nanostores/react";
import {
  columnSelectTable,
  filtrosBusquedaPrestamos,
} from "../../context/store";

export default function TBody({ arrayBody, onClickFila }) {
  const $columnSelectTable = useStore(columnSelectTable);
  const $filtros = useStore(filtrosBusquedaPrestamos);
  const [sortSelect, setSortSelect] = useState($columnSelectTable.seleccion);

  //ruteador
  const onClick = (href) => {
    document.location.href = href;
  };

  //   botonera de acciones
  const renderActions = (data) => (
    <div className="flex gap-2 pr-5 justify-end items-center text-xs">
      <button
        className="bg-primary-100 text-white px-1 py-0.5 rounded hover:bg-primary-100/80 duration-150"
        onClick={() => (document.location.href = data.href)}
      >
        ficha
      </button>
      <button
        className="bg-primary-200 text-white  px-1 py-0.5 rounded hover:bg-primary-200/80 duration-150"
        onClick={(e) => {
          e.stopPropagation();
          document.location.href = data.href;
        }}
      >
        atender
      </button>
      <button
        className="bg-primary-400 text-white  px-1 py-0.5 rounded hover:bg-primary-400/80 duration-150"
        onClick={(e) => {
          e.stopPropagation();
          alert(`Eliminar: ${data.id}`);
        }}
      >
        Eliminar
      </button>
    </div>
  );

  return (
    <tbody>
      {arrayBody.length === 0 ? (
        <tr>
          <td
            colSpan={Object.keys(arrayBody[0] || {}).length + 1}
            className="text-center text-xs font-semibold"
          >
            No hay elementos para mostrar
          </td>
        </tr>
      ) : (
        arrayBody
          .sort((a, b) => a - b)
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
              styleTr="hover:bg-primary-200/20 duration-300 cursor-pointer border-b odd:bg-primary-200/10"
              renderActions={renderActions}
            />
          ))
      )}
    </tbody>
  );
}
