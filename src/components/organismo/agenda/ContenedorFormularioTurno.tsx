import {
    agendaDelDia,
    datosNuevoTurno,
    resetNuevoTurno,
    setFechaYHora,
    setPaciente,
    type AgendaSlot
} from '@/context/agenda.store';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useStore } from "@nanostores/react";
import { FormularioTurno } from "./FormularioTurno";
type Props = {
    user: any;
}

export default function ContenedorFormularioTurno({ user }: Props) {

    const agenda = useStore(agendaDelDia);
    const turnoDelStore = useStore(datosNuevoTurno);
    const onSeleccionarFecha = (slot: AgendaSlot) => {

        setFechaYHora(slot.hora, formatUtcToAppTime(slot.hora, 'HH:mm'), slot.userMedicoId);
    }

    const handleResetNuevoTurno = () => {
        resetNuevoTurno();
    }
    const handleDatosNuevoTurno = (user: any) => {
        datosNuevoTurno.setKey('userMedicoId', user.id)
    }

    return (
        <div>
            <FormularioTurno agenda={agenda[0]?.agenda} datosNuevoTurno={turnoDelStore} handleDatosNuevoTurno={handleDatosNuevoTurno} onClickSeleccionarFecha={onSeleccionarFecha} setPaciente={setPaciente} resetNuevoTurno={handleResetNuevoTurno} user={user} />
        </div>
    )
}