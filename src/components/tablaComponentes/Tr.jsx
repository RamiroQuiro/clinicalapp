import Td from "./Td";

// Componente Tr
export default function Tr({ id, data, styleTr, onClick, renderActions }) {
  const dataSinId = { ...data };
  delete dataSinId.id;
  delete dataSinId.href;

  return (
    <tr onClick={onClick} id={id} className={styleTr}>
      {Object?.values(dataSinId)?.map((value, i) => (
        <Td estado={data.estado} key={i}>{value}</Td>
      ))}
      {renderActions && (
        <td className="-2">
          {renderActions(data)}
        </td>
      )}
    </tr>
  );
}
