import React from 'react';
import { useStore } from '@nanostores/react';
import { recepcionStore } from '../../../context/recepcion.store';
import CardTurnoRecepcion from './CardTurnoRecepcion';

const TurnosDelDia: React.FC = () => {
    const { turnosDelDia, isLoading } = useStore(recepcionStore);

    const handleAnunciarLlegada = (turnoId: number) => {
        console.log(`Anunciar llegada del turno ${turnoId}`);
        // Aquí irá la lógica para llamar a la API y actualizar el store
    };

    if (isLoading) {
        return <p className="text-white text-center mt-8">Cargando turnos...</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {turnosDelDia.map(turno => (
                <CardTurnoRecepcion 
                    key={turno.id} 
                    turno={turno} 
                    onAnunciarLlegada={handleAnunciarLlegada} 
                />
            ))}
        </div>
    );
};

export default TurnosDelDia;
