import {
    agendaDelDia,
    dataStoreAgenda,
    datosNuevoTurno,
    fetchAgenda,
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
    const { isLoading } = useStore(dataStoreAgenda);
    const onSeleccionarHorario = (slot: AgendaSlot) => {
        setFechaYHora(slot.hora, formatUtcToAppTime(slot.hora, 'HH:mm'), slot.userMedicoId);
    }

    const pedirAgenda = (date: Date) => {
        fetchAgenda(formatUtcToAppTime(date, 'yyyy-MM-dd'), user.id, user.centroMedicoId);
    }

    const handleResetNuevoTurno = () => {
        resetNuevoTurno();
    }
    const handleDatosNuevoTurno = (user: any) => {
        datosNuevoTurno.setKey('userMedicoId', user.id)
    }



    return (
        <div>
            <FormularioTurno agenda={agenda?.agenda} datosNuevoTurno={turnoDelStore} seleccionarFecha={pedirAgenda} handleDatosNuevoTurno={handleDatosNuevoTurno} onSeleccionarHorario={onSeleccionarHorario} setPaciente={setPaciente} resetNuevoTurno={handleResetNuevoTurno} user={user} isLoading={isLoading} />
        </div>
    )
}