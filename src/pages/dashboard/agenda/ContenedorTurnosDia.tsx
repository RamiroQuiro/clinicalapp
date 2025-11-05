import TurnosDelDia from "@/components/organismo/agenda/TurnosDelDia";
import { agendaDelDia, fechaSeleccionada, setFechaYHora, setPaciente } from "@/context/agenda.store";
import { useSSE } from "@/hook/useSSE";
import { showToast } from "@/utils/toast/toastShow";
import { useStore } from "@nanostores/react";
import type { User } from "lucia";

type Props = {
    user: User;
}

export default function ContenedorTurnosDia({ user }: Props) {

    const agenda = useStore(agendaDelDia);
    const diaSeleccionado = useStore(fechaSeleccionada);

    const { sseConectado } = useSSE(user.id);


    console.log('esta es e stpre de la agenda', sseConectado)

    const onChangeReagendar = (slot: any) => {
        if (!diaSeleccionado) return;
        setPaciente({
            id: slot.turnoInfo.pacienteId,
            nombre: `${slot.turnoInfo.pacienteNombre} ${slot.turnoInfo.pacienteApellido}`,
        });
        setFechaYHora();
        document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
    }
    const handleCancelarTurno = async (slot: any) => {
        try {
            const responseFetch = await fetch(`/api/agenda/turnos/cancelar?id=${slot.turnoInfo.id}`, {
                method: 'DELETE',
            });

            if (!responseFetch.ok) {
                showToast('Error al cancelar el turno', { background: 'bg-red-500' });
                throw new Error('Error al cancelar el turno');
            }

            // La actualización del store agendaDelDia ahora se maneja a través de SSE
            showToast('Turno cancelado exitosamente', { background: 'bg-green-500' });
        } catch (error) {
            console.error('Error al cancelar el turno:', error);
            showToast('Error al cancelar el turno', { background: 'bg-red-500' });
        }
    }

    return (
        <TurnosDelDia agenda={agenda} diaSeleccionado={diaSeleccionado || new Date()} onChangeReagendar={onChangeReagendar} handleCancelarTurno={handleCancelarTurno} />
    )
}