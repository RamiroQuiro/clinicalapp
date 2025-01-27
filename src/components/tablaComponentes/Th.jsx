export default function Th({ styleTh, children, onClick }) {
  return (
    <th
      onClick={onClick}
      className={`${styleTh} cursor-pointer py-2 text-left last:text-end last:pr-4 first:pl-4 px-4 text-sm font-medium capitalize`}
    >
      {children}
    </th>
  );
}
