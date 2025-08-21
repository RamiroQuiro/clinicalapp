import React from 'react';
import { Pencil } from 'lucide-react';

// --- Props Interface ---
interface InfoCardProps {
  title: string;
  subtitle?: string;
  date: string;
  status?: {
    text: string;
    colorClass: string; // e.g., 'bg-green-100 text-green-800'
  };
  bodyText?: string;
  onEdit?: () => void;
  icon?: React.ReactNode;
}

// --- Generic Card Component ---
export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  date,
  status,
  bodyText,
  onEdit,
  icon,
}) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Icon Column (Optional) */}
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-primary-textoTitle text-base">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-sm font-semibold text-gray-700">{date}</p>
            {status && (
              <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${status.colorClass}`}>
                {status.text}
              </span>
            )}
          </div>
        </div>

        {/* Body Text (Optional) */}
        {bodyText && <p className="mt-2 text-sm text-gray-600">{bodyText}</p>}
      </div>

      {/* Edit Button (Optional) */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Editar"
        >
          <Pencil size={16} />
        </button>
      )}
    </div>
  );
};