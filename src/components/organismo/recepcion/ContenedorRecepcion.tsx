import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { recepcionStore } from '../../../context/recepcion.store';
import MenuPestaña from './MenuPestaña';
import TurnosDelDia from './TurnosDelDia';
import SalaDeEspera from './SalaDeEspera';
import PacientesRecepcion from './PacientesRecepcion';
import { formatDate } from '../../../utils/formatDate';

const ContenedorRecepcion: React.FC = () => {
    const { pestanaActiva } = useStore(recepcionStore);

    useEffect(() => {
        const fetchTurnos = async () => {
            const hoy = formatDate(new Date()); // Asumiendo que formatDate devuelve 'YYYY-MM-DD'
            try {
                // Usamos el endpoint que ya tienes
                const response = await fetch(`/api/agenda/turnos?fecha=${hoy}`);
                if (!response.ok) {
                    throw new Error('Error al cargar los turnos');
                }
                const data = await response.json();
                
                // Separar turnos en las listas correspondientes
                const turnos = data.turnos.filter(t => t.estado === 'confirmado' || t.estado === 'reprogramado');
                const enEspera = data.turnos.filter(t => t.estado === 'en-espera');

                recepcionStore.set({
                    ...recepcionStore.get(),
                    turnosDelDia: turnos,
                    pacientesEnEspera: enEspera,
                    isLoading: false,
                });

            } catch (error) {
                console.error(error);
                recepcionStore.setKey('error', error.message);
                recepcionStore.setKey('isLoading', false);
            }
        };

        fetchTurnos();
    }, []);

    const renderContent = () => {
        switch (pestanaActiva) {
            case 'turnos':
                return <TurnosDelDia />;
            case 'espera':
                return <SalaDeEspera />;
            case 'pacientes':
                return <PacientesRecepcion />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <MenuPestaña />
            <div className="flex-grow overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default ContenedorRecepcion;
