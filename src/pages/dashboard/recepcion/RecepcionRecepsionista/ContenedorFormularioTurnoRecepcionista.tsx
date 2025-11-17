import { FormularioTurno } from "@/components/organismo/agenda/FormularioTurno";
import type { AgendaSlot } from "@/context/agenda.store";
import { datosNuevoTurnoRecepcionista, fetchTurnosDelDia, recepcionStore, resetNuevoTurnoRecepcionista, setFechaYHoraRecepcionista, setPacienteRecepcionista } from "@/context/recepcion.recepcionista.store";
import { formatUtcToAppTime } from "@/utils/agendaTimeUtils";
import { useStore } from "@nanostores/react";
import type { User } from "lucia";

type Props = {
  user: User;
}

export default function ContenedorFormularioTurnoRecepcionista({ user }: Props) {

  const datosNuevoTurno = useStore(datosNuevoTurnoRecepcionista);
  const { turnosDelDia, isLoading } = useStore(recepcionStore);

  const onSeleccionarHorario = (slot: AgendaSlot) => {
    setFechaYHoraRecepcionista(slot.hora, formatUtcToAppTime(slot.hora, 'HH:mm'), slot.userMedicoId);
  }

  const pedirAgenda = (date: Date) => {
    fetchTurnosDelDia(formatUtcToAppTime(date, 'yyyy-MM-dd'), user.id, user.centroMedicoId);
  }


  const handleResetNuevoTurno = () => {
    resetNuevoTurnoRecepcionista();
  }
  const handleDatosNuevoTurno = (user: any) => {
    datosNuevoTurnoRecepcionista.setKey('userMedicoId', user.id)
  }

  console.log('agenda del dia ->', turnosDelDia)
  return (
    <div>
      <FormularioTurno
        agenda={turnosDelDia[0]?.agenda}
        isLoading={isLoading}
        datosNuevoTurno={datosNuevoTurno}
        handleDatosNuevoTurno={handleDatosNuevoTurno}
        seleccionarFecha={pedirAgenda}
        onSeleccionarHorario={onSeleccionarHorario}
        setPaciente={setPacienteRecepcionista}
        resetNuevoTurno={handleResetNuevoTurno}
        user={user} />
    </div>
  )

}