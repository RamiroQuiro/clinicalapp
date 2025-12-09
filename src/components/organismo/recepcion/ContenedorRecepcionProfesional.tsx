import type { AgendaSlot } from '@/context/agenda.store';
import { recepcionStore, setTurnoEstado } from '@/context/recepcion.store';
import { useSSE } from '@/hook/useSSE';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { useMemo } from 'react';
import RecepcionPacientesView from './RecepcionPacientesView';

type Props = {
    userId: string;
};

export default function ContenedorRecepcionProfesional({ userId }: Props) {
    const { turnosDelDia, isLoading, ultimaActualizacion } = useStore(recepcionStore);
    const { sseConectado } = useSSE(userId);

    // Para el profesional, asumimos que turnosDelDia es una lista de profesionales (posiblemente solo 1)
    // O si es una lista plana, la lógica sería diferente. 
    // Basado en el código anterior, parecía tomar el primer elemento: turnosDelDia?.[0]?.agenda

    const agendaDelDia = useMemo(() => {
        // Si turnosDelDia es array de profesionales
        const turnosAny = turnosDelDia as any[];
        if (turnosAny && turnosAny.length > 0 && 'agenda' in turnosAny[0]) {
            return turnosAny[0].agenda as AgendaSlot[];
        }
        return [];
    }, [turnosDelDia]);

    const turnosAgendadosDia = useMemo(() => {
        if (!agendaDelDia) return [];
        return agendaDelDia.filter((turno) =>
            !turno.disponible &&
            (turno.turnoInfo?.estado === 'pendiente' || turno.turnoInfo?.estado === 'confirmado')
        ).sort((a, b) => a.hora.localeCompare(b.hora));
    }, [agendaDelDia]);

    const colaDeEspera = useMemo(() => {
        if (!agendaDelDia) return [];
        return agendaDelDia.filter((turno) =>
            turno.turnoInfo?.estado === 'sala_de_espera'
        ).sort((a, b) => {
            const horaA = a.turnoInfo?.horaLlegadaPaciente || a.hora;
            const horaB = b.turnoInfo?.horaLlegadaPaciente || b.hora;
            return horaA.localeCompare(horaB);
        });
    }, [agendaDelDia]);

    const handleRecepcion = (slot: AgendaSlot) => {
        if (slot.turnoInfo?.estado === 'confirmado') return;

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
