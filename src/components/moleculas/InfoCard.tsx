import { Edit3, Trash2 } from 'lucide-react';
import React from 'react';
import BotonIndigo from './BotonIndigo';

// --- Props Interface ---
interface Atencion {
  id: string;
  userId: string;
  pacienteId: string;
  motivoConsulta: string;
  motivoInicial?: string | null;
  fecha: Date;
  estado: string;
  created_at: Date;
  inicioAtencion?: Date | null;
  finAtencion?: Date | null;
  duracionAtencion?: number | null;
  nombreDoctor: string;
  apellidoDoctor: string;
}
interface InfoCardProps {
  title: string;
  subtitle?: string;
  date: string;
  estado: string;
  status?: {
    text: string;
    colorClass: string; // e.g., 'bg-green-100 text-green-800'
  };
  bodyText?: string;
  onEdit?: () => void;
  iconOnEdit?: React.ReactNode;
  onDelete?: () => void;
  icon?: React.ReactNode;
  onClick?: (atencion: Atencion) => void; // New optional onClick prop
}

// --- Generic Card Component ---
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  date,
  estado,
  status,
  bodyText,
  onEdit,
  iconOnEdit,
  onDelete,
  icon,
  onClick,
}) => {
  const cardClasses = `flex items-start gap-4 p-4 bg-white rounded-lg border shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow duration-200`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold capitalize text-primary-textoTitle text-base">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-sm font-semibold text-gray-700">{date}</p>
            {estado && (
              <span
                className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${estado}`}
              >
                {estado}
              </span>
            )}
          </div>
        </div>

        {/* Body Text (Optional) */}
        {bodyText && <p className="mt-2 text-sm text-gray-600">{bodyText}</p>}
      </div>

      {/* Edit Button (Optional) */}
      <div className="flex items-center gap-2 flex-col">
        <BotonIndigo onClick={onEdit} className="p-2" aria-label="Editar">
          {iconOnEdit ? iconOnEdit : <Edit3 size={16} />}
        </BotonIndigo>
        <BotonIndigo onClick={onDelete} className="p-2" aria-label="Eliminar">
          <Trash2 size={16} />
        </BotonIndigo>
      </div>
    </div>
  );
};
