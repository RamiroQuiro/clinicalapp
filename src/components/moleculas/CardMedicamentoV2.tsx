import { Pill } from 'lucide-react';
import React from 'react';

const getStatusInfo = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return { text: 'Activo', colorClass: 'bg-green-100 text-green-800' };
      case 'finalizado':
        return { text: 'Finalizado', colorClass: 'bg-gray-100 text-gray-800' };
      default:
        return { text: estado, colorClass: 'bg-blue-100 text-blue-800' };
    }
  };

export const CardMedicamentoV2 = ({ medicamento }) => {
  const { nombre, dosis, frecuencia, medico, fechaPrescripcion, estado } = medicamento;
  const statusInfo = getStatusInfo(estado);

  return (
    <div className="flex flex-col flex-1 min-w-[200px] p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm justify-between gap-2">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-primary-textoTitle bg-primary-bg p-2 rounded-full">
            <Pill size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{nombre}</h3>
        </div>
        <p className="text-sm text-gray-600"><span className="font-semibold">Dosis:</span> {dosis}</p>
        <p className="text-sm text-gray-600"><span className="font-semibold">Frecuencia:</span> {frecuencia}</p>
        <p className="text-sm text-gray-500 mt-1">Recetado por: {medico}</p>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.colorClass}`}>
          {statusInfo.text}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(fechaPrescripcion).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
