import Calendario from '@/components/organismo/agenda/Calendario';
import { fechaSeleccionada } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';

type DayOccupancy = {
    [key: string]: {
        estado: string;
        color: string;
        colorClaro: string;
        porcentaje: number;
        profesionales: { [profId: string]: number };
        totalTurnos: number; // NUEVO
        turnosPorProfesional: { [profId: string]: number }; // NUEVO
    };
};

type Props = {
    userId: string;
    centroMedicoId: string;
    rol: string;
}

export default function ContenedorAgenda({ userId, centroMedicoId, rol }: Props) {
    const selectedDay = useStore(fechaSeleccionada);
    const [dayOccupancy, setDayOccupancy] = useState<DayOccupancy>({});
    const [loadingOccupancy, setLoadingOccupancy] = useState(true);
    const [errorOccupancy, setErrorOccupancy] = useState<string | null>(null);

    const onSelect = (date: Date | undefined) => {
        fechaSeleccionada.set(date || new Date());
    };

    useEffect(() => {
        const fetchOccupancy = async () => {
            if (!userId || !centroMedicoId) {
                setErrorOccupancy('User ID or Centro Medico ID not available.');
                setLoadingOccupancy(false);
                return;
            }

            setLoadingOccupancy(true);
            setErrorOccupancy(null);

            const currentMonthStart = startOfMonth(selectedDay);
            const currentMonthEnd = endOfMonth(selectedDay);

            const startDateFormatted = format(currentMonthStart, 'yyyy-MM-dd');
            const endDateFormatted = format(currentMonthEnd, 'yyyy-MM-dd');

            const profesionalIds = userId;

            try {
                const response = await fetch(
                    `/api/agenda/summary?startDate=${startDateFormatted}&endDate=${endDateFormatted}&professionalIds=${profesionalIds}&centroMedicoId=${centroMedicoId}`
                );
                const data = await response.json();

                if (response.ok) {
                    setDayOccupancy(data.data);
                } else {
                    setErrorOccupancy(data.message || 'Error fetching occupancy data.');
                }
            } catch (error) {
                console.error('Error fetching day occupancy:', error);
                setErrorOccupancy('Failed to connect to the server.');
            } finally {
                setLoadingOccupancy(false);
            }
        };

        fetchOccupancy();
    }, [selectedDay, userId, centroMedicoId]);

    return (
        <>
            <Calendario
                onSelect={onSelect}
                selectedDay={selectedDay}
                dayOccupancy={dayOccupancy}
            />
        </>
    );
}