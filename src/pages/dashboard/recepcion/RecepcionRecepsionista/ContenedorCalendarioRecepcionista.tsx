import Calendario from "@/components/organismo/agenda/Calendario";
import { fechaSeleccionada } from "@/context/recepcion.recepcionista.store";
import { useStore } from "@nanostores/react";

type Props = {}

export default function ContenedorCalendarioRecepcionista({ }: Props) {
    const selectedDay = useStore(fechaSeleccionada);
    const onSelect = (date: Date | undefined) => {
        fechaSeleccionada.set(date || new Date());
    };
    return (
        <Calendario onSelect={onSelect} selectedDay={selectedDay || new Date()} />
    )
}