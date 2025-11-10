import SelectorProfesional from '@/components/atomos/SelectorProfesional';
import { recepcionStore, setMedicoSeleccionado, setProfesionales } from '@/context/recepcion.recepcionista.store';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';

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

  useEffect(() => {
    if (profesionales) {
      setProfesionales(profesionales);
    }
  }, [profesionales]);
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
