import TurnosDelDia from "@/components/organismo/agenda/TurnosDelDia";
import { fechaSeleccionada, recepcionStore, setFechaYHoraRecepcionista, setPacienteRecepcionista } from "@/context/recepcion.recepcionista.store";
import { useSSE } from "@/hook/useSSE";
import { formatUtcToAppTime } from "@/utils/agendaTimeUtils";
import { showToast } from "@/utils/toast/toastShow";
import { useStore } from "@nanostores/react";
import type { User } from "lucia";

interface Props {
    user: User;
}


export default function ContenedorTurnosDelDiaRecepcionista({ user }: Props) {
    const { turnosDelDia: agenda, isLoading } = useStore(recepcionStore);
    const diaSeleccionado = useStore(fechaSeleccionada);
    const { sseConectado } = useSSE(user.id);

    const onChangeReagendar = (slot: any) => {
        if (!diaSeleccionado) return;
        setPacienteRecepcionista({
            id: slot.turnoInfo.pacienteId,
            nombre: `${slot.turnoInfo.pacienteNombre} ${slot.turnoInfo.pacienteApellido}`,
        });
        setFechaYHoraRecepcionista(diaSeleccionado, formatUtcToAppTime(slot.hora, 'HH:mm'), slot.profesionalId);
        document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
    };

    const handleCancelarTurno = async (slot: any) => {
        try {
            const responseFetch = await fetch(`/api/agenda/turnos/cancelar?id=${slot.turnoInfo.id}`, {
                method: 'DELETE',
            });
            if (!responseFetch.ok) {
                showToast('Error al cancelar el turno', { background: 'bg-red-500' });
                throw new Error('Error al cancelar el turno');
            }
            showToast('Turno cancelado exitosamente', { background: 'bg-green-500' });
        } catch (error) {
            console.error('Error al cancelar el turno:', error);
            showToast('Error al cancelar el turno', { background: 'bg-red-500' });
        }
    };


    return (
        <TurnosDelDia
            agenda={agenda}
            isLoading={isLoading}
            diaSeleccionado={diaSeleccionado || new Date()}
            onChangeReagendar={onChangeReagendar}
            handleCancelarTurno={handleCancelarTurno}
        />
    );
}