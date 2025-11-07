import { agendaDelDia, fechaSeleccionada, fetchAgenda, profesionalSeleccionado } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
type Props = {
  profesionales: [{ id: string; nombre: string; apellido: string }];
  centroMedicoId;
};
const toYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ContenedorSeleccionProfesionales({ profesionales, centroMedicoId }: Props) {
  const diaSeleccionado = useStore(fechaSeleccionada);
  const [userSeleccionado, setUserSeleccionado] = useState<{
    id: string;
    nombre: string;
    apellido: string;
  }>(profesionales[0]);
  useEffect(() => {
    profesionalSeleccionado.set(userSeleccionado);
  }, [userSeleccionado, profesionalSeleccionado]);
  useEffect(() => {
    if (diaSeleccionado) {
      // Inicia la carga, podrías tener un store de loading si quisieras
      agendaDelDia.set([]); // Limpia la agenda anterior

      const fechaFormateada = toYYYYMMDD(diaSeleccionado);

      console.log('fechaFormateada', fechaFormateada);
      console.log('userSeleccionado', userSeleccionado.id);
      console.log('centroMedicoId', centroMedicoId);

      fetchAgenda(fechaFormateada, userSeleccionado.id, centroMedicoId);
    }
  }, [diaSeleccionado, userSeleccionado]);
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserSeleccionado({
      id: e.target.value,
      nombre: e.target.options[e.target.selectedIndex].text,
      apellido: e.target.options[e.target.selectedIndex].text,
    });
  };

  return (
    <div className="flex items-center justify-normal gap-2 ">
      <label htmlFor="medicoId" className="block text-sm font-medium text-gray-700 ">
        Profesional
      </label>
      <select
        id="medicoId"
        name="medicoId"
        onChange={handleInputChange}
        required
        className=" block w-full pl-3 pr-10     py-0.5 text-primary-100 font-semibold border-gray-300 focus:outline-none focus:ring-indigo-500  focus:border-indigo-500 sm:text-sm rounded-md bg-white capitalize"
      >
        {profesionales?.map(profesional => (
          <option value={profesional.id}>
            {profesional.nombre} {profesional.apellido}
          </option>
        ))}
      </select>
    </div>
  );
}
