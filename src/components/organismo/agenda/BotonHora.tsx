import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useState } from 'react';

interface BotonHoraProps {
  slot: any;
  onClick: (hora: string) => void;
}

function BotonHora({ slot, onClick }: BotonHoraProps) {
  const [pulsado, setPulsado] = useState(false);

  return (
    <button
      onClick={() => {
        setPulsado(true);
        onClick(slot.hora);
        setTimeout(() => setPulsado(false), 300);
      }}
      className={`
          w-fit px-2 py-2 text-sm font-semibold rounded-md transition-all duration-200
          border-2 relative overflow-hidden
          ${pulsado ? 'scale-95' : 'scale-100'}
          ${pulsado
          ? 'bg-primary-100 border-[#cccccc70] shadow-md text-white'
          : 'bg-white border-[#cccccc50] shadow-xs text-primary-600 hover:text-primary-textoTitle hover:bg-primary-200/10 hover:border-primary-200'
        }
        `}
    >
      {formatUtcToAppTime(slot.hora, 'HH:mm')}

      {/* Efecto de ripple */}
      {pulsado && (
        <span className="absolute inset-0 bg-primary-200 opacity-30 animate-ping rounded-md" />
      )}
    </button>
  );
}

export default BotonHora;
