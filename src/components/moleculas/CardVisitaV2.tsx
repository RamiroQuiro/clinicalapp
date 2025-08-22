import formatDate from '@/utils/formatDate';
import { BriefcaseMedical, Calendar, Stethoscope } from 'lucide-react';

interface Atencion {
  id: string;
  fecha: string;
  motivoConsulta: string;
  medico: {
    nombreCompleto: string;
  };
}

interface CardVisitaProps {
  atencion: Atencion;
  onClick: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
}

export const CardVisitaV2 = ({ atencion, onClick }: CardVisitaProps) => {
  const { id, fecha, medico, motivoConsulta } = atencion;

  return (
    <div
      onClick={e => onClick(e, id)}
      className="flex flex-col flex-1 min-w-[200px] p-4 bg-primary-bg-componentes rounded-lg border border-gray-200 shadow-sm justify-between gap-2 relative text-primary-texto cursor-pointer hover:bg-primary-100/20 duration-200"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white border text-primary-textoTitle p-2 rounded-md">
            <Calendar size={20} />
          </div>
          <h3 className="text-primary-textoTitle font- truncate">Visita: {formatDate(fecha)}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope size={16} className="400" />
            <div className="flex items-center gap-2 text-sm">
              <p className="text-primary-textoTitle font-semibold">Médico:</p>
              <p className="text-primary-textoTitle   ">{medico.nombreCompleto}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BriefcaseMedical size={16} className="400" />
            <p className="text-primary-textoTitle font-semibold">Motivo:</p>
            <p className="text-primary-texto  ">{motivoConsulta}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
