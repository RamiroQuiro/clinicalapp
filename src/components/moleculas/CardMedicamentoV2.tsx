import { MenuSquare, Pill } from 'lucide-react';
import { useState } from 'react';

const getStatusInfo = estado => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return { text: 'Activo', colorClass: 'bg-green-100 text-green-800' };
    case 'finalizado':
      return { text: 'Finalizado', colorClass: 'bg-gray-100 text-gray-800' };
    default:
      return { text: estado, colorClass: 'bg-blue-100 text-blue-800' };
  }
};

export const CardMedicamentoV2 = ({ medicamento, onStatusChange }) => {
  const { nombre, dosis, frecuencia, medico, fechaPrescripcion, estado, id } = medicamento;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const statusInfo = getStatusInfo(estado);

  const handleMedicamentoChangeStatus = async (
    e: React.MouseEvent<HTMLButtonElement>,
    nuevoEstado: string
  ) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    try {
      const response = await fetch(`/api/medicamentos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });
      if (!response.ok) {
        throw new Error('Error al cambiar el estado del medicamento');
      }
      // Si la API responde bien, llamamos a la función del padre para actualizar la UI
      if (onStatusChange) {
        onStatusChange(id, nuevoEstado);
      }
    } catch (error) {
      console.error('Error al cambiar el estado del medicamento:', error);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-[200px] p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm justify-between gap-2 relative">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-primary-textoTitle w-full bg-primary- p-2  flex items-center gap-2">
            <Pill size={20} />
            <h3 className="text-lg font-bold text-gray-800">{nombre}</h3>
          </div>
          <div className="cursor-pointer text-end">
            <MenuSquare onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
          {isMenuOpen && (
            <ul className="flex flex-col animate- items-start p-4 justify-center bg-white/70 backdrop-blur-sm rounded-lg border shadow-md  gap-2 absolute top-6 right-12  w-1/2 z-20 ">
              <li
                onClick={e => handleMedicamentoChangeStatus(e, 'activo')}
                className="cursor-pointer w-full border-b pl-2 font-li hover:bg-primary-150 rounded-md duration-200 hover:-translate-y-0.5"
              >
                activo
              </li>
              <li
                onClick={e => handleMedicamentoChangeStatus(e, 'finalizado')}
                className="cursor-pointer w-full border-b pl-2 font-light hover:bg-primary-150 rounded-md duration-200 hover:-translate-y-0.5"
              >
                finalizado
              </li>
              <li
                onClick={e => handleMedicamentoChangeStatus(e, 'pendiente')}
                className="cursor-pointer w-full border-b pl-2 font-light hover:bg-primary-150 rounded-md duration-200 hover:-translate-y-0.5"
              >
                pendiente
              </li>
            </ul>
          )}
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Dosis:</span> {dosis}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Frecuencia:</span> {frecuencia}
        </p>
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
