type Props = {
  nombre: string;
  apellido: string;
};

export default function InicialesPac({ nombre, apellido }: Props) {
  return (
    <div className="p-3 rounded-full uppercase bg-primary-bg-componentes border">
      <div>
        {nombre
          ?.split(' ')
          .map(n => n[0])
          .join('')}
        {apellido
          ?.split(' ')
          .map(n => n[0])
          .join('')}
      </div>
    </div>
  );
}
