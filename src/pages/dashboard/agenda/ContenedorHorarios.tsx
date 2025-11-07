import HorariosDisponibles from "@/components/organismo/agenda/HorariosDisponibles";
import {
    dataStoreAgenda,
    fechaSeleccionada,
    profesionalSeleccionado,
    setFechaYHora,
    setPaciente
} from '@/context/agenda.store';
import { formatUtcToAppTime } from "@/utils/agendaTimeUtils";
import { useStore } from "@nanostores/react";
type Props = {}

export default function ContenedorHorarios({ }: Props) {
    const { data: agenda, isLoading, error } = useStore(dataStoreAgenda);
    const dia = useStore(fechaSeleccionada);
    const profesional = useStore(profesionalSeleccionado);
    const handleAgendar = (hora: string) => {
        if (!dia) return;
        setPaciente({ id: '', nombre: '' });

        setFechaYHora(dia, formatUtcToAppTime(hora, 'HH:mm'), profesional?.id);
        document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
    }
    return (
        <HorariosDisponibles agenda={agenda} dia={dia || new Date()} profesional={profesional} hangleAgendar={handleAgendar} isLoading={isLoading} />
    )
}