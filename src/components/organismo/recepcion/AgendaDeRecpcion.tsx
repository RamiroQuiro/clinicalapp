import Section from '@/components/moleculas/Section';
import { fechaSeleccionada, fetchTurnosDelDia } from '@/context/recepcion.recepcionista.store';
import { useSSERecepcionista } from '@/hook/useSSERecepcionista';
import ContenedorCalendarioRecepcionista from '@/pages/dashboard/recepcion/RecepcionRecepsionista/ContenedorCalendarioRecepcionista';
import ContenedorHorariosRecepsionista from '@/pages/dashboard/recepcion/RecepcionRecepsionista/ContenedorHorariosRecepsionista';
import ContenedorTurnosDelDiaRecepcionista from '@/pages/dashboard/recepcion/RecepcionRecepsionista/ContenedorTurnosDelDiaRecepcionista';
import { useStore } from '@nanostores/react';
import type { User } from 'lucia';
import { useEffect } from 'react';

type Props = {
    user: User;
}

export default function AgendaDeRecpcion({ user }: Props) {
    const fecha = useStore(fechaSeleccionada)

    const { sseConectado, ultimaActualizacion } = useSSERecepcionista(user.id);


console.log('SSE CONECTADO EN AGENDA RECPCIONISRTA ',sseConectado, ultimaActualizacion)

    useEffect(() => {
        const toYYYYMMDD = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0'); // Corregido: no restar 1
            return `${year}-${month}-${day}`;
        };

        const fechaFormateada = toYYYYMMDD(fecha);
        console.log('fechaFormateada', fechaFormateada);
        fetchTurnosDelDia(fechaFormateada, user.centroMedicoId);
    }, [user, fecha]);

    return (
        <div className="w-full flex gap-2 items-start justify-between h-full">
            <Section title="Seleccionar Fecha" className="px- py-4 w-fit">
                <ContenedorCalendarioRecepcionista user={user} />
            </Section>

            <Section title="Turnos del Día" className="px- py-4 md:w-[40vw]">
                <ContenedorTurnosDelDiaRecepcionista user={user} />
            </Section>

            <Section title="Horarios Disponibles" className="px- py-4 md:w-[30vw]">
                <ContenedorHorariosRecepsionista />
            </Section>
        </div>
    );
}