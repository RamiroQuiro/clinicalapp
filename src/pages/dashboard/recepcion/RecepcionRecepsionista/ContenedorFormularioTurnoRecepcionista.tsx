import { FormularioTurno } from "@/components/organismo/agenda/FormularioTurno";
import { datosNuevoTurnoRecepcionista, fechaSeleccionada, recepcionStore, resetNuevoTurnoRecepcionista, setPacienteRecepcionista } from "@/context/recepcion.recepcionista.store";
import { useStore } from "@nanostores/react";

type Props = {}

export default function ContenedorFormularioTurnoRecepcionista({ user }: Props) {

  const datosNuevoTurno = useStore(datosNuevoTurnoRecepcionista);
  const { turnosDelDia } = useStore(recepcionStore);
  const onSeleccionarFecha = (date: Date | undefined) => {
    fechaSeleccionada.set(date);
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
      <FormularioTurno agenda={turnosDelDia[0]?.agenda} datosNuevoTurno={datosNuevoTurno} handleDatosNuevoTurno={handleDatosNuevoTurno} onClickSeleccionarFecha={onSeleccionarFecha} setPaciente={setPacienteRecepcionista} resetNuevoTurno={handleResetNuevoTurno} user={user} />
    </div>
  )

}