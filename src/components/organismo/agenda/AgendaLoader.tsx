import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { fechaSeleccionada, agendaDelDia } from '@/context/agenda.store';

// Función para formatear la fecha a YYYY-MM-DD
const toYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Componente "invisible" que actúa como controlador.
 * Escucha los cambios en la fecha seleccionada, llama a la API
 * y actualiza el store global de la agenda del día.
 */
export default function AgendaLoader() {
  const diaSeleccionado = useStore(fechaSeleccionada);

  useEffect(() => {
    if (diaSeleccionado) {
      // Inicia la carga, podrías tener un store de loading si quisieras
      agendaDelDia.set([]); // Limpia la agenda anterior

      const fechaFormateada = toYYYYMMDD(diaSeleccionado);

      const fetchAgenda = async () => {
        try {
          const response = await fetch(`/api/agenda?fecha=${fechaFormateada}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          agendaDelDia.set(data.data); // Actualiza el store global
        } catch (error) {
          console.error('Error al obtener la agenda:', error);
          agendaDelDia.set([]); // Limpiar la agenda en caso de error
        }
      };

      fetchAgenda();
    }
  }, [diaSeleccionado]);

  // No renderiza nada en la UI
  return null;
}
