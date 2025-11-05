import Calendario from '@/components/organismo/agenda/Calendario';
import { fechaSeleccionada } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';

type Props = {}

export default function ContenedorAgenda({ }: Props) {
    const selectedDay = useStore(fechaSeleccionada);
    const onSelect = (date: Date | undefined) => {
        fechaSeleccionada.set(date);
    };

    return (
        <>

            <Calendario onSelect={onSelect} selectedDay={selectedDay} />
        </>
    )
}