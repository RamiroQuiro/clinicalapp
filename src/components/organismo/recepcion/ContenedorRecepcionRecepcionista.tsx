import type { AgendaSlot } from '@/context/agenda.store';
import { recepcionStore, setTurnoEstado } from '@/context/recepcion.recepcionista.store';
import { useSSE } from '@/hook/useSSE';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import RecepcionPacientesView from './RecepcionPacientesView';

type Props = {
    userId: string;
};

export default function ContenedorRecepcionRecepcionista({ userId }: Props) {
    const { turnosDelDia, isLoading, ultimaActualizacion } = useStore(recepcionStore);
    const { sseConectado } = useSSE(userId);

    // Agregamos los turnos de todos los profesionales
    const turnosAgendadosDia = useMemo(() => {
        if (!turnosDelDia || turnosDelDia.length === 0) return [];
        const turnosAny = turnosDelDia as any[];

        return turnosAny.flatMap(profesional =>
            profesional.agenda.filter((turno: AgendaSlot) =>
                !turno.disponible &&
                (turno.turnoInfo?.estado === 'pendiente' || turno.turnoInfo?.estado === 'confirmado')
            )
        ).sort((a: AgendaSlot, b: AgendaSlot) => a.hora.localeCompare(b.hora));
    }, [turnosDelDia]);

    const colaDeEspera = useMemo(() => {
        if (!turnosDelDia || turnosDelDia.length === 0) return [];
        const turnosAny = turnosDelDia as any[];

        return turnosAny.flatMap(profesional =>
            profesional.agenda.filter((turno: AgendaSlot) =>
                turno.turnoInfo?.estado === 'sala_de_espera'
            )
        ).sort((a: AgendaSlot, b: AgendaSlot) => {
            // Ordenar por hora de llegada si existe, sino por hora del turno
            const horaA = a.turnoInfo?.horaLlegadaPaciente || a.hora;
            const horaB = b.turnoInfo?.horaLlegadaPaciente || b.hora;
            return horaA.localeCompare(horaB);
        });
    }, [turnosDelDia]);

    const handleRecepcion = (slot: AgendaSlot) => {
        if (slot.turnoInfo?.estado === 'confirmado') return;

        // Verificar si ya está en sala de espera (buscando en la lista agregada)
        const isIdTurnoEspera = colaDeEspera.some(
            (turno) => turno.turnoInfo?.id === slot.turnoInfo?.id
        );

        if (isIdTurnoEspera) {
            showToast('Turno ya en sala de espera', { background: 'bg-yellow-600' });
            return;
        }

        setTurnoEstado(slot, 'sala_de_espera');
    };

    const handleAtender = (slot: AgendaSlot) => {
        window.location.href = `/api/atencion/nueva?pacienteId=${slot.turnoInfo?.pacienteId}&turnoId=${slot.turnoInfo?.id}`;
    };

    return (
        <RecepcionPacientesView
            turnosAgendados={turnosAgendadosDia}
            colaDeEspera={colaDeEspera}
            isLoading={isLoading}
            sseConectado={sseConectado}
            ultimaActualizacion={ultimaActualizacion}
            onRecibirPaciente={handleRecepcion}
            onAtender={handleAtender}
        />
    );
}
