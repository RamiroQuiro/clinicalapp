import SelectorProfesional from '@/components/atomos/SelectorProfesional';
import { recepcionStore, setMedicoSeleccionado } from '@/context/recepcion.recepcionista.store';
import { useStore } from '@nanostores/react';

interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
}

interface Props {
  profesionales: Profesional[];
}

export default function ContenedorSelectorProfesional({ profesionales }: Props) {
  const { medicoSeleccionadoId } = useStore(recepcionStore);

  const handleSelection = (id: string | null) => {
    setMedicoSeleccionado(id);
  };

  return (
    <SelectorProfesional 
      profesionales={profesionales}
      valorActual={medicoSeleccionadoId}
      onSeleccion={handleSelection}
    />
  );
}
