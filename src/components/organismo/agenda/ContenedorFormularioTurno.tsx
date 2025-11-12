import {
    agendaDelDia,
    datosNuevoTurno,
    fechaSeleccionada,
    resetNuevoTurno,
    setPaciente
} from '@/context/agenda.store';
import { useStore } from "@nanostores/react";
import { FormularioTurno } from "./FormularioTurno";
type Props = {
    user: any;
}

export default function ContenedorFormularioTurno({ user }: Props) {

    const agenda = useStore(agendaDelDia);
    const turnoDelStore = useStore(datosNuevoTurno);
    const onSeleccionarFecha = (date: Date | undefined) => {
        fechaSeleccionada.set(date);
    }

    const handleResetNuevoTurno = () => {
        resetNuevoTurno();
    }
    const handleDatosNuevoTurno = (user: any) => {
        datosNuevoTurno.setKey('userMedicoId', user.id)
    }

    return (
        <div>
            <FormularioTurno agenda={agenda} turnoDelStore={turnoDelStore} datosNuevoTurno={datosNuevoTurno.get()} handleDatosNuevoTurno={handleDatosNuevoTurno} onClickSeleccionarFecha={onSeleccionarFecha} setPaciente={setPaciente} resetNuevoTurno={handleResetNuevoTurno} user={user} />
        </div>
    )
}