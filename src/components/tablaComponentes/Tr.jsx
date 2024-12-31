import Td from "./Td";

// Componente Tr
export default function Tr({ id, data, styleTr, onClick, renderBotonActions }) {
  const dataSinId = { ...data };
  delete dataSinId.id;
  delete dataSinId.href;

  return (
    <tr
      onClick={onClick}
      id={id}
      className={`${styleTr} border-b last:border-0 odd:bg-white   hover:bg-primary-bg-componentes/80 bg-primary-bg-componentes/40`}
    >
      {Object?.values(dataSinId)?.map((value, i) => (
        <Td estado={data.estado} key={i}>
          {value}
        </Td>
      ))}
      {renderBotonActions && (
        <td className="-2">
          {renderBotonActions(data)} {/* Corregido */}
        </td>
      )}
    </tr>
  );
}
