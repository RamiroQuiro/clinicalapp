import React from 'react';

// Provisional: Se ajustará al tipo de dato real del turno
type Turno = {
    id: number;
    hora: string;
    paciente: {
        nombre: string;
        apellido: string;
    };
    tipoDeTurno: string;
    estado: string;
};

interface Props {
    turno: Turno;
    onAnunciarLlegada: (turnoId: number) => void;
}

const CardTurnoRecepcion: React.FC<Props> = ({ turno, onAnunciarLlegada }) => {
    return (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/20 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xl font-bold">{turno.hora}</p>
                    <p className="text-lg">{`${turno.paciente.nombre} ${turno.paciente.apellido}`}</p>
                    <p className="text-sm text-gray-300">{turno.tipoDeTurno}</p>
                </div>
                <div className="text-right">
                     <span className={`px-2 py-1 text-sm rounded-full ${
                        turno.estado === 'confirmado' ? 'bg-blue-500' :
                        turno.estado === 'en-espera' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>{turno.estado}</span>
                    {turno.estado === 'confirmado' && (
                         <button 
                            onClick={() => onAnunciarLlegada(turno.id)}
                            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-colors"
                        >
                            Anunciar Llegada
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardTurnoRecepcion;
