import { Calendar, MenuSquare, User } from 'lucide-react';
import { useState } from 'react';
import formatDate from '@/utils/formatDate';

// Helper function to get status info (similar to CardMedicamentoV2)
const getStatusInfo = estado => {
  switch (estado?.toLowerCase()) {
    case 'confirmado':
      return { text: 'Confirmado', colorClass: 'bg-green-100 text-green-800' };
    case 'pendiente':
      return { text: 'Pendiente', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'cancelado':
        return { text: 'Cancelado', colorClass: 'bg-red-100 text-red-800' };
    default:
      return { text: estado, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

export const CardTurno = ({ turno, currentUserId, pacienteId }) => {
    const {
        id,
        fecha,
        hora,
        profesional,
        motivoConsulta,
        estado = 'pendiente',
        userMedicoId,
    } = turno;

    const isMyAppointment = userMedicoId === currentUserId;
    const attentionLink = `/dashboard/consultas/aperturaPaciente/${pacienteId}/new`;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const statusInfo = getStatusInfo(estado);

    const handleStatusChange = (nuevoEstado) => {
        console.log(`Cambiando estado del turno ${id} a ${nuevoEstado}`);
        // Aquí iría la llamada a la API para actualizar el estado del turno
        setIsMenuOpen(false);
    };

    return (
        <div className="flex flex-col flex-1 min-w-[220px] p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm justify-between gap-2 relative">
            <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-primary-100"/>
                        <h3 className="text-lg font-bold text-primary-textoTitle">{formatDate(fecha)}</h3>
                    </div>
                    <div className="cursor-pointer text-end">
                        <MenuSquare onClick={() => setIsMenuOpen(!isMenuOpen)} />
                    </div>
                    {isMenuOpen && (
                        <ul className="flex flex-col animate-aparecer items-start p-2 bg-white/70 backdrop-blur-sm rounded-lg border shadow-md gap-1 absolute top-8 right-4 w-auto z-20">
                            <li onClick={() => handleStatusChange('confirmado')} className="cursor-pointer w-full text-sm hover:bg-primary-100/20 p-1 rounded-md">Confirmar</li>
                            <li onClick={() => handleStatusChange('cancelado')} className="cursor-pointer w-full text-sm hover:bg-primary-100/20 p-1 rounded-md">Cancelar</li>
                            <li className={`w-full text-sm p-1 rounded-md ${isMyAppointment ? 'cursor-pointer hover:bg-primary-100/20' : 'opacity-50 cursor-not-allowed'}`}>
                                <a href={isMyAppointment ? attentionLink : '#'} onClick={(e) => !isMyAppointment && e.preventDefault()}>Atención</a>
                            </li>
                        </ul>
                    )}
                </div>
                
                <p className="text-2xl font-semibold text-primary-textoTitle mb-2">{hora}</p>

                <div className="text-sm text-primary-textoTitle space-y-1">
                    <p><span className="font-semibold">Profesional:</span> {profesional}</p>
                    <p><span className="font-semibold">Motivo:</span> {motivoConsulta}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.colorClass}`}>
                    {statusInfo.text}
                </span>
                <a href="#" className="text-xs text-primary-100 hover:underline">Ver detalles</a>
            </div>
        </div>
    );
};